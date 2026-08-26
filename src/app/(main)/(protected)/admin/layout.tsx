"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "نظرة عامة", icon: "space_dashboard", group: "الرئيسية" },
  { href: "/admin/users", label: "المستخدمون", icon: "group", group: "الإدارة" },
  { href: "/admin/items", label: "الأغراض", icon: "inventory_2", group: "الإدارة" },
  { href: "/admin/reports", label: "البلاغات", icon: "flag", group: "المتابعة" },
  { href: "/admin/logs", label: "سجل العمليات", icon: "history", group: "المتابعة" },
  { href: "/admin/settings", label: "الإعدادات", icon: "tune", group: "النظام" },
  { href: "/admin/hubs", label: "مراكز التسليم", icon: "warehouse", group: "النظام" },
] as const;

const GROUPS = ["الرئيسية", "الإدارة", "المتابعة", "النظام"] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isItemActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <div dir="rtl" className="min-h-dvh min-w-0 bg-[#eef3f2] text-on-surface">
      <aside className="fixed bottom-0 right-0 top-[68px] z-40 hidden w-[268px] flex-col overflow-hidden border-l border-white/[0.07] bg-[linear-gradient(180deg,#102a30_0%,#0b2024_100%)] text-white shadow-[0_18px_60px_rgba(4,24,27,0.22)] lg:flex">
        <div className="border-b border-white/[0.07] px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[14px_5px_14px_14px] bg-[#f0be69] text-[#173039] shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
              <span className="material-symbols-outlined text-[23px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                admin_panel_settings
              </span>
            </span>
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-[#f0be69]">AOUN CONTROL</p>
              <h1 className="mt-1 text-base font-black text-white">مركز إدارة المنصة</h1>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-300/10 bg-emerald-300/[0.06] px-3 py-2 text-[10px] font-bold text-emerald-100/75">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
            </span>
            اتصال الإدارة نشط
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="التنقل الإداري">
          {GROUPS.map((group) => (
            <div key={group} className="mb-4 last:mb-0">
              <p className="mb-1.5 px-3 text-[9px] font-black tracking-[0.16em] text-white/30">{group}</p>
              <div className="space-y-1">
                {NAV_ITEMS.filter((item) => item.group === group).map((item) => {
                  const isActive = isItemActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`group relative flex min-h-12 items-center gap-3 rounded-[14px] px-3 text-sm font-bold transition-all ${
                        isActive
                          ? "bg-white text-[#102a30] shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                          : "text-white/58 hover:bg-white/[0.07] hover:text-white"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-primary" : "text-white/45 group-hover:text-[#f0be69]"}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {isActive && <span className="mr-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/[0.07] p-4">
          <div className="rounded-[14px] border border-white/[0.07] bg-white/[0.045] p-3">
            <p className="flex items-center gap-2 text-[11px] font-black text-white/80">
              <span className="material-symbols-outlined text-[16px] text-[#f0be69]">shield_lock</span>
              إجراءات حساسة ومسجّلة
            </p>
            <p className="mt-1 text-[10px] leading-5 text-white/35">كل تعديل إداري يظهر في سجل العمليات للمراجعة.</p>
          </div>
        </div>
      </aside>

      <header className="sticky top-16 z-30 border-b border-white/[0.08] bg-[#102a30]/96 px-4 py-3 text-white shadow-lg backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black tracking-[0.18em] text-[#f0be69]">AOUN CONTROL</p>
            <p className="mt-0.5 text-sm font-black">مركز إدارة المنصة</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#f0be69]">
            <span className="material-symbols-outlined text-[21px]">admin_panel_settings</span>
          </span>
        </div>
      </header>

      <div className="min-w-0 pt-16 lg:mr-[268px] lg:pt-[68px]">
        <div className="min-w-0 px-4 pb-28 pt-5 sm:px-5 md:px-6 lg:px-8 lg:pb-10 lg:pt-7 xl:px-10">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </div>
      </div>

      <nav className="safe-area-bottom fixed bottom-0 left-0 right-0 z-40 overflow-x-auto border-t border-white/[0.08] bg-[#102a30]/97 px-2 pt-2 shadow-[0_-12px_30px_rgba(4,24,27,0.2)] backdrop-blur-xl lg:hidden" aria-label="التنقل الإداري على الهاتف">
        <div className="mx-auto flex w-max min-w-full gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = isItemActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-[54px] min-w-[76px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition-all ${
                  isActive ? "bg-white text-[#102a30]" : "text-white/45"
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-primary" : ""}`}>{item.icon}</span>
                <span className="text-[9px] font-black leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
