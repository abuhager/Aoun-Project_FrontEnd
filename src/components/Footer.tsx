// src/components/Footer.tsx
"use client";

import { useSiteConfig } from "@/context/SiteConfigContext";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
export default function Footer() {
  const { platformName, contactEmail } = useSiteConfig(); // ← contactEmail من DB
  const { isAuthenticated, isLoading: authLoading } = useAuth();
 const pathname = usePathname();
   if (pathname.startsWith("/admin")) return null;

  return (
    <footer
      dir="rtl"
      className="relative overflow-hidden bg-[#003d36] text-white"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 120%, #005c50 0%, #003d36 60%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 0%, white 0%, transparent 70%)",
        }}
      />

      <div className="border-t border-white/[0.08]" />

      <div className="safe-area-bottom relative mx-auto max-w-5xl px-5 py-10 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">

          {/* العمود الأول: الشعار والرسالة */}
          <div className="flex flex-col items-center text-center md:items-start md:text-right">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.12] backdrop-blur-sm">
                <span
                  className="material-symbols-outlined text-[20px] text-white"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  volunteer_activism
                </span>
              </div>
              <span className="text-xl font-black tracking-tight">{platformName}</span>
            </div>

            <p className="max-w-xs text-[13px] leading-relaxed text-white/60">
              منصة خيرية شبابية تهدف إلى تسهيل التبرع العيني وربط المتبرعين
              بالمحتاجين، تعزيزاً للتكافل الاجتماعي.
            </p>

            <div className="mt-4 flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.06] px-3 py-1.5">
              <span
                className="material-symbols-outlined text-[13px] text-emerald-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              <span className="text-[11px] font-bold text-white/70">
                مبادرة أردنية مستقلة
              </span>
            </div>
          </div>

          {/* العمود الثاني: روابط سريعة */}
          <div className="flex flex-col items-center md:items-start">
            <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-white/40">
              روابط سريعة
            </p>
            <nav className="flex flex-col gap-1.5" aria-label="روابط التذييل">
              {[
                { href: "/browse",            label: "تصفح الأغراض",  icon: "explore",            authRequired: false },
                { href: "/donation-requests", label: "طلبات التبرع",  icon: "volunteer_activism", authRequired: false },
                { href: "/leaderboard",       label: "المتصدرون",     icon: "leaderboard",        authRequired: true  },
                { href: "/hubs",              label: "مراكز التسليم", icon: "warehouse",          authRequired: false },
              ]
                .filter((link) => !link.authRequired || (!authLoading && isAuthenticated))
                .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={pathname === link.href || pathname.startsWith(`${link.href}/`) ? "page" : undefined}
                  className="group flex min-h-11 items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-bold text-white/70 transition-all duration-150 hover:bg-white/[0.06] hover:text-white"
                >
                  <span
                    className="material-symbols-outlined text-[15px] text-white/30 transition-colors group-hover:text-emerald-400"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* العمود الثالث: التواصل */}
          <div className="flex flex-col items-center md:items-start">
            <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-white/40">
              تواصل معنا
            </p>

            <div className="flex w-full max-w-xs min-w-0 flex-col gap-2">
              {/* البريد الإلكتروني من DB */}
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contactEmail}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`مراسلة الدعم عبر البريد: ${contactEmail}`}
                className="group flex items-center gap-2.5 rounded-xl border border-white/[0.10] bg-white/[0.05] px-3 py-2.5 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.09]"
              >
                <span
                  className="material-symbols-outlined text-[16px] text-white/50 transition-colors group-hover:text-white"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  mail
                </span>
                <span
                  dir="ltr"
                  className="min-w-0 truncate text-[12px] font-bold text-white/70 transition-colors group-hover:text-white"
                >
                  {contactEmail}
                </span>
              </a>

              {/* واتساب */}
              <a
                href="https://wa.me/962797283384"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="فتح الدعم الفني عبر واتساب في نافذة جديدة"
                className="group flex items-center justify-center gap-2 rounded-xl bg-[#25d366]/20 px-4 py-2.5 text-[13px] font-bold text-[#25d366] transition-all duration-200 hover:bg-[#25d366]/30 hover:shadow-lg hover:shadow-[#25d366]/10"
              >
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  support_agent
                </span>
                الدعم الفني عبر واتساب
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/[0.08]" />
          <span className="text-[11px] font-black tracking-widest text-white/20">
            {platformName}
          </span>
          <div className="h-px flex-1 bg-white/[0.08]" />
        </div>

        {/* Copyright */}
        <p className="mt-4 text-center text-[11px] font-bold text-white/30">
          © {new Date().getFullYear()} منصة {platformName} المجتمعية — جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  );
}
