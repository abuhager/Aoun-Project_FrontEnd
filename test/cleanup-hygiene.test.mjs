import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");

test("تقارير الفحص ومخرجات البناء المحلية لا تدخل مستودع Frontend", async () => {
  const gitignore = await readFile(path.join(projectRoot, ".gitignore"), "utf8");

  assert.match(gitignore, /^lighthouse-\*\.html$/m);
  assert.match(gitignore, /^\*\.tsbuildinfo$/m);

  await assert.rejects(access(path.join(projectRoot, "lighthouse-mobile.html")));
});
