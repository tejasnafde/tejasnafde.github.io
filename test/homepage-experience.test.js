import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8');

function experienceSource() {
  const start = source.indexOf('const experience = {');
  const end = source.indexOf('const featuredWork = [', start);
  assert.notEqual(start, -1, 'Experience must use one company object');
  assert.notEqual(end, -1, 'Featured work must follow experience data');
  return source.slice(start, end);
}

test('experience presents one company with the promotion first', () => {
  const experience = experienceSource();
  assert.match(experience, /company: 'GeoIQ'/);
  assert.match(experience, /period: 'Jan 2025 - Present'/);

  const engineer = experience.indexOf("role: 'Software Development Engineer'");
  const intern = experience.indexOf("role: 'Software Development Engineer Intern'");
  assert.ok(engineer > -1 && engineer < intern, 'Current role must appear before the internship');
});

test('experience groups nine outcomes under the approved themes', () => {
  const experience = experienceSource();
  for (const group of ['AI and developer systems', 'Data and product platforms', 'Automation and operations']) {
    assert.match(experience, new RegExp(`name: '${group}'`));
  }
  assert.equal((experience.match(/highlights: \[/g) || []).length, 3);
  assert.equal((experience.match(/^\s{8}'/gm) || []).length, 9);
});

test('experience keeps the approved evidence metrics', () => {
  const experience = experienceSource();
  for (const metric of ['88%', '3x faster', 'days to hours', '94-96%', '80%+', '30 seconds to 5 minutes', 'three production applications']) {
    assert.ok(experience.includes(metric), `Missing approved metric: ${metric}`);
  }
});

test('experience renders a role timeline and grouped impact grid', () => {
  assert.match(source, /<div class="role-timeline">[\s\S]*?experience\.roles\.map/);
  assert.match(source, /<div class="impact-grid">[\s\S]*?experience\.groups\.map/);
});
