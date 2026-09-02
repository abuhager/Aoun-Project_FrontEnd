/* eslint-disable @next/next/no-page-custom-font, @next/next/google-font-display -- Material Symbols use a blocking first paint so ligature names never distort the layout. */

import type { Metadata, Viewport } from "next";
import { Tajawal, Cairo } from "next/font/google";
import "./globals.css";

import { AuthProvider }       from "@/context/AuthContext";
import GlobalRatingModal      from "@/components/GlobalRatingModal";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import { siteConfig }         from "@/config/site.config";
import { SocketProvider }     from "@/context/SocketContext";
import MaintenanceGate       from "@/components/MaintenanceGate";
import SettingsSync          from "@/components/SettingsSync";
import ApiStateProvider      from "@/components/ApiStateProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#006155",
};

// ── الخطوط ─────────────────────────────────────────────────────
const tajawal = Tajawal({
  subsets:  ["arabic"],
  weight:   ["400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display:  "swap",
});

const cairo = Cairo({
  subsets:  ["arabic"],
  weight:   ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display:  "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

// ── Layout الرئيسي ─────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      data-scroll-behavior="smooth"
      className={`${cairo.variable} ${tajawal.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>

      {/* body: flex column لضمان توزيع العناصر بشكل مرن */}
      <body className="flex min-h-dvh flex-col overflow-x-clip bg-surface text-on-surface antialiased">
        <ApiStateProvider initialPublicSettings={null}>
          <SiteConfigProvider settings={null}>
            <AuthProvider>
              {/*
                ✅ ARCH-01: الترتيب الصحيح للـ Providers (من الخارج للداخل):
                SiteConfigProvider → AuthProvider → SocketProvider → [Modal + Children]

                القاعدة: كل Provider يعتمد على من يسبقه من الخارج
                - SocketProvider داخل AuthProvider: لأنه يحتاج بيانات المستخدم للاتصال
                - GlobalRatingModal داخل SocketProvider: لأنها قد تستمع لـ Socket events
              */}
              <SocketProvider>
                <SettingsSync />
                <MaintenanceGate>
                  <GlobalRatingModal />
                  {children}
                </MaintenanceGate>
              </SocketProvider>
            </AuthProvider>
          </SiteConfigProvider>
        </ApiStateProvider>
      </body>
    </html>
  );
}
