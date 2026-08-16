import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const layout = await readFile(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
const globalCss = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');

test('shared layout provides a keyboard skip link', () => {
  assert.match(layout, /<a href="#main-content" class="skip-link">Skip to main content<\/a>/);
  assert.match(layout, /<main id="main-content" tabindex="-1">/);
  assert.match(layout, /\.skip-link:focus-visible \{/);
});

test('manual theme updates browser color metadata', () => {
  assert.match(layout, /<meta name="theme-color" content="#F7F6F4" \/>/);
  assert.match(layout, /document\.documentElement\.style\.colorScheme = t;/);
  assert.match(layout, /document\.querySelector\('meta\[name="theme-color"\]'\)\.content = t === 'dark' \? '#0A0A0C' : '#F7F6F4';/);
  assert.match(layout, /document\.documentElement\.style\.colorScheme = next;/);
});

test('site interactions and anchors support touch and fixed navigation', () => {
  assert.match(globalCss, /a,\s*button \{[\s\S]*?touch-action: manipulation;/);
  assert.match(globalCss, /section\[id\],\s*main\[id\] \{\s*scroll-margin-top: 72px;/);
});
