"use client";
import { FormEvent } from "react";

interface Item {
  _id: string;
  title: string;
}

interface OtpModalProps {
  item: Item;
  otp: string;
  otpError: string;
  otpLoading: boolean;
  onOtpChange: (val: string) => void;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
}

export function OtpModal({
  item,
  otp,
  otpError,
  otpLoading,
  onOtpChange,
  onSubmit,
  onClose,
}: OtpModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-4"
        dir="rtl"
      >
        {/* العنوان */}
        <div className="space-y-1">
          <h2 className="text-xl font-black text-gray-800">تأكيد التسليم</h2>
          <p className="text-sm text-gray-500 font-medium truncate">{item.title}</p>
        </div>

        {/* ✅ رسالة توضيحية — المستخدم يدخل الـ OTP من إيميله */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-right">
          <p className="text-sm text-blue-700 font-semibold">
            📧 تم إرسال رمز التسليم إلى بريدك الإلكتروني
          </p>
          <p className="text-xs text-blue-500 mt-0.5">
            أدخل الرمز المكوّن من 6 أرقام الذي وصلك
          </p>
        </div>

        {/* Input الـ OTP */}
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, ""))}
          className="w-full bg-gray-50 text-center text-3xl font-black py-4 rounded-2xl outline-none focus:ring-2 ring-primary/20 tracking-[0.5em] font-mono"
          placeholder="000000"
          autoFocus
        />

        {/* خطأ */}
        {otpError && (
          <p className="text-xs text-red-500 font-bold">{otpError}</p>
        )}

        {/* الأزرار */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={otp.length < 6 || otpLoading}
            className="flex-1 bg-primary text-white font-black py-3 rounded-2xl disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            {otpLoading ? "جارٍ التحقق..." : "تأكيد التسليم"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}