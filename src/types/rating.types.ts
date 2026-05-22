// src/types/rating.types.ts
export const RATING_POINTS: Record<1 | 2 | 3 | 4 | 5, number> = {
  5: 5,
  4: 3,
  3: 1,
  2: 0,  // ← لا خصم
  1: 0,  // ← لا خصم
} as const;

// للعرض في الواجهة
export const RATING_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  5: 'ممتاز 🌟',
  4: 'جيد جداً 👍',
  3: 'مقبول 🙂',
  2: 'ضعيف 😕',
  1: 'سيئ 😞',
} as const;