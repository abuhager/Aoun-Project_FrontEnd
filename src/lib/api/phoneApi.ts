// src/lib/api/phoneApi.ts
// ✅ Phase 2 — Phone OTP Verification API Layer

import axiosInstance from './axiosInstance';
import type {
  SendPhoneOtpRequest,    // ✅ اسم جديد
  SendPhoneOtpResponse,   // ✅ اسم جديد
  VerifyPhoneOtpResponse, // ✅ اسم جديد
} from '@/types/phone.types';

// ─── إرسال OTP عبر WhatsApp ───────────────────────────────────
export async function sendPhoneOtp(
  payload: SendPhoneOtpRequest               // ✅
): Promise<SendPhoneOtpResponse> {           // ✅
  const { data } = await axiosInstance.post<SendPhoneOtpResponse>(
    '/api/phone/send-otp',
    payload
  );
  return data;
}

// ─── التحقق من الـ OTP ─────────────────────────────────────────
export async function verifyPhoneOtp(
  otp: string
): Promise<VerifyPhoneOtpResponse> {         // ✅
  const { data } = await axiosInstance.post<VerifyPhoneOtpResponse>(
    '/api/phone/verify-otp',
    { otp }
  );
  return data;
}