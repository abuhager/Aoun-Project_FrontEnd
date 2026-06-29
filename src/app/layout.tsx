import type { Metadata } from "next";
import { Tajawal, Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import GlobalRatingModal from "@/components/GlobalRatingModal";

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

export const metadata: Metadata = {
  title: {
    default: "منصة عون | للتكافل الاجتماعي",
    template: "%s | منصة عون",
  },
  description: "منصة مفتوحة للتكافل الاجتماعي وتبادل الأغراض والخدمات مجاناً.",
  applicationName: "Aoun Platform",
  keywords: [
    "عون",
    "منصة عون",
    "التكافل الاجتماعي",
    "التبرع",
    "تبادل الأغراض",
    "الخدمات المجانية",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${tajawal.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="bg-surface min-h-screen text-on-surface antialiased">
        <AuthProvider>
          <GlobalRatingModal />
          <main className="flex min-h-screen flex-col">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}