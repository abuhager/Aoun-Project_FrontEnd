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

test("مكونات Dashboard تشارك نوع التسليم ولا تعتمد على Hook كمصدر لنوع Item", async () => {
  const directory = "src/app/(main)/(protected)/dashboard";
  const components = await readFile(path.join(projectRoot, directory, "components/dashboardItem.types.ts"), "utf8");
  const hooks = await readFile(path.join(projectRoot, directory, "hooks/dashboard.types.ts"), "utf8");
  assert.match(components, /import type \{ Item \} from "@\/types\/item\.types"/);
  assert.match(components, /import type \{ DeliveryState \} from "\.\.\/hooks\/dashboard\.types"/);
  assert.doesNotMatch(components, /(?:interface|type) DeliveryState\b/);
  assert.match(hooks, /export interface DeliveryState/);
});

test("اختبار التبرع ينتظر ردود عمليات POST المحددة دون انتظار زمني ثابت", async () => {
  const spec = await readFile(path.join(projectRoot, "tests/donation-flow.spec.ts"), "utf8");
  assert.doesNotMatch(spec, /waitForTimeout|console\.(?:log|debug)/);
  assert.match(spec, /response\.request\(\)\.method\(\) === "POST"/);
  assert.match(spec, /const offerResponsePromise = page\.waitForResponse/);
  assert.match(spec, /const acceptanceResponsePromise = page\.waitForResponse/);
  assert.match(spec, /expect\(offerResponse\.status\(\), await offerResponse\.text\(\)\)\.toBe\(201\)/);
});
