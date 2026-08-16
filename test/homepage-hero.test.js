import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8');

test('hero states the agreed engineering focus and current role', () => {
  assert.match(
    source,
    /I build backend systems, real-time infrastructure, and developer tools\.\s+Currently at <a[^>]+>GeoIQ<\/a>, a Lenskart company\.\s+BITS Pilani Goa alumnus\./,
  );
});

test('hero links to selected work before external profile links', () => {
  assert.match(
    source,
    /<div class="hero-links">\s+<a href="#projects">selected work<\/a>\s+<a href="https:\/\/github\.com\/tejasnafde"/,
  );
});

test('hero links use compact spacing on narrow screens', () => {
  assert.match(
    source,
    /@media \(max-width: 560px\) \{[\s\S]*?\.hero-links \{\s+gap: var\(--sp-2\);\s+\}/,
  );
});
