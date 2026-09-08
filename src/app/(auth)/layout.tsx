// src/app/(auth)/layout.tsx
import Navbar from "@/components/Navbar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        تجاوز إلى المحتوى الرئيسي
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 scroll-mt-16 pt-16">
        {children}
      </main>
    </>
  );
}
