// src/types/report.types.ts

// ✅ مطابقة Backend بالضبط
export type ReportReason =
  | 'لم يُسلّم الغرض'
  | 'معلومات مضللة'
  | 'سلوك غير لائق'
  | 'غرض مختلف عن الوصف'
  | 'أخرى';

export const REPORT_REASONS: ReportReason[] = [
  'لم يُسلّم الغرض',
  'معلومات مضللة',
  'سلوك غير لائق',
  'غرض مختلف عن الوصف',
  'أخرى',
];

export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'actioned';

export interface CreateReportPayload {
  reportedUserId: string;
  itemId?:        string;
  reason:         ReportReason;
  details?:       string; // ✅ details مش detail — مطابقة Backend
}

export interface Report {
  _id:          string;
  reporter:     { _id: string; name: string; avatar?: string };
  reportedUser: { _id: string; name: string; avatar?: string };
  relatedItem:  { _id: string; title: string } | null;
  reason:       ReportReason;
  details:      string;
  status:       ReportStatus;
  adminNote:    string;
  appealText:   string;
  appealedAt:   string | null;
  resolvedAt:   string | null;
  createdAt:    string;
  updatedAt:    string;
}

export interface AppealPayload {
  appealText: string; // ✅ reportId في الـ URL مش في الـ body
}