// src/types/auth.types.ts
import type { AuthUser } from '@/types/user.types'; // ✅ استورد بدل تعريف ثانٍ

export type { AuthUser }; // ✅ re-export لو في كود يستورده من هنا

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

export interface LoginResponse {
  accessToken: string;
  user:        AuthUser;
}

export interface RegisterResponse {
  msg: string;
}

export interface VerifyOtpResponse {
  accessToken?: string;
  user:         AuthUser | null; // ✅ أزلنا الـ ?
  msg?:         string;
}

export interface ApiErrorResponse {
  msg:   string;
  code?: 'OTP_ATTEMPTS_EXCEEDED' | 'OTP_EXPIRED' | 'EMAIL_NOT_VERIFIED' | 'ACCOUNT_BANNED' | string;
}