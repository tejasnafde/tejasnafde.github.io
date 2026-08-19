import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("the layout publishes canonical social metadata and anonymous analytics", async () => {
  const layout = await source("src/layouts/BaseLayout.astro");
  const analytics = await source("public/analytics.js");
  assert.match(layout, /rel="canonical"/);
  assert.match(layout, /property="og:title"/);
  assert.match(layout, /property="og:url"/);
  assert.match(layout, /name="twitter:card" content="summary"/);
  assert.match(layout, /src="\/analytics\.js"/);
  assert.match(analytics, /acquisition_landing/);
  assert.match(analytics, /project_open/);
  assert.doesNotMatch(analytics, /cookie|localStorage|sessionStorage|referrer/i);
});

test("the apex publishes crawler and agent discovery files", async () => {
  const [robots, llms] = await Promise.all([
    source("public/robots.txt"),
    source("public/llms.txt"),
  ]);
  assert.match(robots, /User-agent: GPTBot\nDisallow: \//);
  assert.match(robots, /User-agent: Claude-SearchBot\nAllow: \//);
  assert.match(robots, /Sitemap: https:\/\/tn07\.dev\/sitemap-index\.xml/);
  assert.match(llms, /^# Tejas Nafde$/m);
  assert.match(llms, /https:\/\/tn07\.dev\//);
});
