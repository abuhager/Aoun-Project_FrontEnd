import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
// استدعينا الـ Navbar من المجلد اللي عملناه
import Navbar from "../components/Navbar"; 


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "منصة عون",
  description: "المنصة الجامعية لتبادل الأغراض",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; 
}>) {
  return (
    // ضفنا dir="rtl" عشان الموقع يصير من اليمين لليسار
    <html lang="ar" dir="rtl"> 
    <head>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700;800&family=Be+Vietnam+Pro:wght@400;500;600&family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
</head>
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}