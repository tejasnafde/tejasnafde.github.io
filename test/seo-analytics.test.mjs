import assert from "node:assert/strict";
import { existsSync } from "node:fs";
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
  assert.match(layout, /name="twitter:card" content="summary_large_image"/);
  assert.match(layout, /src="\/analytics\.js"/);
  assert.match(layout, /9db30c7f692044efb0df61682623a929/);
  assert.match(analytics, /acquisition_landing/);
  assert.match(analytics, /project_open/);
  assert.doesNotMatch(analytics, /cookie|localStorage|sessionStorage/i);
  // The referrer is reduced to a coarse source bucket; the URL itself is never sent.
  assert.doesNotMatch(analytics, /referrer\s*:/i);
});

test("the layout publishes a large social preview", async () => {
  const layout = await source("src/layouts/BaseLayout.astro");

  assert.match(layout, /name="twitter:card" content="summary_large_image"/);
  assert.match(layout, /property="og:image" content=\{socialImageUrl\}/);
  assert.match(layout, /property="og:image:width" content="1200"/);
  assert.match(layout, /property="og:image:height" content="630"/);
  assert.match(layout, /property="og:image:type" content="image\/png"/);
  assert.match(layout, /property="og:image:alt" content=\{socialImageAlt\}/);
  assert.match(layout, /name="twitter:title" content=\{title\}/);
  assert.match(layout, /name="twitter:description" content=\{description\}/);
  assert.match(layout, /name="twitter:image" content=\{socialImageUrl\}/);
  assert.match(layout, /name="twitter:image:alt" content=\{socialImageAlt\}/);
});

test("the social preview PNG is exactly 1200 by 630 pixels", async () => {
  const imageUrl = new URL("public/og-image.png", root);
  assert.equal(existsSync(imageUrl), true, "public/og-image.png must exist");

  const image = await readFile(imageUrl);
  assert.equal(image.subarray(1, 4).toString("ascii"), "PNG");
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
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

test("blog pages report the slug, a source bucket, reading time and scroll depth", async () => {
  const { blogSlug, scrollPercent, engagedSeconds, landingSource } = await import("../public/analytics.js");

  assert.equal(blogSlug("/blog/fastapi-twelve-dollar-server"), "fastapi-twelve-dollar-server");
  assert.equal(blogSlug("/blog/fastapi-twelve-dollar-server/"), "fastapi-twelve-dollar-server");
  assert.equal(blogSlug("/blog/"), null);
  assert.equal(blogSlug("/blog/Bad_Slug"), null);
  assert.equal(blogSlug("/"), null);

  assert.equal(scrollPercent(0, 1000, 200, 4000), 20);
  assert.equal(scrollPercent(5000, 1000, 200, 4000), 100);
  assert.equal(scrollPercent(0, 100, 500, 4000), 0);

  assert.equal(engagedSeconds(-5), 0);
  assert.equal(engagedSeconds(42_400), 42);
  assert.equal(engagedSeconds(10_000_000), 1800);

  assert.equal(landingSource("", "?ref=linkedin"), "linkedin");
  assert.equal(landingSource("https://www.linkedin.com/", ""), "linkedin");
});
