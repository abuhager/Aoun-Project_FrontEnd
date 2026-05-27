// src/types/phone.types.ts
// أنواع بيانات نظام التحقق من الهاتف (Phase 2)

// ─── طلبات ────────────────────────────────────────────────────
export interface SendPhoneOtpRequest {
  phone: string;   // مثال: "0791234567"
}

export interface VerifyPhoneOtpRequest {
  otp: string;     // 6 أرقام
}

// ─── ردود ────────────────────────────────────────────────────
export interface SendPhoneOtpResponse {
  msg: string;     // "تم إرسال رمز التحقق..."
}

export interface VerifyPhoneOtpResponse {
  msg:             string;   // "تم التحقق بنجاح 🎉"
  requiresRefresh: boolean;  // ← إشارة لاستدعاء /refresh-token
}

// ─── حالة الـ Modal ───────────────────────────────────────────
export type VerifyStep = 'phone' | 'otp' | 'success';

export interface PhoneVerifyState {
  step:      VerifyStep;
  phone:     string;
  isLoading: boolean;
  error:     string | null;
}