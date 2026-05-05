// src/components/LevelGate.tsx
// ================================================================
// ✅ PHASE 2 Prep — LevelGate Component
//
// يخفي / يظهر زر الحجز بناءً على trustLevel الخاص بالمستخدم
//
// الاستخدام:
//   <LevelGate requiredLevel={2} user={user}>
//     <BookButton />
//   </LevelGate>
//
// BLAST RADIUS:
//   Direct:     صفحات العرض تستخدمه لإخفاء زر الحجز
//   Cross-Repo: Backend requireLevel2 middleware هو الحارس الحقيقي
//   DB:         لا يوجد
// ================================================================
'use client';

import type { AuthUser } from '@/types';

interface LevelGateProps {
  /** المستوى المطلوب للظهور */
  requiredLevel: 1 | 2;
  /** بيانات المستخدم الحالي */
  user: AuthUser | null;
  /** المحتوى المحمي */
  children: React.ReactNode;
  /** ما يظهر بدلاً عن children للمستخدم غير المؤهّل (اختياري) */
  fallback?: React.ReactNode;
}

export function LevelGate({
  requiredLevel,
  user,
  children,
  fallback,
}: LevelGateProps) {
  // لا يوجد مستخدم → لا يظهر شيء
  if (!user) return fallback ? <>{fallback}</> : null;

  // لو المستوى كافي → اظهر المحتوى
  const userLevel = user.trustLevel ?? 1;
  if (userLevel >= requiredLevel) return <>{children}</>;

  // مستوى غير كافي → fallback أو رسالة توضيحية
  if (fallback) return <>{fallback}</>;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <span>تحتاج لتفعيل حسابك (رقم واتسآب أو إيميل جامعي) للحجز</span>
    </div>
  );
}
