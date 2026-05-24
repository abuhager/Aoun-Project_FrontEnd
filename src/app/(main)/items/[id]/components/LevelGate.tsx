'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface LevelGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function LevelGate({ children, fallback }: LevelGateProps) {
  const { user } = useAuth();

  if (!user || user.trustLevel < 2) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="w-full py-4 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-2 px-4">
        <p className="text-sm font-black text-amber-800">
          🔒 يجب التحقق من هويتك أولاً
        </p>
        <p className="text-xs text-amber-600 font-medium">
          فعّل حسابك عبر البريد الجامعي أو رقم الجوال للحجز
        </p>

        <Link
          href="/profile"
          className="inline-block mt-1 text-xs font-bold text-primary underline"
        >
          الذهاب للتحقق ←
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}