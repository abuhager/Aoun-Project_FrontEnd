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
  variant?: "default" | "login-split";
}

export default function AuthShell({
  platformName,
  eyebrow,
  icon,
  title,
  description,
  children,
  size = "default",
  variant = "default",
}: AuthShellProps) {
  if (variant === "login-split") {
    return (
      <div
        className="min-h-[calc(100dvh-4rem)] bg-white"
        dir="rtl"
      >
        <div className="grid min-h-[calc(100dvh-4rem)] w-full bg-white lg:grid-cols-2">
          <aside
            data-testid="login-visual"
            className="relative hidden min-h-full overflow-hidden bg-[#006b5e] bg-[url('/Volunteer-Background.png')] bg-cover bg-center bg-no-repeat text-white lg:col-start-2 lg:row-start-1 lg:block"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(0,75,66,0.58),rgba(0,90,79,0.72)_50%,rgba(0,52,47,0.84))] mix-blend-multiply"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(255,255,255,0.11),transparent_32%),linear-gradient(to_bottom,rgba(0,38,34,0.05),rgba(0,38,34,0.42))]"
            />

            <div className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center px-10 py-12 xl:px-16">
              <div className="w-full max-w-[34rem] rounded-[1.5rem] border border-white/20 bg-[#003f39]/45 p-8 shadow-[0_28px_70px_rgba(0,35,31,0.28)] backdrop-blur-[5px] xl:p-10">
                <div className="text-center">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[11px] font-black text-[#f5d18b]">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#f3bd55] shadow-[0_0_0_4px_rgba(243,189,85,0.12)]" />
                    رسالة عون
                  </span>
                  <blockquote className="mt-6 font-headline text-[1.8rem] font-black leading-[1.8] text-white drop-shadow-sm xl:text-[2rem]">
                    نحن هنا لنكون عوناً لبعضنا البعض، خطوة واحدة يمكنها تغيير حياة الكثيرين.
                  </blockquote>
                  <div className="mt-7 flex items-center justify-center gap-3 border-t border-white/15 pt-6 text-xs font-bold text-white/75">
                    <span className="h-px w-8 bg-[#efc36c]" />
                    اعرض غرضاً، قدّم طلباً، وتابع التسليم من مكان واحد
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section className="flex min-h-[calc(100dvh-4rem)] bg-[#fbfcfc] px-5 py-8 sm:px-10 lg:col-start-1 lg:row-start-1 lg:px-12 lg:py-10">
            <div className="m-auto w-full max-w-[27rem]">
              <div className="text-center">
                <p className="font-headline text-3xl font-black tracking-[-0.05em] text-primary">
                  {platformName}
                </p>
                <p className="mt-3 text-[11px] font-black tracking-[0.08em] text-primary/75">{eyebrow}</p>
                <h1 className="mt-2 text-[2rem] font-black leading-tight tracking-tight text-on-surface sm:text-[2.25rem]">
                  {title}
                </h1>
                <p className="mx-auto mt-2 max-w-sm text-xs font-semibold leading-6 text-on-surface-soft sm:text-sm sm:leading-7">
                  {description}
                </p>
              </div>

              <div className="mt-7">{children}</div>

              <p className="mt-5 flex items-center justify-center gap-2 text-center text-[10px] font-bold text-on-surface-soft sm:text-[11px]">
                <span aria-hidden="true" className="material-symbols-outlined text-[14px] text-primary">
                  lock
                </span>
                جلسة دخول محمية دون حفظ كلمة المرور في المتصفح
              </p>
            </div>
          </section>
        </div>
      </div>
    );
  }

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
