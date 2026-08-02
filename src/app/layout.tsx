// src/app/layout.tsx — FULLY PATCHED (Flow-1 Audit)
// ✅ ARCH-01: ترتيب الـ Providers صحيح — SocketProvider يغلِّف GlobalRatingModal و children
//             السبب: GlobalRatingModal قد تستمع لـ Socket events → يجب أن تكون داخل SocketProvider
// ✅ LOGIC-03: getPublicSettings() محاطة بـ .catch(() => null) في موضعين
//             السبب: هذه Server Component تعمل عند كل request — أي فشل في الـ API
//             يُعطِّل الموقع كله بدون هذا الـ catch. مع الإصلاح: fallback للقيم الافتراضية

import type { Metadata } from "next";
import { Tajawal, Cairo } from "next/font/google";
import "./globals.css";

import { AuthProvider }       from "@/context/AuthContext";
import GlobalRatingModal      from "@/components/GlobalRatingModal";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import { getPublicSettings }  from "@/lib/api/settingsApi";
import { siteConfig }         from "@/config/site.config";
import { SocketProvider }     from "@/context/SocketContext";

// ── الخطوط ─────────────────────────────────────────────────────
const tajawal = Tajawal({
  subsets:  ["arabic"],
  weight:   ["400", "500", "700", "800", "900"],
  variable: "--font-headline",
  display:  "swap",
});

const cairo = Cairo({
  subsets:  ["arabic"],
  weight:   ["400", "500", "600", "700"],
  variable: "--font-body",
  display:  "swap",
});

// ── Metadata ديناميكية ─────────────────────────────────────────
export async function generateMetadata(): Promise<Metadata> {
  // ✅ LOGIC-03: فشل الـ API لا يكسر generateMetadata — يرجع لـ siteConfig كـ fallback
  const settings = await getPublicSettings().catch(() => null);
  const name     = settings?.platformName ?? siteConfig.name;

  return {
    title:       { default: name, template: `%s | ${name}` },
    description: siteConfig.description,
  };
}

// ── Layout الرئيسي ─────────────────────────────────────────────
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  // ✅ LOGIC-03: .catch(() => null) — Backend بطيء أو معطَّل لا يكسر كل صفحة في الموقع
  const settings = await getPublicSettings().catch(() => null);

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${tajawal.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>

      {/* body: flex column لضمان توزيع العناصر بشكل مرن */}
      <body className="flex min-h-screen flex-col bg-surface text-on-surface antialiased">
        <SiteConfigProvider
          settings={
            settings?.platformName
              ? {
                  platformName: settings.platformName,
                  contactEmail: settings.contactEmail ?? "aoun.help.center@gmail.com",
                }
              : null
          }
        >
          <AuthProvider>
            {/*
              ✅ ARCH-01: الترتيب الصحيح للـ Providers (من الخارج للداخل):
              SiteConfigProvider → AuthProvider → SocketProvider → [Modal + Children]

              القاعدة: كل Provider يعتمد على من يسبقه من الخارج
              - SocketProvider داخل AuthProvider: لأنه يحتاج بيانات المستخدم للاتصال
              - GlobalRatingModal داخل SocketProvider: لأنها قد تستمع لـ Socket events
            */}
            <SocketProvider>
              <GlobalRatingModal />
              {children}
            </SocketProvider>
          </AuthProvider>
        </SiteConfigProvider>
      </body>
    </html>
  );
}