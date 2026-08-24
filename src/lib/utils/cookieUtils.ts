// src/lib/utils/cookieUtils.ts
// ✅ DUP-AUTH-01: Single Source of Truth لمنطق session_active cookie
// ✅ ADM-AUTH-02: SESSION_DAYS مأخوذ من .env بدل magic number

const IS_PRODUCTION  = process.env.NODE_ENV === 'production';

// ✅ ADM-AUTH-02: قابل للإعداد من .env — أضف NEXT_PUBLIC_SESSION_EXPIRE_DAYS=7 في .env.local
const SESSION_DAYS   = parseInt(
  process.env.NEXT_PUBLIC_SESSION_EXPIRE_DAYS ?? '7',
  10
) || 7;

const _cookieFlags = (): string => {
  if (typeof document === 'undefined') return ''; // SSR guard
  const secure   = IS_PRODUCTION ? '; Secure'        : '';
  // طلبات API في المتصفح تمر من نفس origin عبر Next.js rewrite.
  const sameSite = '; SameSite=Lax';
  return `${sameSite}${secure}`;
};

/**
 * يضع cookie بسيطة لإشعار Next.js middleware بوجود جلسة نشطة
 * (الـ httpOnly refresh token غير قابل للقراءة من JS)
 */
export function setSessionCookie(): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  ).toUTCString();
  document.cookie = `session_active=1; path=/; expires=${expires}${_cookieFlags()}`;
}

/**
 * يحذف session_active cookie — يجب أن تتطابق الخصائص مع setSessionCookie تماماً
 */
export function clearSessionCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie =
    `session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${_cookieFlags()}`;
}
