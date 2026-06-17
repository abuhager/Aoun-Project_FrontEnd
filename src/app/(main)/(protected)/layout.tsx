// src/app/(main)/(protected)/layout.tsx
// ✅ FL13-01 FIX: ProtectedLayout كان فارغاً تماماً — لا Route Guard ولا Role Guard
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const ADMIN_PATHS = ['/admin'];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
    if (isAdminPath && user?.role !== 'admin' && user?.role !== 'super_admin') {
      router.replace('/browse');
    }
  }, [isLoading, isAuthenticated, user?.role, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
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