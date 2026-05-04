// src/types/api.types.ts
// الأنواع المشتركة بين كل الـ API calls

// ── شكل الـ Error الموحّد من الـ Backend ─────────────────────────
export interface ApiError {
  msg: string;
}

// ── Pagination ────────────────────────────────────────────────────
export interface PaginationQuery {
  page?: number;
  limit?: number;
  category?: ItemCategory;
  location?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  pages: number;
  page: number;
}

// ── التصنيفات المتاحة — مطابقة للـ Backend enum ─────────────────
export type ItemCategory =
  | 'كتب'
  | 'إلكترونيات'
  | 'أثاث'
  | 'أخرى'
  | 'ملابس';

// ── حالات الغرض — مطابقة للـ Backend enum (4 حالات) ────────────
export type ItemStatus =
  | 'متاح'
  | 'محجوز'
  | 'تم التسليم'
  | 'مخفي';        // ✅ كانت مفقودة

// ── طريقة التسليم ────────────────────────────────────────────────
export type HandoverMode = 'direct' | 'hub';

// ── Toast notification ────────────────────────────────────────────
export interface ToastState {
  msg: string;
  type: 'success' | 'error' | 'info';
}