import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('public profile consumes the backend donations/received/rating contract', async () => {
  const [hook, page, types] = await Promise.all([
    readSource('../src/app/(main)/(protected)/profile/[id]/hooks/usePublicProfile.ts'),
    readSource('../src/app/(main)/(protected)/profile/[id]/PageClient.tsx'),
    readSource('../src/types/user.types.ts'),
  ]);

  assert.match(hook, /profileData\?\.donations/);
  assert.match(hook, /profileData\?\.received/);
  assert.match(hook, /averageRating/);
  assert.match(page, /renderStars\(averageRating\)/);
  assert.match(page, /<PaginationControls/);
  assert.match(page, /totalPages={totalPages}/);
  assert.doesNotMatch(page, /wa\.me|user\.whatsapp/);
  assert.match(types, /averageRating:\s+number/);
});

test('profile password and avatar checks match the backend contract', async () => {
  const [editPage, editProfileHeader, editProfileHook, publicProfileHook] = await Promise.all([
    readSource('../src/app/(main)/(protected)/profile/edit/PageClient.tsx'),
    readSource('../src/app/(main)/(protected)/profile/edit/components/EditProfileHeader.tsx'),
    readSource('../src/app/(main)/(protected)/profile/edit/hooks/useEditProfile.ts'),
    readSource('../src/app/(main)/(protected)/profile/[id]/hooks/usePublicProfile.ts'),
  ]);
  const editProfile = `${editPage}\n${editProfileHeader}\n${editProfileHook}`;
  assert.match(editProfile, /isStrongPassword/);
  assert.match(editProfile, /PASSWORD_REQUIREMENTS_MESSAGE/);
  assert.match(editProfileHeader, /image\/jpeg,image\/png,image\/webp/);
  assert.match(editProfile, /void logout\(\)/);
  assert.doesNotMatch(editProfile, /const PASSWORD_REGEX/);
  assert.match(publicProfileHook, /return "\/placeholder\.svg"/);
  assert.doesNotMatch(publicProfileHook, /placeholder\.png/);
});

test('leaderboard reuses the authenticated shared socket', async () => {
  const [source, page, api, footer, routes] = await Promise.all([
    readSource('../src/app/(main)/(protected)/leaderboard/hooks/useLeaderboard.ts'),
    readSource('../src/app/(main)/(protected)/leaderboard/PageClient.tsx'),
    readSource('../src/lib/api/axiosInstance.ts'),
    readSource('../src/components/Footer.tsx'),
    readSource('../src/config/routes.ts'),
  ]);
  assert.match(source, /useSocket\(\)/);
  assert.match(source, /Promise\.allSettled/);
  assert.match(source, /LEADERBOARD_USER_NOT_ELIGIBLE/);
  assert.match(source, /socket\.off\(SOCKET_EVENTS\.LEADERBOARD_UPDATE/);
  assert.doesNotMatch(source, /socket\.disconnect\(\)/);
  assert.doesNotMatch(source, /from "socket\.io-client"/);
  assert.match(page, /rankEligibility === false/);
  assert.match(page, /حسابك غير مشمول في الترتيب/);
  assert.doesNotMatch(api, /api\\\/leaderboard/);
  assert.match(routes, /'\/leaderboard'/);
  assert.match(footer, /authRequired:\s*true/);
  assert.match(footer, /!authLoading && isAuthenticated/);
});

test('root layout declares its smooth-scroll behavior for Next navigation', async () => {
  const source = await readSource('../src/app/layout.tsx');
  assert.match(source, /data-scroll-behavior="smooth"/);
});

test('dashboard renders the remaining quota directly', async () => {
  const source = await readSource('../src/app/(main)/(protected)/dashboard/components/StatsGrid.tsx');
  assert.match(source, /availableRequests = Math\.max\(0, quota\)/);
  assert.match(source, /رصيد الطلبات المتاح/);
  assert.doesNotMatch(source, /2 - quotaUsed/);
});

test('login keeps the complete backend user DTO', async () => {
  const source = await readSource('../src/app/(auth)/login/hooks/useLogin.ts');
  assert.match(source, /setUser\(response\.user\)/);
  assert.doesNotMatch(source, /const authUser/);
});
