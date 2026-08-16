import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const start = source.indexOf('<!-- Contact -->');
const end = source.indexOf('</BaseLayout>', start);
assert.notEqual(start, -1, 'Missing Contact section');
assert.notEqual(end, -1, 'Missing Contact section end');
const contact = source.slice(start, end);

test('contact uses the approved message', () => {
  assert.match(contact, /<h2 class="contact-title">Let's talk\.<\/h2>/);
  assert.match(
    contact,
    /<p class="contact-desc">Have an interesting engineering problem, a useful product idea, or a role with real ownership\? Send me a note\.<\/p>/,
  );
});

test('contact keeps email as its only action', () => {
  assert.equal((contact.match(/<a /g) || []).length, 1);
  assert.match(contact, /href="mailto:nafdetejas@gmail\.com"/);
  assert.doesNotMatch(contact, /github|linkedin|resume/i);
});
