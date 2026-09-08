// src/app/(main)/(protected)/layout.tsx
// ✅ FL13-01 FIX: ProtectedLayout كان فارغاً تماماً — لا Route Guard ولا Role Guard
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const ADMIN_PATHS = ['/admin'];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, authStatus, refreshSession } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && authStatus !== 'offline-refresh-failed') {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
    if (isAdminPath && user?.role !== 'admin' && user?.role !== 'super_admin') {
      router.replace('/browse');
    }
  }, [authStatus, isLoading, isAuthenticated, user?.role, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
      </div>
    );
  }

  if (authStatus === 'offline-refresh-failed') {
    return (
      <div className="page-shell flex min-h-dvh items-center justify-center px-4" dir="rtl">
        <div className="max-w-md rounded-3xl border border-amber-200 bg-amber-50 p-7 text-center">
          <h1 className="text-lg font-black text-amber-900">تعذر التحقق من الجلسة</h1>
          <p className="mt-2 text-sm font-semibold leading-7 text-amber-800">
            يبدو أن الخدمة أو الشبكة غير متاحة مؤقتاً. لم نسجل خروجك.
          </p>
          <button className="btn-primary mt-5" onClick={() => void refreshSession()}>
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (isAdminPath && user?.role !== 'admin' && user?.role !== 'super_admin') {
    return null;
  }

  return <>{children}</>;
}
