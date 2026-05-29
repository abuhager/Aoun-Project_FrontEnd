"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { href: "/admin", icon: "dashboard", label: "نظرة عامة" },
  { href: "/admin/users", icon: "group", label: "المستخدمون" },
  { href: "/admin/items", icon: "inventory_2", label: "الأغراض" },
  { href: "/admin/reports", icon: "flag", label: "البلاغات" },
  { href: "/admin/logs", icon: "history", label: "سجل العمليات" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-3xl">
          progress_activity
        </span>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen bg-[#f7f6f2]" dir="rtl">
      <aside className="w-56 bg-white border-l border-gray-100 shadow-sm fixed top-0 right-0 h-full pt-16 md:pt-20 flex flex-col z-30">
        <div className="px-4 py-4 border-b border-gray-100">
          <span className="flex items-center gap-2 text-xs font-black text-primary bg-primary/8 px-3 py-2 rounded-xl">
            <span className="material-symbols-outlined text-base">
              admin_panel_settings
            </span>
            لوحة الإدارة
          </span>
        </div>

        <nav className="flex flex-col gap-1 px-3 pt-4 flex-1">
          {NAV.map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive(href)
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {icon}
              </span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-6">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
            العودة للموقع
          </Link>
        </div>
      </aside>

      <main className="flex-1 mr-56 pt-16 md:pt-20 px-8 pb-8 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}