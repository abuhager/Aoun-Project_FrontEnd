// ✅ لا Navbar هنا — MainLayout يوفّره بالفعل
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}