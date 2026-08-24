"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSiteConfig } from "@/context/SiteConfigContext";

const AUTH_BYPASS_PATHS = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/verify",
] as const;

const isAuthBypassPath = (pathname: string) => AUTH_BYPASS_PATHS.some(
  (path) => pathname === path || pathname.startsWith(`${path}/`)
);

export default function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const { maintenanceMode, platformName, contactEmail } = useSiteConfig();

  if (!maintenanceMode || isAuthBypassPath(pathname)) return children;

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f7f4ee]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
      </div>
    );
  }

  if (user?.role === "admin" || user?.role === "super_admin") return children;

  return (
    <main
      dir="rtl"
      className="flex min-h-dvh items-center justify-center bg-[radial-gradient(circle_at_top,#e8f4f2_0%,#f7f4ee_48%,#f2eee7_100%)] px-5 py-16"
    >
      <section className="w-full max-w-xl rounded-[32px] border border-white/80 bg-white/95 p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur md:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-[40px]">construction</span>
        </div>
        <p className="mt-7 text-xs font-black tracking-[0.18em] text-primary">
          {platformName}
        </p>
        <h1 className="mt-3 text-3xl font-black text-[#20312f]">نعود إليك قريباً</h1>
        <p className="mt-4 text-sm font-medium leading-8 text-[#746e66]">
          نجري حالياً صيانة قصيرة لتحسين المنصة. حسابك وبياناتك محفوظة، ويمكنك
          المحاولة مرة أخرى بعد قليل.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-primary px-6 py-3 text-sm font-black text-white transition hover:bg-primary/90"
          >
            إعادة المحاولة
          </button>
          <Link
            href="/login"
            className="rounded-2xl border border-[#ded8cf] bg-white px-6 py-3 text-sm font-black text-[#514b44] transition hover:bg-[#faf8f4]"
          >
            دخول الإدارة
          </Link>
        </div>
        <a
          href={`mailto:${contactEmail}`}
          className="mt-7 inline-block text-xs font-bold text-[#847d75] underline decoration-[#c9c1b7] underline-offset-4"
        >
          {contactEmail}
        </a>
      </section>
    </main>
  );
}

export { AUTH_BYPASS_PATHS, isAuthBypassPath };
