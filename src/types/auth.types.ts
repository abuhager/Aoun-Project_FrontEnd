// src/types/auth.types.ts
// ✅ PHASE 1 — محدّث: أضيف RefreshTokenResponse + LogoutResponse

import type { AuthUser } from './user.types';

// ── Requests ──────────────────────────────────────────────────
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

// ── Responses ────────────────────────────────────────────────
export interface LoginResponse {
  msg:         string;
  accessToken: string;
  user:        AuthUser;
}

export interface RegisterResponse {
  msg:   string;
  email: string;
}

export interface VerifyOtpResponse {
  accessToken:   string;     // ✅ نفس التغيير هنا
  user?:         AuthUser;
  msg?:          string;
}
// ✅ Phase 1 — جديد
export interface RefreshTokenResponse {
  accessToken: string;
}

export interface LogoutResponse {
  msg: string;
}

// ── JWT Decoded Payload ───────────────────────────────────
export interface JwtPayload {
  user: {
    id:         string;
    role:       string;
    trustLevel: 1 | 2;
  };
  iat: number;
  exp: number;
}
