// src/types/api.types.ts
// الأنواع المشتركة بين كل الـ API calls
// تخصيص: لا تضع هنا ما هو معرّف في item.types.ts أو user.types.ts


// ── شكل الـ Error الموحّد من الـ Backend ───────────────────
export interface ApiError {
  status?:    'fail' | 'error';
  msg?:       string;
  message?:   string;
  code?:      string;
  requestId?: string;
  field?:     string;
  errors?:    string[];
  details?:   unknown;
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


// ── ✅ جديد — دالة موحّدة لاستخراج رسالة الخطأ ─────────────
// بدل ما تكتب في كل catch: (error as any).response?.data?.msg
// استخدم: extractApiError(error)
export function extractApiError(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const axiosError = error as { response?: { data?: ApiError } };
    return axiosError.response?.data?.msg
      ?? axiosError.response?.data?.message
      ?? 'حدث خطأ غير متوقع';
  }
  if (error instanceof Error) return error.message;
  return 'حدث خطأ غير متوقع';
}
