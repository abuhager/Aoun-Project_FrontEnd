// src/types/api.types.ts
// الأنواع المشتركة بين كل الـ API calls
// تخصيص: لا تضع هنا ما هو معرّف في item.types.ts أو user.types.ts

// ── شكل الـ Error الموحّد من الـ Backend ───────────────────
export interface ApiError {
  msg: string;
}

// ── Pagination ─────────────────────────────────────────────
export interface PaginationQuery {
  page?:     number;
  limit?:    number;
  category?: string;
  location?: string;
  search?:   string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  pages: number;
  page:  number;
}

// ── Toast notification ───────────────────────────────────
export interface ToastState {
  msg:  string;
  type: 'success' | 'error' | 'info';
}
