// src/lib/api/authApi.ts
// ✅ DUP-AUTH-01: استيراد setSessionCookie/clearSessionCookie من cookieUtils بدل إعادة تعريفهما

import axiosInstance, { setAccessToken } from './axiosInstance';
import { setSessionCookie } from '@/lib/utils/cookieUtils';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResendOtpRequest,
  ResendOtpResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  RefreshResponse,
} from '@/types/auth.types';

// ── تسجيل الدخول ──────────────────────────────────────────────
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>(
    '/api/auth/login',
    credentials
  );
  if (data.accessToken) {
    setAccessToken(data.accessToken);
    setSessionCookie();
  }
  return data;
}

// ── التسجيل ────────────────────────────────────────────────────
export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  const { data } = await axiosInstance.post<RegisterResponse>(
    '/api/auth/register',
    payload
  );
  return data;
}

// ── تحقق الإيميل (OTP) ─────────────────────────────────────────
export async function verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  const { data } = await axiosInstance.post<VerifyOtpResponse>(
    '/api/auth/verify-email',
    payload
  );
  if (data.accessToken) {
    setAccessToken(data.accessToken);
    setSessionCookie();
  }
  return data;
}

// ── إعادة إرسال OTP ───────────────────────────────────────────
export async function resendOtp(payload: ResendOtpRequest): Promise<ResendOtpResponse> {
  const { data } = await axiosInstance.post<ResendOtpResponse>(
    '/api/auth/resend-otp',
    payload
  );
  return data;
}

// ── إعادة تعيين كلمة المرور ─────────────────────────────────
export async function resetPassword(
  payload: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  const { data } = await axiosInstance.post<ResetPasswordResponse>(
    '/api/auth/reset-password',
    payload
  );
  return data;
}

// ── طلب رابط إعادة تعيين كلمة المرور ────────────────────────
export async function forgotPassword(
  payload: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  const { data } = await axiosInstance.post<ForgotPasswordResponse>(
    '/api/auth/forgot-password',
    payload
  );
  return data;
}

// طلبات الجلسة الخام تستخدمها AuthContext حتى تتحكم هي بترتيب تحديث الحالة.
export async function requestRefreshSession(): Promise<RefreshResponse> {
  const { data } = await axiosInstance.post<RefreshResponse>(
    '/api/auth/refresh',
    {},
    { withCredentials: true }
  );
  return data;
}

export async function requestLogout(): Promise<void> {
  await axiosInstance.post('/api/auth/logout', {}, { withCredentials: true });
}
