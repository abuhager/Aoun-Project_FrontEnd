// src/types/report.types.ts
// ✅ DC-14 FIX: REPORT_REASONS لم تعد hardcoded في Frontend
//    يجب جلبها من GET /api/settings/public → settings.reportReasons
//    الـ REPORT_REASONS الثابتة هنا للـ FALLBACK فقط إذا فشل جلب الـ settings

// ✅ النوع مرن — لا يقيّد القائمة بقيم ثابتة
export type ReportReason = string;

// ✅ للـ Fallback فقط (إذا لم تُحمَّل الـ settings بعد)
export const REPORT_REASONS_FALLBACK: ReportReason[] = [
  'لم يُسلّم الغرض',
  'معلومات مضللة',
  'سلوك غير لائق',
  'غرض مختلف عن الوصف',
  'أخرى',
];

// ⚠️ الاستخدام الصحيح في المكوّن:
// const { settings } = useSettings();  // من Context أو Zustand
// const reasons = settings?.reportReasons ?? REPORT_REASONS_FALLBACK;

export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'actioned';

export interface CreateReportPayload {
  reportedUserId: string;
  itemId?:        string;
  reason:         ReportReason;
  details?:       string;
}

export interface Report {
  _id:            string;
  reporter:       { _id: string; name: string; avatar?: string };
  reportedUser:   { _id: string; name: string; avatar?: string };
  relatedItem:    { _id: string; title: string } | null;
  reason:         ReportReason;
  details:        string;
  status:         ReportStatus;
  adminNote:      string | null;
  // ✅ DC-14: إضافة الحقول المفقودة من toReportResponse في reportDto.js
  appealText:     string | null;
  appealedAt:     string | null;
  appealDeadline: string | null;  // ← كان غائباً في الـ Frontend
  resolvedBy:     string | null;  // ← كان غائباً في الـ Frontend
  resolvedAt:     string | null;
  createdAt:      string;
  updatedAt:      string;
}

export interface AppealPayload {
  appealText: string;
}