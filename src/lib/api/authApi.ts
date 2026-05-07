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

// ── تسجيل الدخول — accessToken في الذاكرة فقط ────────────────
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>('/api/auth/login', credentials);
  // refreshToken يُزرع تلقائياً في httpOnly cookie من الـ Backend
  // accessToken نحفظه في الذاكرة فقط
  if (data.accessToken) setAccessToken(data.accessToken);
  return data;
}

// ── التسجيل ────────────────────────────────────────────────────
export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  const { data } = await axiosInstance.post<RegisterResponse>('/api/auth/register', payload);
  return data;
}

// ── تحقق الإيميل (OTP) ─────────────────────────────────────────
export async function verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  const { data } = await axiosInstance.post<VerifyOtpResponse>('/api/auth/verify-email', payload);
  return data;
}

// ── تجديد الجلسة (يُستدعى من interceptor تلقائياً) ──────────────
export async function refreshAccessToken(): Promise<string> {
  const { data } = await axiosInstance.post<{ accessToken: string }>('/api/auth/refresh');
  if (data.accessToken) setAccessToken(data.accessToken);
  return data.accessToken;
}

// ── تسجيل الخروج ───────────────────────────────────────────────
export async function logout(): Promise<void> {
  try {
    await axiosInstance.post('/api/auth/logout');
  } finally {
    setAccessToken(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}