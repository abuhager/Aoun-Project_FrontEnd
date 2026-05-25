// src/lib/api/phoneApi.ts
// ✅ Phase 2 — Phone OTP Verification API Layer

import axiosInstance from './axiosInstance';
import type {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpResponse,
} from '@/types/phone.types';

// ─── إرسال OTP عبر WhatsApp ───────────────────────────────────
// يتطلب: المستخدم مسجّل دخول (accessToken في الذاكرة)
// axiosInstance.ts interceptor يُرفق الـ token تلقائياً
export async function sendPhoneOtp(
  payload: SendOtpRequest
): Promise<SendOtpResponse> {
  const { data } = await axiosInstance.post<SendOtpResponse>(
    '/api/phone/send-otp',
    payload
  );
  return data;
}

// ─── التحقق من الـ OTP ─────────────────────────────────────────
// عند النجاح: Backend يرفع trustLevel إلى 2 في DB
// requiresRefresh: true ← يجب استدعاء /refresh-token لتحديث JWT
export async function verifyPhoneOtp(
  otp: string
): Promise<VerifyOtpResponse> {
  const { data } = await axiosInstance.post<VerifyOtpResponse>(
    '/api/phone/verify-otp',
    { otp }
  );
  return data;
}