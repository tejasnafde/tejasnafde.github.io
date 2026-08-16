import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8');

function between(start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(startIndex, -1, `Missing start marker: ${start}`);
  assert.notEqual(endIndex, -1, `Missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test('featured work uses the approved product order and destinations', () => {
  const featured = between('const featuredWork = [', 'const projects = [');
  const expected = [
    ['Switchboard', 'switchboard.tn07.dev'],
    ['Someday', 'someday.tn07.dev'],
    ['Scout', 'scout.tn07.dev'],
    ['WatchWithMi', 'watchwithmi.tn07.dev'],
  ];

  let previous = -1;
  for (const [name, host] of expected) {
    const position = featured.indexOf(`name: '${name}'`);
    assert.ok(position > previous, `${name} must follow the approved featured order`);
    assert.match(featured, new RegExp(`name: '${name}'[\\s\\S]*?host: '${host.replaceAll('.', '\\.')}'`));
    previous = position;
  }
});

test('fun sites render only in a later section', () => {
  const featured = between('const featuredWork = [', 'const funSites = [');
  for (const name of ['Follymarket', 'Board Games', 'Marvel Syllabus']) {
    assert.doesNotMatch(featured, new RegExp(`name: '${name}'`));
  }

  const writing = source.indexOf('<!-- Recent Posts -->');
  const fun = source.indexOf('<h2>For fun</h2>');
  const contact = source.indexOf('<!-- Contact -->');
  assert.ok(writing < fun && fun < contact, 'For fun must follow Writing and precede Contact');
});

test('more engineering work contains personalized Learnlang copy', () => {
  const projects = between('const projects = [', 'const stack = [');
  assert.match(projects, /name: 'learnlang',[\s\S]*?description: 'A personalized voice tutor\./);
  assert.doesNotMatch(projects, /voice tutor for one user/i);
});

test('Learnlang is a non-clickable coming soon project', () => {
  const projects = between('const projects = [', 'const stack = [');
  const learnlang = projects.match(/name: 'learnlang',[\s\S]*?\n  },/);

  assert.ok(learnlang, 'Missing Learnlang project');
  assert.match(learnlang[0], /tech: \['Python', 'Vertex AI', 'Speech'\]/);
  assert.match(learnlang[0], /link: null/);
  assert.match(learnlang[0], /status: 'coming-soon'/);
  assert.doesNotMatch(learnlang[0], /github\.com\/tejasnafde\/learnlang/);
});

test('research credit links to the professor profile', () => {
  const projects = between('const projects = [', 'const stack = [');
  assert.match(
    projects,
    /name: 'Unetsim-Routing',[\s\S]*?noteUrl: 'https:\/\/www\.bits-pilani\.ac\.in\/goa\/sarang-chandrashekhar-dhongdi\/'/,
  );
  assert.match(source, /p\.noteUrl \? \(\s*<a href=\{p\.noteUrl\}[^>]*class="card-note">\{p\.note\}<\/a>/);
});

test('project markup uses featured rows and a separate fun directory', () => {
  assert.match(source, /<div class="featured-list">[\s\S]*?featuredWork\.map/);
  assert.match(source, /<div class="fun-list">[\s\S]*?funSites\.map/);
});

test('featured icons load eagerly only for the first visible project', () => {
  assert.match(source, /class="featured-icon"[\s\S]*?loading=\{i === 0 \? 'eager' : 'lazy'\}/);
});
