// src/types/auth.types.ts
// ✅ إضافة code field لاستقبال OTP_ATTEMPTS_EXCEEDED و OTP_EXPIRED

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

export interface AuthUser {
  _id:              string;
  name:             string;
  email:            string;
  trustLevel:       1 | 2 | 3 | 4;  // ✅ إصلاح #7 — يدعم 4 مستويات
  isVerified:       boolean;
  isVerifiedStudent: boolean;
  avatar?:          string;
  phone?:           string;
  role:             "user" | "admin";
}

export interface LoginResponse {
  accessToken: string;
  user:        AuthUser;
}

export interface RegisterResponse {
  msg: string;
}

export interface VerifyOtpResponse {
  accessToken?: string;
  user?:        AuthUser| null;
  msg?:         string;
}

// ✅ جديد — شكل الخطأ القادم من الـ Backend
export interface ApiErrorResponse {
  msg:   string;
  code?: "OTP_ATTEMPTS_EXCEEDED" | "OTP_EXPIRED" | "EMAIL_NOT_VERIFIED" | "ACCOUNT_BANNED" | string;
}