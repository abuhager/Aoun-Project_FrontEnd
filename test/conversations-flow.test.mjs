import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readSource = (relativePath) => readFile(new URL(relativePath, import.meta.url), 'utf8');

test('واجهة فتح المحادثة ترسل itemId فقط وتترك تحديد الطرفين للـBackend', async () => {
  const [api, itemPage, dashboard] = await Promise.all([
    readSource('../src/lib/api/conversationApi.ts'),
    readSource('../src/app/(main)/items/[id]/ItemDetailsClient.tsx'),
    readSource('../src/app/(main)/(protected)/dashboard/PageClient.tsx'),
  ]);

  assert.match(api, /post<ApiEnvelope<OpenConversationData>>/);
  assert.match(api, /\{ itemId \}/);
  assert.doesNotMatch(api, /donorId|targetUserId/);
  assert.match(itemPage, /openConversation\(item\._id\)/);
  assert.match(dashboard, /openConversation\(item\._id\)/);
});

test('ChatDrawer يقبل conversationId صريحاً ولا يرجع إلى itemId', async () => {
  const source = await readSource('../src/components/ChatDrawer/index.tsx');

  assert.match(source, /conversationId:\s*string/);
  assert.match(source, /useChatRoom\(\{ conversationId:/);
  assert.doesNotMatch(source, /finalConvId|itemId\?:|convId\?:/);
  assert.match(source, /maxLength=\{2_000\}/);
  assert.match(source, /هذه المحادثة للقراءة فقط لأن الحجز لم يعد قائماً/);
});

test('Hook المحادثة يعاود الانضمام بعد reconnect ويعتمد ACK موحداً', async () => {
  const source = await readSource('../src/hooks/useChatRoom.ts');

  assert.match(source, /socket\.on\("connect", joinRoom\)/);
  assert.match(source, /socket\.emit\(SOCKET_EVENTS\.JOIN_ROOM[\s\S]*JoinRoomAck/);
  assert.match(source, /response\.conversationId !== conversationId/);
  assert.match(source, /canSend:\s*response\.canSend !== false/);
  assert.doesNotMatch(source, /room_joined/);
});

test('الرسائل المتفائلة تُسوّى عبر correlationId ولا تبقى نسخة مكررة', async () => {
  const source = await readSource('../src/hooks/useChatRoom.ts');

  assert.match(source, /createCorrelationId/);
  assert.match(source, /replaceOptimistic/);
  assert.match(source, /pendingRef\.current/);
  assert.match(source, /message\.correlationId !== correlationId/);
  assert.match(source, /SEND_TIMEOUT_MS/);
});

test('المحادثة المفتوحة تؤكد القراءة فور وصول رسالة من الطرف الآخر', async () => {
  const [hook, socketTypes] = await Promise.all([
    readSource('../src/hooks/useChatRoom.ts'),
    readSource('../src/types/socket.types.ts'),
  ]);

  assert.match(hook, /senderId\(message\) !== user\?\._id/);
  assert.match(hook, /socket\.emit\(SOCKET_EVENTS\.MARK_READ/);
  assert.match(socketTypes, /SOCKET_EVENTS\.MARK_READ/);
  assert.match(socketTypes, /readBy:\s*string/);
});

test('السجل يدعم تحميل الصفحات الأقدم دون تغيير آخر رسالة', async () => {
  const [hook, drawer, api] = await Promise.all([
    readSource('../src/hooks/useChatRoom.ts'),
    readSource('../src/components/ChatDrawer/index.tsx'),
    readSource('../src/lib/api/conversationApi.ts'),
  ]);

  assert.match(hook, /getConversationMessages\(conversationId, nextPage/);
  assert.match(hook, /mergeMessages\(response\.messages, current\.messages\)/);
  assert.match(drawer, /تحميل رسائل أقدم/);
  assert.match(api, /params:\s*\{ page \}/);
});

test('قائمة المحادثات تستخدم عقد API typed وتحدّث العداد بعد أحداث Socket', async () => {
  const source = await readSource('../src/components/ConversationList/index.tsx');

  assert.match(source, /useSWR<ConversationListItem\[\]>/);
  assert.match(source, /listConversations\(\)/);
  assert.match(source, /markConversationRead\(secureId\)/);
  assert.match(source, /SOCKET_EVENTS\.CONVERSATION_UPDATED/);
  assert.doesNotMatch(source, /Record<string, unknown>|responseData|normalized/);
});

test('إشعار الرسالة يفتح المحادثة المطلوبة ويستخدم notification:new الموحد', async () => {
  const [bell, navbarView, navbarController, notifications] = await Promise.all([
    readSource('../src/components/NotificationBell.tsx'),
    readSource('../src/components/Navbar/index.tsx'),
    readSource('../src/components/Navbar/useNavbarController.ts'),
    readSource('../src/hooks/useNotifications.ts'),
  ]);
  const navbar = `${navbarView}\n${navbarController}`;

  assert.match(bell, /aoun:open-conversation/);
  assert.match(bell, /notification\.conversationId/);
  assert.match(navbar, /initialConversationId=\{requestedConversationId\}/);
  assert.match(notifications, /socket\.on\(SOCKET_EVENTS\.NOTIFICATION_NEW/);
  assert.match(notifications, /socket\.on\(SOCKET_EVENTS\.NOTIFICATION_REFRESH/);
  assert.doesNotMatch(navbar, /notification_new/);
});

test('SocketContext يحتفظ باتصال واحد typed ولا ينشئ اتصالاً داخل مكونات الشات', async () => {
  const [context, chatDrawer, conversationList] = await Promise.all([
    readSource('../src/context/SocketContext.tsx'),
    readSource('../src/components/ChatDrawer/index.tsx'),
    readSource('../src/components/ConversationList/index.tsx'),
  ]);

  assert.match(context, /type AounSocket = Socket<ServerToClientEvents, ClientToServerEvents>/);
  assert.match(context, /socketRef = useRef<AounSocket \| null>/);
  assert.doesNotMatch(chatDrawer, /socket\.io-client|\bio\(/);
  assert.doesNotMatch(conversationList, /socket\.io-client|\bio\(/);
});
