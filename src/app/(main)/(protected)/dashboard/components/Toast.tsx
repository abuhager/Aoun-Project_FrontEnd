// src/app/(main)/(protected)/dashboard/components/Toast.tsx  ✅ REDESIGNED
"use client";

import { useEffect } from "react";

interface ToastProps {
  msg: string;
  type: "error" | "success";
  onClose: () => void;
}

export function Toast({ msg, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2
                  items-center gap-3 rounded-2xl border px-5 py-3
                  text-sm font-bold shadow-xl
                  transition-all duration-300 animate-in
                  ${isSuccess
                    ? "border-emerald-200 bg-emerald-600 text-white shadow-emerald-600/25"
                    : "border-red-200 bg-red-500 text-white shadow-red-500/25"
                  }`}
    >
      <span
        className="material-symbols-outlined text-[18px]"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {isSuccess ? "check_circle" : "error"}
      </span>
      <span className="max-w-[260px] leading-snug">{msg}</span>
      <button
        onClick={onClose}
        className="ml-1 opacity-70 transition-opacity duration-150 hover:opacity-100"
        type="button"
        aria-label="إغلاق"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
}