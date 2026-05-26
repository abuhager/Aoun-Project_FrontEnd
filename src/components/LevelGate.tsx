'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PhoneVerifyModal from './PhoneVerifyModal';

interface LevelGateProps {
  requiredLevel?:           1 | 2;
  children:                 React.ReactNode;
  fallback?:                React.ReactNode;
  unauthenticatedFallback?: React.ReactNode;
}

export default function LevelGate({
  requiredLevel = 2,
  children,
  fallback,
  unauthenticatedFallback,
}: LevelGateProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  // ✅ Skeleton بدل null — يمنع layout shift
  if (isLoading) return (
    <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
  );

  if (!user) {
    if (unauthenticatedFallback) return <>{unauthenticatedFallback}</>;
    return (
      <button onClick={() => router.push('/login')} className="btn-secondary w-full">
        سجّل دخولك للمتابعة
      </button>
    );
  }

  if ((user.trustLevel ?? 1) >= requiredLevel) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
      >
        🔐 تحتاج لتفعيل حسابك للمتابعة
      </button>

      <PhoneVerifyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}