import type { ReactNode } from "react";
import BrandMark from "@/components/ui/BrandMark";

interface AuthShellProps {
  platformName: string;
  eyebrow: string;
  icon: string;
  title: string;
  description: string;
  children: ReactNode;
  size?: "default" | "wide";
}

export default function AuthShell({
  platformName,
  eyebrow,
  icon,
  title,
  description,
  children,
  size = "default",
}: AuthShellProps) {
  const widthClass = size === "wide" ? "max-w-[48rem]" : "max-w-[38rem]";

  return (
    <div
      className="relative isolate flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden bg-[#eef4f1] px-4 py-6 sm:px-6 sm:py-9 md:min-h-[calc(100dvh-5rem)]"
      dir="rtl"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(rgba(0,117,107,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,117,107,0.035)_1px,transparent_1px)]"
        style={{ backgroundSize: "42px 42px" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 -z-10 h-[30rem] w-[30rem] rounded-full bg-secondary/10 blur-3xl"
      />

      <div className={`relative w-full ${widthClass}`}>
        <div className="overflow-hidden rounded-[1.75rem] border border-white/90 bg-white shadow-[0_28px_80px_rgba(20,58,52,0.16)] ring-1 ring-[#0a5149]/[0.06]">
          <header className="relative overflow-hidden bg-[linear-gradient(135deg,#063f39_0%,#07554d_58%,#087267_100%)] px-5 py-6 text-white sm:px-8 sm:py-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-10 -top-24 h-64 w-64 rounded-full border-[42px] border-white/[0.035]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 right-1/4 h-56 w-56 rounded-full bg-[#17a99b]/20 blur-3xl"
            />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <BrandMark name={platformName} inverted tagline="عطاء يصل لمن يحتاجه" />
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold text-white/85 backdrop-blur-sm">
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[15px] text-[#f3c36f]"
                >
                  verified_user
                </span>
                تجربة آمنة وموثوقة
              </span>
            </div>

            <div className="relative mt-6 flex items-start gap-3 sm:gap-4">
              <span
                aria-hidden="true"
                className="material-symbols-outlined flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[22px] text-[#f3c36f] shadow-inner sm:h-12 sm:w-12"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 550" }}
              >
                {icon}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-black text-[#f5d394] sm:text-xs">
                  {eyebrow}
                </p>
                <h1 className="mt-1.5 text-[1.65rem] font-black leading-tight tracking-tight text-white sm:text-[2rem]">
                  {title}
                </h1>
                <p className="mt-2 max-w-2xl text-xs font-semibold leading-6 text-white/68 sm:text-sm sm:leading-7">
                  {description}
                </p>
              </div>
            </div>
          </header>

          <section className="bg-white px-5 py-6 sm:px-8 sm:py-7">{children}</section>
        </div>

        <p className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] font-bold text-on-surface-soft">
          <span aria-hidden="true" className="material-symbols-outlined text-[15px] text-primary">
            lock
          </span>
          اتصال مشفّر · بياناتك لا تُشارك خارج المنصة
        </p>
      </div>
    </div>
  );
}
