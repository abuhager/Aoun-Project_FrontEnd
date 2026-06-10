// src/lib/api/authApi.ts
// ✅ PHASE 1 — Centralized Auth API Layer
// ✅ Fix — إضافة session_active cookie وتصحيح SameSite في Production لـ Cross-Origin

import axiosInstance, { setAccessToken } from './axiosInstance';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResendOtpRequest,     // ✅ جديد
  ResendOtpResponse,    // ✅ جديد
} from '@/types/auth.types';

// ─── helpers لـ session_active cookie ────────────────────────
// نفس المنطق في axiosInstance.ts — مستقل لتجنب circular dependency
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function setSessionCookie() {
  if (typeof document === 'undefined') return; // SSR guard

  // ✅ تم الإصلاح: استخدام SameSite=None و Secure في الـ Production للسماح بـ Cross-Origin requests
  const secure   = IS_PRODUCTION ? '; Secure'         : '';
  const sameSite = IS_PRODUCTION ? '; SameSite=None'  : '; SameSite=Lax';
  const expires  = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();

  // مواءمة القيمة لتكون '1' لتطابق فحص الـ Backend والـ Middleware بسهولة
  document.cookie = `session_active=1; path=/; expires=${expires}${sameSite}${secure}`;
}

function clearSessionCookie() {
  if (typeof document === 'undefined') return; // SSR guard

  // ✅ تم الإصلاح: يجب أن تتطابق الخصائص (SameSite/Secure) تماماً عند حذف الكوكي
  const secure   = IS_PRODUCTION ? '; Secure'        : '';
  const sameSite = IS_PRODUCTION ? '; SameSite=None' : '; SameSite=Lax';
  
  document.cookie = `session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${sameSite}${secure}`;
}

// ── تسجيل الدخول ──────────────────────────────────────────────
// refreshToken يُزرع تلقائياً في httpOnly cookie من الـ Backend
// accessToken نحفظه في الذاكرة فقط
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>(
    '/api/auth/login',
    credentials
  );

  if (data.accessToken) {
    setAccessToken(data.accessToken);
    // ✅ جديد — أشعر middleware.ts بوجود جلسة نشطة
    setSessionCookie();
  }

  return data;
}

// ── التسجيل ────────────────────────────────────────────────────
// لا session هنا — المستخدم يحتاج تحقق الإيميل أولاً
export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  const { data } = await axiosInstance.post<RegisterResponse>(
    '/api/auth/register',
    payload
  );
  return data;
}

// ── تحقق الإيميل (OTP) ─────────────────────────────────────────
// ✅ Backend يُعيد accessToken + refreshToken بعد التحقق مباشرة
// هذا هو الـ entry point الثاني للجلسة (بعد login)
export async function verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  const { data } = await axiosInstance.post<VerifyOtpResponse>(
    '/api/auth/verify-email',
    payload
  );

  if (data.accessToken) {
    setAccessToken(data.accessToken);
    // ✅ جديد — الجلسة تبدأ هنا لو المستخدم تحقق للمرة الأولى
    setSessionCookie();
  }

  return data;
}
export async function resendOtp(payload: ResendOtpRequest): Promise<ResendOtpResponse> {
  const { data } = await axiosInstance.post<ResendOtpResponse>(
    '/api/auth/resend-otp',
    payload
  );
  return data;
}

// ── تجديد الجلسة (يُستدعى من interceptor تلقائياً) ──────────────
// ملاحظة: axiosInstance.ts Response Interceptor يتكفل بـ setSessionCookie
// هذه الدالة للاستخدام اليدوي فقط إذا احتجت
export async function refreshAccessToken(): Promise<string> {
  const { data } = await axiosInstance.post<{ accessToken: string }>(
    '/api/auth/refresh'
  );

  if (data.accessToken) {
    setAccessToken(data.accessToken);
    // ✅ جديد — تجديد مؤشر الجلسة
    setSessionCookie();
  }

  return data.accessToken;
}

// ── تسجيل الخروج ───────────────────────────────────────────────
// ملاحظة: AuthContext.logout() هو المسار الأساسي للخروج
// هذه الدالة fallback للاستخدام خارج الـ context (مثلاً في صفحات SSR)
export async function logout(): Promise<void> {
  try {
    await axiosInstance.post('/api/auth/logout');
  } finally {
    setAccessToken(null);
    // ✅ جديد — امسح مؤشر الجلسة
    clearSessionCookie();
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
  }
}