"use client";
import { useSettings } from "@/hooks/useSettings";
import Link from "next/link";
export default function DonationRequestsLayout({ children }: { children: React.ReactNode }) {
  const { settings, isLoading, isError, refresh } = useSettings();
  if (isLoading) return <p role="status" className="p-20 text-center">جارٍ تحميل إعدادات المنصة…</p>;
  if (isError) return <div className="p-20 text-center" role="alert">تعذر تحميل الإعدادات. <button onClick={() => void refresh()}>إعادة المحاولة</button></div>;
  if (settings?.donationRequestsEnabled === false) return <section dir="rtl" className="mx-auto my-24 max-w-xl rounded-3xl bg-white p-8 text-center"><h1 className="text-xl font-black">طلبات التبرع متوقفة مؤقتاً</h1><p className="my-4">أوقفت الإدارة هذا القسم مؤقتاً. طلباتك السابقة محفوظة.</p><Link href="/browse" className="btn-primary">تصفح الأغراض المتاحة</Link></section>;
  return children;
}
