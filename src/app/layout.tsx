import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import "material-symbols/outlined.css";
import "@/assets/fonts/fonts.css";
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

export const metadata: Metadata = {
  title: {
    default: "عون | Aoun",
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
};

// ── Layout الرئيسي ─────────────────────────────────────────────
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // The per-request CSP nonce is created in proxy.ts. Static HTML is generated
  // before that nonce exists, so it would ship blocked inline Next.js scripts.
  await connection();

  return (
    <html
      lang="ar"
      dir="rtl"
      data-scroll-behavior="smooth"
      className="font-loaded"
    >
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
