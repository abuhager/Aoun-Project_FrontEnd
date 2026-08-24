import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'production';
process.env.NEXT_PUBLIC_API_URL = 'https://api.aoun.example/';
process.env.BACKEND_URL = 'https://internal-api.aoun.example';

const configModule = await import(`../next.config.ts?test=${Date.now()}`);
const routeModule = await import('../src/config/routes.ts');
const cspModule = await import('../src/config/csp.ts');

test('يطبع API origins بشكل موحد ويرفض URL يحتوي مساراً', () => {
  assert.equal(
    configModule.normalizeBaseUrl('https://api.aoun.example/', 'API_URL'),
    'https://api.aoun.example'
  );
  assert.throws(
    () => configModule.normalizeBaseUrl('https://api.aoun.example/v1', 'API_URL'),
    /يجب ألا يحتوي مساراً/
  );
});

test('يوجه API rewrite إلى BACKEND_URL بدون شرطة مائلة مزدوجة', async () => {
  assert.deepEqual(await configModule.default.rewrites(), [{
    source: '/api/:path*',
    destination: 'https://internal-api.aoun.example/api/:path*',
  }]);
});

test('لا يعيد CSP ثابتاً من next.config ويضيف HSTS في production', async () => {
  const rules = await configModule.default.headers();
  const headers = rules[0].headers;
  assert.equal(headers.some(({ key }) => key === 'Content-Security-Policy'), false);
  assert.equal(headers.some(({ key }) => key === 'Strict-Transport-Security'), true);
});

test('يفصل المسارات المحمية ومسارات المصادقة عند حدود segment الصحيحة', () => {
  assert.equal(routeModule.isProtectedPath('/admin/settings'), true);
  assert.equal(routeModule.isProtectedPath('/administrator'), false);
  assert.equal(routeModule.isProtectedPath('/items/item-id'), false);
  assert.equal(routeModule.isProtectedPath('/items/item-id/edit'), true);
  assert.equal(routeModule.isAuthOnlyPath('/login/help'), true);
  assert.equal(routeModule.isAuthOnlyPath('/login-archive'), false);
  assert.equal(routeModule.isAuthSafeUrl('/api/auth/login'), true);
  assert.equal(routeModule.isAuthSafeUrl('/api/auth/login/anything'), false);
  assert.equal(routeModule.isAuthSafeUrl('/api/auth/reset-password'), true);
  assert.equal(routeModule.isAuthSafeUrl('/api/auth/reset-password/token-value'), false);
});

test('يقبل redirect داخلياً فقط بعد الدخول', () => {
  assert.equal(routeModule.getSafeRedirectPath('/profile?tab=security'), '/profile?tab=security');
  assert.equal(routeModule.getSafeRedirectPath('https://evil.example'), '/browse');
  assert.equal(routeModule.getSafeRedirectPath('//evil.example'), '/browse');
  assert.equal(routeModule.getSafeRedirectPath('/\\evil.example'), '/browse');
  assert.equal(routeModule.getSafeRedirectPath('/login'), '/browse');
});

test('ينشئ CSP nonce بدون unsafe-inline ويسمح بمصدر Socket العام', () => {
  const csp = cspModule.buildContentSecurityPolicy('unique-nonce');
  assert.match(csp, /'nonce-unique-nonce'/);
  assert.match(csp, /wss:\/\/api\.aoun\.example/);
  assert.doesNotMatch(csp, /'unsafe-inline'/);
  assert.match(csp, /upgrade-insecure-requests/);
});
