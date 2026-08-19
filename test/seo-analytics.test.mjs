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
  assert.match(layout, /9db30c7f692044efb0df61682623a929/);
  assert.match(analytics, /acquisition_landing/);
  assert.match(analytics, /project_open/);
  assert.doesNotMatch(analytics, /cookie|localStorage|sessionStorage|referrer/i);
});

test("the portfolio identifies Tejas Nafde as the person behind the site", async () => {
  const [layout, homepage] = await Promise.all([
    source("src/layouts/BaseLayout.astro"),
    source("src/pages/index.astro"),
  ]);

  assert.match(
    layout,
    /Tejas Nafde is a software engineer in Bengaluru building backend systems, real-time infrastructure, and developer tools\./,
  );
  assert.match(layout, /['"]@type['"]:\s*['"]Person['"]/);
  assert.match(layout, /name:\s*['"]Tejas Nafde['"]/);
  assert.match(layout, /https:\/\/github\.com\/tejasnafde/);
  assert.match(layout, /https:\/\/www\.linkedin\.com\/in\/tejas-nafde\//);
  assert.match(homepage, /personSchema/);
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
