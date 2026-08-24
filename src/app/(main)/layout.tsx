// src/app/(main)/layout.tsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        تجاوز إلى المحتوى الرئيسي
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 scroll-mt-20">
        {children}
      </main>
      <Footer />
    </>
  );
}
