"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSiteConfig } from "@/context/SiteConfigContext";
import BrandMark from "@/components/ui/BrandMark";

const QUICK_LINKS = [
  { href: "/browse", label: "تصفح الأغراض", authRequired: false },
  { href: "/donation-requests", label: "طلبات التبرع", authRequired: false },
  { href: "/hubs", label: "مراكز التسليم", authRequired: false },
  { href: "/leaderboard", label: "المتصدرون", authRequired: true },
] as const;

const ACTION_LINKS = [
  { href: "/add-item", label: "إضافة تبرع" },
  { href: "/donation-requests/new", label: "إنشاء طلب" },
  { href: "/dashboard", label: "لوحة التحكم" },
] as const;

const GUEST_ACTION_LINKS = [
  { href: "/register", label: "إنشاء حساب" },
  { href: "/login", label: "تسجيل الدخول" },
] as const;

export default function Footer() {
  const { platformName, contactEmail } = useSiteConfig();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  const visibleQuickLinks = QUICK_LINKS.filter(
    (link) => !link.authRequired || (!authLoading && isAuthenticated)
  );
  const visibleActionLinks =
    !authLoading && isAuthenticated ? ACTION_LINKS : GUEST_ACTION_LINKS;

  return (
    <footer dir="rtl" className="relative overflow-hidden bg-[#073f39] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_110%,rgba(255,255,255,0.10),transparent_28rem)]" />
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full border-[60px] border-white/[0.025]" />

      <div className="site-container relative py-12 md:py-14">
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.35fr_0.75fr_0.75fr_1fr] lg:gap-8">
          <div className="max-w-md">
            <Link
              href="/"
              aria-label={`العودة إلى الرئيسية — ${platformName}`}
              className="inline-flex rounded-xl"
            >
              <BrandMark
                name={platformName}
                inverted
                tagline="العطاء أقرب وأسهل"
              />
            </Link>
            <p className="mt-5 text-sm leading-7 text-white/60">
              مساحة مجتمعية تنظّم التبرع العيني من عرض الغرض إلى تنسيق الاستلام،
              بخطوات واضحة تحترم وقت وخصوصية الطرفين.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-[11px] font-bold text-white/65">
              <span
                className="material-symbols-outlined text-[15px] text-[#f0c77f]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
              حجز منظم وتأكيد تسليم من الطرفين
            </div>
          </div>

          <div>
            <h2 className="text-xs font-black text-white">استكشف</h2>
            <nav aria-label="روابط التذييل" className="mt-4 flex flex-col items-start gap-1">
              {visibleQuickLinks.map((link) => {
                const isActive =
                  pathname === link.href || pathname.startsWith(`${link.href}/`);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-xs font-bold text-white/58 hover:bg-white/[0.06] hover:text-white"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <h2 className="text-xs font-black text-white">ابدأ الآن</h2>
            <nav aria-label="روابط الإجراءات" className="mt-4 flex flex-col items-start gap-1">
              {visibleActionLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-xs font-bold text-white/58 hover:bg-white/[0.06] hover:text-white"
                >
                  <span className="material-symbols-outlined text-[15px] text-white/30">
                    arrow_back
                  </span>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-xs font-black text-white">تحتاج مساعدة؟</h2>
            <p className="mt-4 text-xs leading-6 text-white/50">
              تواصل مع فريق الدعم عند مواجهة مشكلة في الحساب أو عملية التسليم.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={`mailto:${contactEmail}`}
                aria-label={`مراسلة الدعم عبر البريد: ${contactEmail}`}
                className="flex min-w-0 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3 text-xs font-bold text-white/70 hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
              >
                <span className="material-symbols-outlined text-[17px]">mail</span>
                <span dir="ltr" className="truncate">
                  {contactEmail}
                </span>
              </a>
              <a
                href="https://wa.me/962797283384"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="فتح الدعم الفني عبر واتساب في نافذة جديدة"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#54d88b]/20 bg-[#25d366]/10 px-3 py-3 text-xs font-black text-[#70e39f] hover:bg-[#25d366]/16"
              >
                <span className="material-symbols-outlined text-[17px]">support_agent</span>
                الدعم عبر واتساب
              </a>
            </div>
          </div>
        </div>

        <div className="safe-area-bottom flex flex-col gap-3 pt-6 text-[11px] font-bold text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {platformName}. جميع الحقوق محفوظة.</p>
          <nav aria-label="الروابط القانونية" className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/privacy" className="hover:text-white">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="hover:text-white">
              شروط الاستخدام
            </Link>
            <span>صُممت لتجعل مشاركة الخير أوضح وأكثر كرامة.</span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
