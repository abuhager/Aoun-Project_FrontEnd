// src/lib/api/authApi.ts
// ✅ PHASE 1 — Centralized Auth API Layer
import axiosInstance, { setAccessToken } from './axiosInstance';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '@/types/auth.types';

// ── حفظ الـ token في memory + cookie (للـ middleware) ────────────────
function persistToken(token: string) {
  // 1. ذاكرة التطبيق — للـ axios interceptor
  setAccessToken(token);
  // 2. Cookie — يقرأه الـ Edge Middleware في الناحية الخادم
  //    SameSite=Lax — آمن كفاية لحماية CSRF في الجلسات العادية
  if (typeof window !== 'undefined') {
    const maxAge = 60 * 60 * 24 * 7; // 7 أيام
    document.cookie =
      `token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
}

function clearToken() {
  setAccessToken(null);
  if (typeof window !== 'undefined') {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  }
}

// ── تسجيل الدخول ─────────────────────────────────────────────
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>('/api/auth/login', credentials);
  if (data.token) persistToken(data.token);
  return data;
}

// ── التسجيل ────────────────────────────────────────────────
export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  const { data } = await axiosInstance.post<RegisterResponse>('/api/auth/register', payload);
  return data;
}

// ── تحقق الإيميل (OTP) ─────────────────────────────────────
export async function verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  const { data } = await axiosInstance.post<VerifyOtpResponse>('/api/auth/verify', payload);
  if (data.token) persistToken(data.token);
  return data;
}

// ── تجديد الجلسة ────────────────────────────────────────────
export async function refreshAccessToken(): Promise<string> {
  const { data } = await axiosInstance.post<{ accessToken: string }>('/api/auth/refresh-token');
  persistToken(data.accessToken);
  return data.accessToken;
}

// ── تسجيل الخروج ─────────────────────────────────────────────
export async function logout(): Promise<void> {
  try {
    await axiosInstance.post('/api/auth/logout');
  } finally {
    clearToken();
    window.location.href = '/login';
  }
}
