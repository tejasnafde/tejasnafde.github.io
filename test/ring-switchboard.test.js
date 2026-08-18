import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../public/ring.js", import.meta.url),
  "utf8",
);

test("the shared ring includes the canonical Switchboard site", () => {
  assert.match(
    source,
    /\{ host: 'switchboard\.tn07\.dev',\s+name: 'Switchboard',\s+cat: 'tools',[\s\S]*?icon: 'switchboard\.png' \}/,
  );
});

test("the ring excludes the current hostname from recommendations", () => {
  assert.match(
    source,
    /filter\(function \(o\) \{ return o\.a\.host !== here && !o\.a\.soon; \}\)/,
  );
});
