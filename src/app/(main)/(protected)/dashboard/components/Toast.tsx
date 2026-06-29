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
      className={`fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold shadow-xl transition-all duration-300 ${
        isSuccess
          ? "border-emerald-200 bg-white text-emerald-700 shadow-emerald-100"
          : "border-red-200 bg-white text-red-700 shadow-red-100"
      }`}
      role="status"
      aria-live="polite"
    >
      <span
        className={`material-symbols-outlined text-[18px] ${
          isSuccess ? "text-emerald-600" : "text-red-600"
        }`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {isSuccess ? "check_circle" : "error"}
      </span>

      <span className="max-w-[260px] leading-snug">{msg}</span>

      <button
        onClick={onClose}
        className="ml-1 opacity-60 transition-opacity duration-150 hover:opacity-100"
        type="button"
        aria-label="إغلاق"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
}