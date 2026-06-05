// src/components/LevelGate.tsx
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
  requiredLevel           = 2,
  children,
  fallback,
  unauthenticatedFallback,
}: LevelGateProps) {
  const { user, isLoading, refreshSession } = useAuth();
  const [showModal, setShowModal]           = useState(false);
  const [refreshing, setRefreshing]         = useState(false);
  const router                              = useRouter();

  if (isLoading) return null;

  if (!user) {
    return unauthenticatedFallback ? (
      <>{unauthenticatedFallback}</>
    ) : (
      <button
        onClick={() => router.push('/login')}
        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition"
      >
        سجّل دخولك للمتابعة
      </button>
    );
  }

  const userLevel = user.trustLevel ?? 1;
  if (userLevel >= requiredLevel) return <>{children}</>;

  // ✅ FIX: refreshSession تُجدّد الـ JWT وتحمل trustLevel الجديد
  const handleRefreshLevel = async () => {
    setRefreshing(true);
    const success = await refreshSession();
    setRefreshing(false);
    if (!success) router.push('/login');
  };

  if (fallback) return <>{fallback}</>;

  return (
    <>
      <div className="flex flex-col items-center gap-3 p-6 bg-amber-50 border border-amber-200 rounded-xl text-center">
        <span className="text-3xl">🔐</span>
        <p className="text-sm text-amber-800 font-medium">
          يتطلب هذا الإجراء التحقق من الهوية (المستوى {requiredLevel})
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 transition"
          >
            ارفع مستواك الآن 📱
          </button>

          {/* ✅ زر إعادة التحقق بعد الترقية */}
          <button
            onClick={handleRefreshLevel}
            disabled={refreshing}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition disabled:opacity-50"
          >
            {refreshing ? '...' : 'تحديث ↻'}
          </button>
        </div>
      </div>

      {/* ✅ FIX: تمرير isOpen بدل mount/unmount + onSuccess ليست async */}
      <PhoneVerifyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          // PhoneVerifyModal استدعى refreshSession بالفعل داخله عند النجاح
          // نستدعيها مرة ثانية للتأكد من تحديث الـ LevelGate state
          handleRefreshLevel();
        }}
      />
    </>
  );
}