"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

/** توافق مع روابط البريد القديمة؛ الروابط الجديدة تستخدم fragment ولا ترسل الرمز للخادم. */
export default function LegacyResetPasswordClient() {
  const { token } = useParams<{ token: string | string[] }>();

  useEffect(() => {
    const value = Array.isArray(token) ? token[0] : token;
    const target = /^[a-f\d]{64}$/i.test(value ?? "")
      ? `/reset-password#token=${encodeURIComponent(value)}`
      : "/reset-password";
    window.location.replace(target);
  }, [token]);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-surface md:min-h-[calc(100dvh-5rem)]">
      <span className="material-symbols-outlined animate-spin text-4xl text-primary">
        progress_activity
      </span>
    </div>
  );
}
