import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readSource = (relativePath) => readFile(new URL(relativePath, import.meta.url), 'utf8');

test('Flow 9 يحتفظ باتصال Socket واحد داخل Provider تابع للمصادقة', async () => {
  const [context, layout] = await Promise.all([
    readSource('../src/context/SocketContext.tsx'),
    readSource('../src/app/layout.tsx'),
  ]);

  assert.equal((context.match(/\bio\(SOCKET_URL/g) || []).length, 1);
  assert.match(context, /socketRef = useRef<AounSocket \| null>/);
  assert.match(layout, /<AuthProvider>[\s\S]*<SocketProvider>/);
  assert.doesNotMatch(context, /localStorage|sessionStorage/);
});

test('تدوير Access Token يفرض handshake جديد ولا يترك اتصالاً بهوية قديمة', async () => {
  const context = await readSource('../src/context/SocketContext.tsx');

  assert.match(context, /const tokenChanged = activeTokenRef\.current !== token/);
  assert.match(context, /current\.auth = \{ token \}/);
  assert.match(context, /current\.disconnect\(\)\.connect\(\)/);
  assert.match(context, /subscribeAccessToken\(connectWithToken\)/);
});

test('الواجهة تجدد التوكن الاستباقي وتعالج الحظر وإنهاء الجلسة فوراً', async () => {
  const [context, auth] = await Promise.all([
    readSource('../src/context/SocketContext.tsx'),
    readSource('../src/context/AuthContext.tsx'),
  ]);

  assert.match(context, /SOCKET_EVENTS\.AUTH_TOKEN_EXPIRING/);
  assert.match(context, /SOCKET_EVENTS\.AUTH_TOKEN_EXPIRED/);
  assert.match(context, /SOCKET_EVENTS\.AUTH_FORCED_LOGOUT/);
  assert.match(context, /refreshSocketSession/);
  assert.match(context, /invalidateSession\(reason\)/);
  assert.match(auth, /const invalidateSession = useCallback/);
  assert.match(auth, /clearLocalSession\(\)/);
});

test('الاتصال يعاود المحاولة دون سقف ويعرض حالة قابلة للمراقبة وإعادة الاتصال', async () => {
  const context = await readSource('../src/context/SocketContext.tsx');

  assert.match(context, /reconnectionAttempts: Number\.POSITIVE_INFINITY/);
  assert.match(context, /type SocketStatus = "idle" \| "connecting" \| "connected" \| "reconnecting" \| "error"/);
  assert.match(context, /lastError/);
  assert.match(context, /reconnect:/);
  assert.match(context, /window\.addEventListener\("online"/);
});

test('عقد الأحداث typed يستخدم المصدر المركزي ويطابق payload تحديث المتصدرين', async () => {
  const [events, types] = await Promise.all([
    readSource('../src/config/socket.ts'),
    readSource('../src/types/socket.types.ts'),
  ]);

  assert.match(events, /AUTH_FORCED_LOGOUT: "auth:forced_logout"/);
  assert.match(events, /SOCKET_READY: "socket:ready"/);
  assert.match(types, /\[SOCKET_EVENTS\.LEADERBOARD_UPDATE\]: \(data: \{ userId: string \}\)/);
  assert.doesNotMatch(types, /booking:waitlist|booking:available|booking:confirmed/);
});

test('الشاشات تعيد المزامنة فقط عندما يفشل Connection State Recovery', async () => {
  const sources = await Promise.all([
    readSource('../src/app/(main)/items/[id]/hooks/useItemDetails.ts'),
    readSource('../src/app/(main)/(protected)/dashboard/hooks/useDashboard.ts'),
    readSource('../src/app/(main)/(protected)/leaderboard/hooks/useLeaderboard.ts'),
    readSource('../src/components/ConversationList/useConversationListController.ts'),
    readSource('../src/components/Navbar/useNavbarController.ts'),
  ]);

  for (const source of sources) {
    assert.match(source, /socket\.recovered/);
    assert.match(source, /socket\.on\("connect", resyncAfterReconnect\)/);
    assert.match(source, /socket\.off\("connect", resyncAfterReconnect\)/);
  }
});
