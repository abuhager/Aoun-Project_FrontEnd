// src/types/report.types.ts
// ✅ Fix: توحيد اسم الحقل — حذف relatedItemId المكرر

export type ReportReason =
  | 'spam'
  | 'fake_item'
  | 'inappropriate_behavior'
  | 'no_show'
  | 'fraud'
  | 'other';

export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'actioned';

// ─── إنشاء بلاغ ─────────────────────────────────────────────
export interface CreateReportPayload {
  reportedUserId: string;
  itemId:         string;   // ✅ اسم واحد موحّد
  reason:         ReportReason;
  detail?:        string;
}

// ─── بيانات البلاغ من الـ API ────────────────────────────────
export interface Report {
  _id:            string;
  reporter:       { _id: string; name: string; avatar: string };
  reportedUser:   { _id: string; name: string; avatar: string };
  item:           { _id: string; title: string; imageUrl: string } | null;
  reason:         ReportReason;
  detail:         string;
  status:         ReportStatus;
  adminNote:      string;
  appealText:     string;
  appealDeadline: string | null;
  createdAt:      string;
  updatedAt:      string;
}

// ─── بيانات الاستئناف ────────────────────────────────────────
export interface AppealPayload {
  reportId:   string;
  appealText: string;
}