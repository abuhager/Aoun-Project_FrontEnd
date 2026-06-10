// src/components/UrgencyBadge.tsx
// [FIX-6] urgency موجودة في الـ model لكن لم تُعرض — هذا المكوّن يعرضها
import React from 'react';
const config = {
  low:    { label:'عادي',  icon:'🟢', cls:'bg-green-50  border-green-100  text-green-700'  },
  medium: { label:'متوسط', icon:'🟡', cls:'bg-amber-50  border-amber-100  text-amber-700'  },
  high:   { label:'عاجل',  icon:'🔴', cls:'bg-red-50    border-red-100    text-red-700'    },
};
export default function UrgencyBadge({ urgency }: { urgency?:'low'|'medium'|'high' }) {
  if (!urgency || !(urgency in config)) return null;
  const { label, icon, cls } = config[urgency];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${cls}`}>
      {icon} {label}
    </span>
  );
}
