---
title: 'I doubled a FastAPI benchmark by taking FastAPI out of the request path'
date: '2026-10-19'
description: 'Profiling an entry in the $12 server challenge took it from 11,000 to 22,000 users. Most of the win came from one layer I didn''t expect.'
tags: ['python', 'fastapi', 'performance']
status: published
---

A few weeks ago Arjay ([arjaythedev](https://github.com/arjaythedev)) put out a video benchmarking the same small API in eight languages on a $12 DigitalOcean droplet, one shared vCPU and 2 GB of RAM. FastAPI landed near the bottom at about 2,150 users. Most of my work has been on Flask and FastAPI, so that stung a little. I emailed him to ask if I could have a go at it, and he pointed me to the challenge repo.

The rules there were a bit different from the video. Every entry had to use SQLite inside the app process instead of Postgres, and Nginx was optional. Someone had also already submitted a FastAPI version ([cknutson12's](https://github.com/arjaythedev/twelve-dollar-server-challenge/tree/main/submissions/python-fastapi-cknutson12)), and it was good: uvloop, httptools, orjson, no Pydantic models, JWT checked by hand, one process. All the usual tips were already in there.

So the real question was, where is the time even going once the obvious stuff is done?

## Measure before touching anything

I didn't want to pay for a droplet, so I ran everything on two GCE spot VMs. An `e2-small` as the server and a bigger box running [k6](https://k6.io). The whole project cost me about ₹80, roughly a dollar.

One thing to know about that setup: an `e2-small` can burst above its one core for a short time, then it gets throttled. My first tests were two minutes long and looked great, until one version that passed 15,000 users in two minutes failed the same load over five. Its CPU time per request had gone from 0.28 ms to 0.52 ms once the burst credit ran out. Arjay's rule is a five-minute hold for exactly this reason, so from then on I only trusted five-minute runs, and only compared versions that ran on the same VM in the same session.

Then I ran [py-spy](https://github.com/benfred/py-spy) on the server while k6 was hitting it, and the result surprised me. About **40% of the CPU time was spent inside FastAPI and Starlette**, just moving the request to the handler and the response back. The actual handlers were tiny, and the JWT check was under 1%.

## One layer at a time

Instead of rewriting anything, I took the existing code and removed one layer at a time, measuring CPU time per request at a fixed load after each step. That way every change has a number next to it.

| Step | Change | CPU per request |
|---|---|---|
| 0 | cknutson12's code as is | 0.447 ms |
| 1 | FastAPI telemetry off | no real change |
| 2 | Call the router directly, skip the middleware | about 2% less |
| 3 | Plain Starlette routes, so no FastAPI dependency solving | 0.330 ms (26% less) |
| 4 | Handlers as raw ASGI apps, no `Request` or `Response` objects | 0.287 ms (36% less) |

I went in thinking the middleware stack would be the expensive part, but it was close to free.

The real cost was step 3. Every `@app.get` creates an `APIRoute`, and an `APIRoute` runs `solve_dependencies` and parameter validation on every request, even when the handler takes a single string. Registering the same handlers as plain Starlette `Route`s on the same FastAPI router skips all of it.

Step 4 relies on a small Starlette detail: if an endpoint isn't a function, Starlette mounts it as a raw ASGI app and doesn't wrap it. So a tiny class is enough:

```python
class Endpoint:
    __slots__ = ("handler",)

    def __init__(self, handler):
        self.handler = handler

    async def __call__(self, scope, receive, send):
        response = await self.handler(scope, receive)
        await response(scope, receive, send)
```

The handlers read `scope["headers"]` and `scope["path_params"]` directly, and the response is two `send()` calls. The SQL, the auth logic and the server settings didn't change at all.

## What didn't work

**Granian.** Swapping uvicorn for Granian, a Rust HTTP server, made things slower: 0.384 ms per request against 0.311 ms. Granian is fast with its own RSGI interface, but its ASGI bridge costs more than uvicorn with httptools. It also has a nasty default. Its `backpressure` equals the socket backlog, 4,096, so with more open keep-alive connections than that, requests just hang until k6 gives up after 60 seconds. Nothing logs an error, so it's easy to miss.

**Building the JSON in SQLite.** SQLite can return the whole response with `json_object` and `group_concat`, and the bytes came out identical. Once I added the `ORDER BY` that guarantees the row order, it saved about 2.6 µs per feed request, which is around 0.25% of the total. Not worth the odd SQL. Funnily enough, several of the fastest entries in other languages used exactly this trick, so it clearly pays off more when your JSON encoder isn't orjson.

**Tuning the SQL.** Before blaming the framework, I checked whether the database had anything left to give. It didn't. The feed query was already using the right indexes, and even a version that skipped the author join and the like count (which the spec doesn't allow) was only about 11 µs faster. Here the database was already doing its part, and the time was going somewhere else.

## The result

Arjay ran every submission on his real droplet. The original FastAPI entry handled 11,000 users. Mine handled 22,000, with CPU at 91%, p95 at 353 ms and p99 at 653 ms. At 23,000 it fell over the same way the original did, just later. In [the video](https://www.youtube.com/watch?v=QGWKCaglSBI) he called it "one of the most interesting results from this entire experiment", which made my week. The code is in [PR #10](https://github.com/arjaythedev/twelve-dollar-server-challenge/pull/10).

For context, the winning Rust entry hit 64,000 users with half the CPU still free, using io_uring and its own event loop. Python isn't winning this, but 2x on the same box without changing a single query is a result I'm happy with.

## Would I ship this?

Not like this. Once handlers read raw ASGI scopes and build their own responses, you've given up most of the reasons you picked FastAPI: validation, docs, dependency injection.

What I'd take back to a real codebase is the habit, not the hack. Profile first, then change one thing at a time and measure each step. My guess was the middleware, and it was close to free. Without the profile I would have spent hours on the wrong layer.

It also changed how I think about framework overhead. In most services the database or the network takes far longer than FastAPI's dependency solving, so it never shows up. On one core doing nothing but sub-millisecond SQLite queries, it was 40% of the CPU. Whether it matters depends on how much real work each request does, and the only way to know is to measure.

Thanks to [Arjay](https://github.com/arjaythedev) for running the challenge, and to [cknutson12](https://github.com/cknutson12), whose code I started from.
