// src/lib/api/authApi.ts
// ✅ DUP-AUTH-01: استيراد setSessionCookie/clearSessionCookie من cookieUtils بدل إعادة تعريفهما

import axiosInstance, { setAccessToken } from './axiosInstance';
import { setSessionCookie, clearSessionCookie } from '@/lib/utils/cookieUtils'; // ← جديد
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResendOtpRequest,
  ResendOtpResponse,
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

// ── تجديد الجلسة ─────────────────────────────────────────────
export async function refreshAccessToken(): Promise<string> {
  const { data } = await axiosInstance.post<{ accessToken: string }>('/api/auth/refresh');
  if (data.accessToken) {
    setAccessToken(data.accessToken);
    setSessionCookie();
  }
  return data.accessToken;
}

// ── تسجيل الخروج ─────────────────────────────────────────────
export async function logout(): Promise<void> {
  try {
    await axiosInstance.post('/api/auth/logout');
  } finally {
    setAccessToken(null);
    clearSessionCookie();
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
  }
}