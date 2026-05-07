// src/components/LevelGate.tsx
// ✅ PHASE 2 Prep — LevelGate Component
//
// يخفي / يظهر زر الحجز بناءً على trust level الخاص بالمستخدم
//
// الاستخدام:
//   <LevelGate requiredLevel={2} user={user}>
//     <BookButton />
//   </LevelGate>
//
// ❗️ Phase 1: trustLevel يُحسب من trustScore (>= 50 = Level 2)
//    Phase 2: يُضاف trustLevel لـ User schema ويرجع من الـ API
'use client';

import type { AuthUser } from '@/types';

interface LevelGateProps {
  requiredLevel: 1 | 2;
  user: AuthUser | null;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/** مؤقت: يحسب المستوى من trustScore حتى يُضاف trustLevel لـ DB في Phase 2 */
function getTrustLevel(user: AuthUser): 1 | 2 {
  if (user.isVerifiedStudent) return 2;
  if (user.trustScore >= 50)  return 2;
  return 1;
}

export function LevelGate({ requiredLevel, user, children, fallback }: LevelGateProps) {
  if (!user) return fallback ? <>{fallback}</> : null;

  const userLevel = getTrustLevel(user);
  if (userLevel >= requiredLevel) return <>{children}</>;

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
