"use client";

import { useState, useCallback, type ReactNode, useRef, useEffect } from "react";

type ToastState = { msg: string; ok: boolean } | null;

export function useToast(duration = 3000) {
  const [toast, setToast] = useState<ToastState>(null);
  
  // ✅ استخدام مرجع لحفظ المؤقت الحالي ومنع تداخله
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((msg: string, ok: boolean) => {
    // 1) لو فيه توست شغال حالياً، احذفه ونظف مؤقته فوراً قبل البدء بالجديد
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setToast({ msg, ok });

    // 2) تعيين المؤقت الجديد وحفظ المرجع الخاص به
    timerRef.current = setTimeout(() => {
      setToast(null);
    }, duration);
  }, [duration]);

  // ✅ تنظيف المؤقت التلقائي عند مغادرة الصفحة أو إغلاق المكون (Prevent Memory Leaks)
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const ToastComponent: ReactNode = toast ? (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-60 px-6 py-3
        rounded-2xl shadow-lg text-sm font-bold text-white transition-all
        ${toast.ok ? "bg-green-500" : "bg-red-500"}`}
    >
      {toast.msg}
    </div>
  ) : null;

  return { show, ToastComponent };
}