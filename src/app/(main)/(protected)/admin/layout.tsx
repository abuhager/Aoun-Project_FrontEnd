// src/app/(main)/(protected)/admin/layout.tsx
// ✅ Patched: إضافة رابط الإعدادات
"use client";

import Link      from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin",          label: "لوحة التحكم",  icon: "dashboard"          },
  { href: "/admin/users",    label: "المستخدمون",   icon: "group"              },
  { href: "/admin/items",    label: "الأغراض",      icon: "inventory_2"        },
  { href: "/admin/reports",  label: "البلاغات",     icon: "flag"               },
  { href: "/admin/logs",     label: "السجلات",      icon: "history"            },
  { href: "/admin/settings", label: "الإعدادات",    icon: "settings"           }, // ✅ جديد
  { href: "/admin/hubs",     label: "مراكز التسليم", icon: "warehouse"          }, // ✅ جديد
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface" dir="rtl">
      {/* Sidebar */}
      <aside className="fixed top-0 right-0 h-full w-56 bg-white border-l border-gray-100
        shadow-sm pt-20 z-40 hidden md:flex flex-col">
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold
                  transition-all ${isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`}
              >
                <span className={`material-symbols-outlined text-base
                  ${isActive ? "text-primary" : "text-gray-400"}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100
        z-40 flex md:hidden justify-around py-2 px-2">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl
                transition-all ${isActive ? "text-primary" : "text-gray-400"}`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="text-[9px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Content */}
      <main className="md:mr-56 pt-20 md:pt-24 px-4 md:px-8 pb-24 md:pb-8 max-w-5xl">
        {children}
      </main>
    </div>
  );
}
