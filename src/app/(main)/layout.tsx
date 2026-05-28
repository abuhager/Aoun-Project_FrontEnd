"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const hideFooter = pathname.startsWith("/admin");

  return (
    <>
      <Navbar />
      {children}
      {!hideFooter && <Footer />}
    </>
  );
}