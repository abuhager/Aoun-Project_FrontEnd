"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "لوحة التحكم", icon: "dashboard" },
  { href: "/admin/users", label: "المستخدمون", icon: "group" },
  { href: "/admin/items", label: "الأغراض", icon: "inventory_2" },
  { href: "/admin/reports", label: "البلاغات", icon: "flag" },
  { href: "/admin/logs", label: "السجلات", icon: "history" },
  { href: "/admin/settings", label: "الإعدادات", icon: "settings" },
  { href: "/admin/hubs", label: "مراكز التسليم", icon: "warehouse" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div dir="rtl" className="min-h-screen bg-[#f6f4ef] text-[#1f2328]">
      {/* ── Desktop Sidebar ───────────────────────────── */}
      <aside className="fixed top-[64px] bottom-0 right-0 z-40 hidden w-[290px] border-l border-[#e6e0d7] bg-white/95 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-md lg:flex lg:flex-col">
        {/* Brand / top */}
        <div className="border-b border-[#f0ebe4] px-5 pb-5 pt-6">
          <div className="rounded-[24px] border border-[#ebe5dc] bg-[linear-gradient(180deg,#fffdfa_0%,#f8f5ef_100%)] p-4 shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[24px]">
                  admin_panel_settings
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-xs font-extrabold tracking-[0.18em] text-[#9b948b]">
                  AOUN ADMIN
                </p>
                <h2 className="mt-1 text-base font-black text-[#1f312f]">
                  لوحة الإدارة
                </h2>
                <p className="mt-1 text-xs leading-6 text-[#847d75]">
                  إدارة المستخدمين، الأغراض، البلاغات والإعدادات من مكان واحد.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* nav */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-3 px-2">
            <p className="text-[11px] font-extrabold tracking-[0.22em] text-[#a19990]">
              التنقل الإداري
            </p>
          </div>

          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3.5 py-3 text-sm font-bold transition-all duration-300 ease-out",
                    isActive
                      ? "bg-primary text-white shadow-[0_10px_24px_rgba(1,105,111,0.18)]"
                      : "text-[#62605b] hover:bg-[#f8f5ef] hover:text-[#1f312f]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                      isActive
                        ? "bg-white/15 text-white"
                        : "bg-[#f3efe9] text-[#7b756d] group-hover:bg-white",
                    ].join(" ")}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {item.icon}
                    </span>
                  </span>

                  <span className="truncate">{item.label}</span>

                  {isActive && (
                    <span className="absolute left-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white/90" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* footer note */}
        <div className="border-t border-[#f0ebe4] px-5 py-4">
          <div className="rounded-2xl bg-[#faf8f4] px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#6e6a64]">
              <span className="material-symbols-outlined text-[16px] text-primary">
                verified_user
              </span>
              جلسة إدارية نشطة
            </div>
            <p className="mt-1 text-[11px] leading-6 text-[#9a938a]">
              تأكد من مراجعة البلاغات والسجلات بشكل دوري للحفاظ على جودة المنصة.
            </p>
          </div>
        </div>
      </aside>

      {/* ── Mobile Top Header ───────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-[#e8e2d9] bg-white/90 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-[10px] font-extrabold tracking-[0.18em] text-[#a19990]">
              AOUN ADMIN
            </p>
            <h1 className="text-sm font-black text-[#1f312f]">لوحة الإدارة</h1>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[22px]">
              admin_panel_settings
            </span>
          </div>
        </div>
      </header>

      {/* ── Main area ───────────────────────────────── */}
      <div className="pt-[64px] lg:mr-[290px]">


        {/* page content wrapper */}
        <main className="px-4 pb-24 pt-5 sm:px-5 md:px-6 lg:px-8 lg:pb-10 lg:pt-6 xl:px-10">
          <div className="mx-auto w-full max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Nav ───────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e7e1d8] bg-white/95 px-2 py-2 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-md lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 transition-all duration-300",
                  isActive
                    ? "bg-primary text-white shadow-[0_8px_20px_rgba(1,105,111,0.16)]"
                    : "text-[#8a837a]",
                ].join(" ")}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span className="text-[10px] font-extrabold leading-none">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}