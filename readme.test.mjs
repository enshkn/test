import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const readmePath = join(process.cwd(), "README.md");

test("README.md exists at project root", () => {
  assert.ok(existsSync(readmePath), "README.md should exist at project root");
});

test("README.md is non-empty and describes the project", () => {
  const content = readFileSync(readmePath, "utf8").trim();
  assert.ok(content.length > 0, "README.md should not be empty");
  assert.match(content, /# /, "README.md should have a heading");
});
