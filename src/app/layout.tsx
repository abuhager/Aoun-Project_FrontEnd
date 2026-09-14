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

const siteUrl = "https://www.aoun.website";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#006155",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "عون | منصة للتبرعات العينية",
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "عون منصة عربية لتنسيق التبرعات العينية، تساعد المتبرعين والمستفيدين على عرض الأغراض وطلبات الاحتياج والحجز والتواصل وتنسيق التسليم بأمان ووضوح.",
  applicationName: "عون | Aoun",
  keywords: [
    "عون",
    "Aoun",
    "منصة عون",
    "التبرعات العينية",
    "تبرع",
    "تبرعات",
    "تبرع بالأغراض",
    "طلبات الاحتياج",
    "منصة تبرعات",
    "تبرعات الأردن",
    "العمل الخيري",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "ar_JO",
    url: siteUrl,
    siteName: "عون | Aoun",
    title: "عون | منصة للتبرعات العينية",
    description:
      "منصة عربية لتنظيم التبرعات العينية وطلبات الاحتياج والحجز والتواصل وتنسيق التسليم.",
  },
  twitter: {
    card: "summary_large_image",
    title: "عون | منصة للتبرعات العينية",
    description:
      "منصة عربية لتنظيم التبرعات العينية وطلبات الاحتياج والحجز والتواصل وتنسيق التسليم.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "عون",
      alternateName: ["Aoun", "منصة عون"],
      inLanguage: "ar",
      description:
        "منصة عربية لتنسيق التبرعات العينية وطلبات الاحتياج والحجز والتواصل وتنسيق التسليم.",
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "عون",
      alternateName: "Aoun",
      url: siteUrl,
      email: siteConfig.contactEmail,
      description:
        "منصة مجتمعية لتنظيم التبرعات العينية وطلبات الاحتياج وتنسيق التسليم.",
    },
  ],
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
      <body className="flex min-h-dvh flex-col overflow-x-clip bg-surface text-on-surface antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <ApiStateProvider initialPublicSettings={null}>
          <SiteConfigProvider settings={null}>
            <AuthProvider>
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
