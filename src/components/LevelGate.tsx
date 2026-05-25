// src/components/LevelGate.tsx
// ✅ Phase 2 — Merged: نسخة نهائية تجمع أفضل ما في الاثنتين
'use client';

import { useState }       from 'react';
import { useAuth }        from '@/context/AuthContext';
import PhoneVerifyModal   from './PhoneVerifyModal';

interface LevelGateProps {
  requiredLevel?: 1 | 2;          // افتراضي: 2
  children:       React.ReactNode;
  fallback?:      React.ReactNode; // إذا لم يُمرَّر → رسالة amber الافتراضية
}

export function LevelGate({
  requiredLevel = 2,
  children,
  fallback,
}: LevelGateProps) {
  const { user, isLoading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  // ─── لا تعرض شيئاً أثناء تحميل الجلسة ─────────────────
  if (isLoading) return null;

  // ─── المستخدم يملك المستوى المطلوب ──────────────────────
  const userLevel = user?.trustLevel ?? 1;
  if (userLevel >= requiredLevel) return <>{children}</>;

  // ─── Fallback مخصص من الخارج ────────────────────────────
  if (fallback) return <>{fallback}</>;

  // ─── Fallback الافتراضي: رسالة amber + تفتح المودال ────
  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm hover:bg-amber-100 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
        <span>تحتاج لتفعيل حسابك (رقم واتسآب أو إيميل جامعي) للحجز</span>
      </button>

      <PhoneVerifyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

// ✅ default export أيضاً للتوافق مع import styles المختلفة
export default LevelGate;