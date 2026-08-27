import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('لا يحفظ AuthContext بيانات المستخدم في cookie قابلة للتعديل', async () => {
  const source = await readSource('../src/context/AuthContext.tsx');
  assert.doesNotMatch(source, /aoun_user|saveUserCookie|loadUserCookie/);
  assert.match(source, /setUserState\(data\.user\)/);
});

test('حسابات Demo تُدار من بيئة السيرفر ولا تحتوي بيانات اعتماد ثابتة', async () => {
  const srcRoot = new URL('../src/', import.meta.url);
  const paths = (await readdir(srcRoot, { recursive: true }))
    .filter((path) => typeof path === 'string' && /\.(?:ts|tsx|js|jsx|mjs)$/.test(path));
  const source = (await Promise.all(
    paths.map((path) => readFile(new URL(path, srcRoot), 'utf8'))
  )).join('\n');
  const serverConfig = await readSource('../src/config/demoAccounts.server.ts');
  const page = await readSource('../src/app/(auth)/login/page.tsx');
  const client = await readSource('../src/app/(auth)/login/LoginClient.tsx');

  assert.doesNotMatch(source, /1870547aA|admin@aoun\.jo|donor@gmail\.com|sara@student\.ju\.edu\.jo/);
  assert.doesNotMatch(source, /NEXT_PUBLIC_DEMO/);
  assert.match(serverConfig, /import "server-only"/);
  assert.match(serverConfig, /process\.env\.DEMO_LOGIN_ENABLED !== "true"/);
  assert.match(page, /export const dynamic = "force-dynamic"/);
  assert.match(page, /getDemoAccounts\(\)/);
  assert.match(client, /demoAccounts\.length > 0/);
  assert.match(client, /fillDemoCredentials\(account\.email, account\.password\)/);
});

test('التحقق من كلمة المرور يطابق عقد Backend', async () => {
  const { isStrongPassword } = await import('../src/lib/validation/auth.ts');
  assert.equal(isStrongPassword('Short1'), false);
  assert.equal(isStrongPassword('alllowercase1'), false);
  assert.equal(isStrongPassword('ValidPass1'), true);
});

test('تهيئة Firebase تتم عند الاستخدام وليس عند import', async () => {
  const source = await readSource('../src/lib/firebase.ts');
  assert.match(source, /export function getFirebaseAuth/);
  assert.doesNotMatch(source, /export const firebaseAuth/);
});

test('واجهة رفع المستوى بالهاتف مغلقة افتراضياً', async () => {
  const features = await readSource('../src/config/features.ts');
  const levelGate = await readSource('../src/components/LevelGate.tsx');
  assert.match(features, /NEXT_PUBLIC_PHONE_VERIFICATION_ENABLED === 'true'/);
  assert.match(levelGate, /phoneVerificationEnabled &&/);
  assert.match(levelGate, /متوقف مؤقتاً/);
});
