// src/types/phone.types.ts
// أنواع بيانات نظام التحقق من الهاتف (Phase 2)

// ─── طلبات ────────────────────────────────────────────────────
export interface SendOtpRequest {
  phone: string; // مثال: "0791234567"
}

export interface VerifyOtpRequest {
  otp: string;   // 6 أرقام
}

// ─── ردود ────────────────────────────────────────────────────
export interface SendOtpResponse {
  msg: string;   // "تم إرسال رمز التحقق..."
}

export interface VerifyOtpResponse {
  msg:             string;  // "تم التحقق بنجاح 🎉"
  requiresRefresh: boolean; // ← إشارة لاستدعاء /refresh-token
}

// ─── حالة الـ Modal ───────────────────────────────────────────
export type VerifyStep = 'phone' | 'otp' | 'success';

export interface PhoneVerifyState {
  step:        VerifyStep;
  phone:       string;
  isLoading:   boolean;
  error:       string | null;
}