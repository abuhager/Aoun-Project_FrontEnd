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
  item, otp, otpError, otpLoading,
  onOtpChange, onSubmit, onClose,
}: OtpModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-4"
        dir="rtl"
      >
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-primary text-3xl">lock_open</span>
        </div>
        <h3 className="text-xl font-black text-primary">تأكيد الاستلام 🎁</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          أدخل الرمز الذي سيقدمه لك المستلم
          <br />
          <span className="font-black text-[#191c1d]">{item.title}</span>
        </p>

        {otpError && <p className="text-[10px] text-red-500 font-bold">{otpError}</p>}

        {/* ✅ 6 خانات */}
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, ""))}
          className="w-full bg-gray-50 text-center text-3xl font-black py-4 rounded-2xl outline-none focus:ring-2 ring-primary/20 tracking-[0.5em] font-mono"
          placeholder="000000"
        />
        <p className="text-[10px] text-gray-400">رمز مكون من 6 أرقام</p>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={otpLoading || otp.length !== 6} // ✅ 6 بدل 4
            className="flex-1 bg-primary text-white py-3 rounded-2xl font-black text-xs disabled:opacity-50 transition-all"
          >
            {otpLoading ? "جاري..." : "تأكيد التسليم"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-50 text-gray-400 py-3 rounded-2xl font-black text-xs hover:bg-gray-100 transition-all"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}