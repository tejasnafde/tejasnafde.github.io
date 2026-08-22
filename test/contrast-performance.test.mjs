import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const source = (path) => readFile(new URL(path, root), 'utf8');

function selectorUsesDecorativeInk(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${escaped}\\s*\\{[^}]*color:\\s*var\\(--ink-3\\)`, 's').test(css);
}

test('readable secondary text never uses the decorative ink token', async () => {
  const [homepage, layout, blogIndex, blogPost] = await Promise.all([
    source('src/pages/index.astro'),
    source('src/layouts/BaseLayout.astro'),
    source('src/pages/blog/index.astro'),
    source('src/layouts/BlogPost.astro'),
  ]);

  for (const [css, selector] of [
    [homepage, '.section-lede'],
    [homepage, '.featured-host,\n  .fun-host'],
    [homepage, '.experience-note'],
    [homepage, '.experience-period,\n  .role-period'],
    [homepage, '.card-gh'],
    [layout, '.footer-left'],
    [blogIndex, '.empty'],
    [blogPost, '.post-content :global(blockquote)'],
  ]) {
    assert.equal(selectorUsesDecorativeInk(css, selector), false, `${selector} must use readable ink`);
  }
});

test('critical typography and styles stay on the first-party render path', async () => {
  const [layout, config, tokens, globalStyles] = await Promise.all([
    source('src/layouts/BaseLayout.astro'),
    source('astro.config.mjs'),
    source('public/design/tokens.css'),
    source('src/styles/global.css'),
  ]);

  assert.doesNotMatch(layout, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
  assert.match(layout, /@fontsource-variable\/dm-sans\/wght\.css/);
  assert.match(layout, /@fontsource-variable\/jetbrains-mono\/wght\.css/);
  assert.match(layout, /dm-sans-latin-wght-normal\.woff2\?url/);
  assert.match(layout, /rel="preload" as="font" type="font\/woff2"/);
  assert.match(layout, /import tokensCss from '\.\.\/\.\.\/public\/design\/tokens\.css\?raw'/);
  assert.doesNotMatch(layout, /node:fs/);
  assert.doesNotMatch(layout, /<link rel="stylesheet" href="\/design\/tokens\.css"/);
  assert.match(config, /inlineStylesheets:\s*'always'/);
  assert.match(tokens, /--font-body:\s*'DM Sans Variable'/);
  assert.match(tokens, /--font-mono:\s*'JetBrains Mono Variable'/);
  assert.match(globalStyles, /--font-body:\s*'DM Sans Variable'/);
  assert.match(globalStyles, /--font-mono:\s*'JetBrains Mono Variable'/);
});
