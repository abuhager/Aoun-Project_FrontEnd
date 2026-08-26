"use client";

import Link from "next/link";
import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[Aoun route error]", {
      name: error.name,
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main
      dir="rtl"
      className="flex min-h-[70dvh] items-center justify-center px-4 py-16"
    >
      <section
        className="surface-card w-full max-w-xl p-8 text-center md:p-12"
        role="alert"
        aria-live="assertive"
      >
        <span
          aria-hidden="true"
          className="material-symbols-outlined rounded-3xl bg-red-50 p-4 text-5xl text-red-600"
        >
          error
        </span>
        <h1 className="mt-5 text-2xl font-black text-[#1e2526]">
          حصل خطأ غير متوقع
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-7 text-[#6f6962]">
          لم نفقد طلبك. حاول مرة أخرى، وإذا استمرت المشكلة أرسل رقم التتبع للدعم.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs font-bold text-[#9a938b]">
            رقم التتبع: <span dir="ltr">{error.digest}</span>
          </p>
        )}
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-white"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              refresh
            </span>
            إعادة المحاولة
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dcd7cf] bg-white px-6 py-3 text-sm font-black text-[#4f4a44]"
          >
            العودة للرئيسية
          </Link>
        </div>
      </section>
    </main>
  );
}
