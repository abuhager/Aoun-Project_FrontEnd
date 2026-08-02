// src/types/auth.types.ts
import type { AuthUser } from '@/types/user.types';

export type { AuthUser };

export interface LoginRequest {
  email:    string;
  password: string;
}

export interface RegisterRequest {
  name:     string;
  email:    string;
  password: string;
  phone?:   string;
}

export interface VerifyOtpRequest {
  email: string;
  otp:   string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  user:        AuthUser;
}

export interface RegisterResponse {
  msg: string;
}

// ✅ [FLOW2-FIX-07] user لم يعد يقبل null — Backend يُرسله دائماً مع accessToken
// المشكلة القديمة: user: AuthUser | null كان يُجبر الكود على setUser(null) بعد التحقق الناجح!
// القاعدة الجديدة: إذا accessToken موجود → user موجود بالضرورة
//                  إذا user غائب → لا نُكمل التنقل (edge case غير متوقع)
export interface VerifyOtpResponse {
  accessToken?: string;
  user?:        AuthUser; // optional لكن ليس null — الفرق: undefined يُعبِّر عن "غائب"، null تعبّر عن "قيمة فارغة متعمدة"
  msg?:         string;
}

export interface ResendOtpResponse {
  msg: string;
}

export interface ApiErrorResponse {
  msg:   string;
  code?: 'OTP_ATTEMPTS_EXCEEDED' | 'OTP_EXPIRED' | 'EMAIL_NOT_VERIFIED' | 'ACCOUNT_BANNED' | 'ACCOUNT_FROZEN' | string;
  // ✅ [FLOW2-FIX-07] ACCOUNT_FROZEN أضيف لقائمة الكودات المعروفة
}