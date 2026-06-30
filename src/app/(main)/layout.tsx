import type { Metadata } from "next";
import { Tajawal, Cairo } from "next/font/google";
import "@/app/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import GlobalRatingModal from "@/components/GlobalRatingModal";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import { getPublicSettings } from "@/lib/api/settingsApi";
import { siteConfig } from "@/config/site.config";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-headline",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const name = settings?.platformName ?? siteConfig.name;
  return {
    title: { default: name, template: `%s | ${name}` },
    description: siteConfig.description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getPublicSettings();

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${tajawal.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface min-h-screen text-on-surface antialiased">
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
            <GlobalRatingModal />
            {children}
          </AuthProvider>
        </SiteConfigProvider>
      </body>
    </html>
  );
}