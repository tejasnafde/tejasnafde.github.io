import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const start = source.indexOf('const stack = [');
const end = source.indexOf('];', start) + 2;
assert.notEqual(start, -1, 'Missing stack data');
const stack = source.slice(start, end);

test('stack uses the approved categories and exact items', () => {
  const expected = [
    "{ group: 'Languages', items: ['Python', 'TypeScript', 'SQL'] }",
    "{ group: 'Backend', items: ['FastAPI', 'Flask', 'Node.js', 'WebSockets'] }",
    "{ group: 'Data', items: ['PostgreSQL/PostGIS', 'BigQuery', 'MongoDB', 'Redis', 'SQLite'] }",
    "{ group: 'Infrastructure', items: ['GCP', 'Cloud Run', 'Pub/Sub', 'Airflow', 'Docker', 'Linux'] }",
    "{ group: 'AI', items: ['Gemini', 'Vertex AI'] }",
  ];

  let previous = -1;
  for (const row of expected) {
    const position = stack.indexOf(row);
    assert.ok(position > previous, `Missing or misplaced row: ${row}`);
    previous = position;
  }
  assert.equal((stack.match(/\{ group:/g) || []).length, expected.length);
});

test('stack omits rejected categories and tools', () => {
  for (const rejected of ['Frontend', 'Quality', 'Firestore', 'pytest', 'Vitest', 'OpenTelemetry', 'React Native']) {
    assert.ok(!stack.includes(rejected), `Rejected stack item found: ${rejected}`);
  }
});

test('stack reserves enough space for the Infrastructure label', () => {
  assert.match(source, /\.stack-row \{[\s\S]*?grid-template-columns: 120px minmax\(0, 1fr\);/);
});
