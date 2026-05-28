// src/app/(auth)/layout.tsx
import Navbar from "@/components/Navbar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}