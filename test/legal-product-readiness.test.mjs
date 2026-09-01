import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(path, "utf8");

test("صفحات الخصوصية والشروط عامة ومربوطة من التذييل", async () => {
  const [footer, privacy, terms] = await Promise.all([
    read("src/components/Footer.tsx"),
    read("src/app/(main)/privacy/page.tsx"),
    read("src/app/(main)/terms/page.tsx"),
  ]);

  assert.match(footer, /href="\/privacy"/);
  assert.match(footer, /href="\/terms"/);
  assert.match(privacy, /سياسة الخصوصية/);
  assert.match(terms, /شروط الاستخدام/);
  assert.match(privacy, /aoun\.help\.center@gmail\.com/);
  assert.match(terms, /aoun\.help\.center@gmail\.com/);
});

test("واجهة المنتج لا تعرض نصوص placeholder الإنجليزية أو ادعاء إدارة المراكز", async () => {
  const [card, hubs] = await Promise.all([
    read("src/components/ui/ItemCard.tsx"),
    read("src/app/(main)/hubs/HubsExplorer.tsx"),
  ]);

  assert.doesNotMatch(card, /AOUN ITEM/);
  assert.doesNotMatch(hubs, /مواقع يديرها فريق المنصة/);
  assert.match(hubs, /تجريبية/);
});
