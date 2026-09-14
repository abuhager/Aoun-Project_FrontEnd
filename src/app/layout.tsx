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
const seoTitle = "منصة عون | تبرعات عينية في الأردن";
const seoDescription =
  "منصة عون للتبرعات العينية في الأردن، تربط المتبرعين بالمستفيدين لعرض الأغراض وطلبات الاحتياج والحجز والتواصل وتنسيق التسليم بطريقة واضحة وآمنة.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#006155",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: seoTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: seoDescription,
  applicationName: "عون | Aoun",
  authors: [{ name: "منصة عون" }],
  creator: "منصة عون",
  publisher: "منصة عون",
  category: "Charity",
  keywords: [
    "عون",
    "Aoun",
    "منصة عون",
    "منصة عون للتبرعات",
    "عون للتبرعات العينية",
    "التبرعات العينية",
    "التبرعات العينية في الأردن",
    "تبرعات الأردن",
    "تبرع في الأردن",
    "تبرع بالأغراض",
    "تبرع بأثاث",
    "تبرع بملابس",
    "أغراض للتبرع",
    "طلبات احتياج",
    "منصة تبرعات",
    "العمل الخيري في الأردن",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "ar_JO",
    url: siteUrl,
    siteName: "منصة عون | Aoun",
    title: seoTitle,
    description: seoDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: seoTitle,
    description: seoDescription,
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
      name: "منصة عون",
      alternateName: ["عون", "Aoun", "Aoun Platform"],
      inLanguage: "ar-JO",
      description: seoDescription,
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "منصة عون",
      alternateName: ["عون", "Aoun"],
      url: siteUrl,
      email: siteConfig.contactEmail,
      logo: `${siteUrl}/icon.svg`,
      areaServed: {
        "@type": "Country",
        name: "Jordan",
      },
      description: seoDescription,
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
