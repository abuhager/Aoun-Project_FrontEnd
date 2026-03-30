import type { Metadata } from "next";
import { Inter, Tajawal, Cairo } from "next/font/google"; 
import "./globals.css";
import Navbar from "../components/Navbar"; 
import Footer from '@/components/Footer';

// إعداد الخطوط بشكل احترافي لتقليل الـ Layout Shift
const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const tajawal = Tajawal({ subsets: ["arabic"], weight: ['400', '500', '700', '800', '900'], variable: '--font-headline' });
const cairo = Cairo({ subsets: ["arabic"], weight: ['400', '500', '600', '700'], variable: '--font-body' });

export const metadata: Metadata = {
  title: "منصة عون | للتكافل الاجتماعي",
  description: "المنصة الجامعية الأولى لتبادل الأغراض والكتب بين الطلاب مجاناً",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; 
}>) {
  return (
    <html lang="ar" dir="rtl"> 
      <head>
        {/* 🟢 حل مشكلة الكلمات الغريبة: استدعاء مكتبة الأيقونات بشكل صحيح */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${cairo.variable} ${tajawal.variable} ${inter.className} bg-surface min-h-screen flex flex-col`}>
        <Navbar />
        
        {/* الـ main مع flex-grow يضمن بقاء الفوتر في الأسفل دائماً */}
        <main className="flex-grow">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}