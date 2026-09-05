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
