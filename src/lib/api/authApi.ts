// src/lib/api/authApi.ts
// ================================================================
// ✅ PHASE 1 — Centralized Auth API Layer
//
// كل طلب auth يمر من هنا — لا يوجد axios.post('/login') مباشرة في المكونات
// ================================================================
import axiosInstance, { setAccessToken } from './axiosInstance';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '@/types/auth.types';

// ── تسجيل الدخول
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>(
    '/api/auth/login',
    credentials
  );
  // ✅ حفظ Access Token في الذاكرة (Refresh يجي تلقائياً بالـ httpOnly cookie)
  if (data.token) setAccessToken(data.token);
  return data;
}

// ── التسجيل
export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  const { data } = await axiosInstance.post<RegisterResponse>(
    '/api/auth/register',
    payload
  );
  return data;
}

// ── تحقق الإيميل
export async function verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  const { data } = await axiosInstance.post<VerifyOtpResponse>(
    '/api/auth/verify',
    payload
  );
  if (data.token) setAccessToken(data.token);
  return data;
}

// ── تجديد الجلسة (يُستدعى تلقائياً من interceptor)
export async function refreshAccessToken(): Promise<string> {
  const { data } = await axiosInstance.post<{ accessToken: string }>(
    '/api/auth/refresh-token'
  );
  setAccessToken(data.accessToken);
  return data.accessToken;
}

// ── تسجيل الخروج
export async function logout(): Promise<void> {
  try {
    await axiosInstance.post('/api/auth/logout');
  } finally {
    // مسح الذاكرة دائماً حتى لو فشل الطلب
    setAccessToken(null);
    window.location.href = '/login';
  }
}
