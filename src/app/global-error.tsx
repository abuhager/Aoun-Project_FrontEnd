"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[Aoun global error]", {
      name: error.name,
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#f7f8f5",
          color: "#1e2526",
          fontFamily: "Tajawal, Cairo, Arial, sans-serif",
        }}
      >
        <main
          role="alert"
          style={{
            width: "min(100%, 560px)",
            boxSizing: "border-box",
            padding: "40px 28px",
            border: "1px solid #e7e3dc",
            borderRadius: "28px",
            background: "#ffffff",
            boxShadow: "0 18px 55px rgba(16, 37, 34, 0.10)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "42px" }} aria-hidden="true">
            !
          </div>
          <h1 style={{ margin: "12px 0 8px", fontSize: "26px" }}>
            تعذر تشغيل الصفحة
          </h1>
          <p style={{ margin: "0 auto", maxWidth: "420px", lineHeight: 1.9, color: "#6f6962" }}>
            حدث عطل مؤقت. أعد المحاولة، وإذا استمر افتح الصفحة الرئيسية من جديد.
          </p>
          {error.digest && (
            <p style={{ marginTop: "12px", fontSize: "12px", color: "#918a82" }}>
              رقم التتبع: <span dir="ltr">{error.digest}</span>
            </p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", marginTop: "24px" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: "44px",
                border: 0,
                borderRadius: "12px",
                padding: "10px 22px",
                background: "#006155",
                color: "#ffffff",
                font: "inherit",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              إعادة المحاولة
            </button>
            <a
              href="/"
              style={{
                minHeight: "44px",
                boxSizing: "border-box",
                display: "inline-flex",
                alignItems: "center",
                border: "1px solid #dcd7cf",
                borderRadius: "12px",
                padding: "10px 22px",
                color: "#3f4947",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              الصفحة الرئيسية
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
