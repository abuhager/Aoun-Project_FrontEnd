// src/types/auth.types.ts
// كل ما يتعلق بالـ authentication

import type { AuthUser } from './user.types';

// ── Register ──────────────────────────────────────────────────────
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterResponse {
  msg: string;
  // لا يوجد token — يجب التحقق من الإيميل أولاً
}

// ── Verify Email ──────────────────────────────────────────────────
export interface VerifyEmailPayload {
  email: string;
  otp: string;   // 4 أرقام — مطابق لـ authDto validateVerifyEmail
}

export interface VerifyEmailResponse {
  msg: string;
  token: string;
  user: AuthUser;
}

// ── Login ─────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// ── Forgot Password ───────────────────────────────────────────────
export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  msg: string;
}

// ── Reset Password ────────────────────────────────────────────────
export interface ResetPasswordPayload {
  password: string;
}

export interface ResetPasswordResponse {
  msg: string;
}

// ── الـ state الكاملة للـ auth في الـ Frontend ───────────────────
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}