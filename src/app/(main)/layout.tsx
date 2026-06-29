"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideFooter = pathname.startsWith("/admin");

  return (
    <div
      dir="rtl"
      className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#f7f6f2] text-[#191c1d]"
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#fcfbf8_0%,#f7f6f2_45%,#f3f0ea_100%)]" />
        <div className="absolute right-0 top-0 h-[420px] w-[420px] translate-x-1/3 -translate-y-1/3 rounded-full bg-[#01696f]/[0.05] blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[360px] w-[360px] -translate-x-1/3 translate-y-1/3 rounded-full bg-[#005a8c]/[0.04] blur-3xl" />
      </div>

      {/* Persistent top navigation */}
      <div className="relative z-30">
        <Navbar />
      </div>

      {/* Main shell */}
      <main className="relative z-10 flex-1">
        <div className="mx-auto min-h-[calc(100vh-80px)] w-full">
          <div className="relative">
            {/* subtle top divider glow */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-black/5 to-transparent" />
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      {!hideFooter && (
        <div className="relative z-20 mt-10">
          <div className="mx-auto w-full">
            <div className="mx-4 md:mx-6 lg:mx-8">
              <div className="h-px bg-gradient-to-l from-transparent via-black/8 to-transparent" />
            </div>
            <div className="pt-2">
              <Footer />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}