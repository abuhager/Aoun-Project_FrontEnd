// src/lib/api/phoneApi.ts
// المسؤولية: التحقق من رقم الهاتف عبر Firebase Phone Auth
// ✅ تم استبدال Twilio بـ Firebase
//
// ─── آلية العمل ──────────────────────────────────────────────
// 1. signInWithPhoneNumber  → Firebase يرسل OTP مباشرة للمستخدم
// 2. confirmationResult.confirm(otp) → Firebase يتحقق من الرمز
// 3. user.getIdToken()      → نحصل على idToken
// 4. verifyFirebaseToken()  → نرسل idToken للـ Backend

import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
} from 'firebase/auth';
import { firebaseAuth }  from '@/lib/firebase';
import axiosInstance     from '@/lib/axiosInstance';

// ─── الحالة الداخلية ──────────────────────────────────────────
let _confirmationResult: ConfirmationResult | null = null;
let _recaptchaVerifier:  RecaptchaVerifier  | null = null;

// ─── تهيئة reCAPTCHA (مرة واحدة لكل جلسة إرسال) ──────────────
const getRecaptchaVerifier = (buttonId: string): RecaptchaVerifier => {
  if (_recaptchaVerifier) {
    try { _recaptchaVerifier.clear(); } catch { /* ignore */ }
  }
  _recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, buttonId, {
    size: 'invisible', // بدون UI ظاهرة للمستخدم
  });
  return _recaptchaVerifier;
};

// ─── إرسال OTP عبر Firebase ───────────────────────────────────
// phone: صيغة E.164 مثل +96279xxxxxxx
// buttonId: id زر الإرسال (مطلوب لـ reCAPTCHA)
export async function sendPhoneOtp(
  payload: { phone: string },
  buttonId = 'send-otp-btn'
): Promise<void> {
  const verifier = getRecaptchaVerifier(buttonId);
  _confirmationResult = await signInWithPhoneNumber(
    firebaseAuth,
    payload.phone,
    verifier
  );
}

// ─── تأكيد OTP وإرسال idToken للـ Backend ─────────────────────
export async function verifyPhoneOtp(
  otp: string
): Promise<{ requiresRefresh: boolean; phone: string }> {
  if (!_confirmationResult) {
    throw new Error('يجب إرسال OTP أولاً قبل التحقق');
  }

  // 1. أكّد الرمز مع Firebase
  const result  = await _confirmationResult.confirm(otp);

  // 2. احصل على idToken
  const idToken = await result.user.getIdToken();

  // 3. أرسل idToken للـ Backend
  const { data } = await axiosInstance.post<{
    msg: string;
    phone: string;
    requiresRefresh: boolean;
  }>('/phone/verify-token', { idToken });

  // 4. نظّف الحالة
  _confirmationResult = null;

  return { requiresRefresh: data.requiresRefresh, phone: data.phone };
}
