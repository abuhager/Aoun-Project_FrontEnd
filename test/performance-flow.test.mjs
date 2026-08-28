import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), 'utf8');

test('المكونات الثقيلة لا تدخل حزمة الزائر وتُحمّل عند الحاجة فقط', async () => {
  const [socketContext, levelGate, navbar] = await Promise.all([
    readSource('../src/context/SocketContext.tsx'),
    readSource('../src/components/LevelGate.tsx'),
    readSource('../src/components/Navbar/index.tsx'),
  ]);

  assert.match(socketContext, /await import\("socket\.io-client"\)/);
  assert.doesNotMatch(socketContext, /import\s*\{\s*io[,}]/);

  assert.match(levelGate, /dynamic\(\(\) => import\('\.\/PhoneVerifyModal'\)/);
  assert.match(levelGate, /phoneVerificationEnabled && showModal/);
  assert.doesNotMatch(levelGate, /import PhoneVerifyModal from/);

  assert.match(navbar, /dynamic\(\(\) => import\("@\/components\/NotificationBell"\)/);
  assert.match(navbar, /import\("@\/components\/ConversationsDrawer"\)/);
});

test('Navbar يطلب عداد المحادثات الخفيف ويركب جرساً واحداً فقط', async () => {
  const [navbar, api] = await Promise.all([
    readSource('../src/components/Navbar/index.tsx'),
    readSource('../src/lib/api/conversationApi.ts'),
  ]);

  assert.match(navbar, /getConversationUnreadCount\(\)/);
  assert.doesNotMatch(navbar, /listConversations/);
  assert.equal((navbar.match(/<NotificationBell\s*\/>/g) || []).length, 1);
  assert.equal((navbar.match(/onClick=\{openChatInbox\}/g) || []).length, 1);

  assert.match(api, /export async function getConversationUnreadCount/);
  assert.match(api, /['"]\/api\/conversations\/unread-count['"]/);
});
