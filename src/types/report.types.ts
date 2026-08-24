// src/types/report.types.ts
export type ReportReason = string;

// ✅ للـ Fallback فقط (إذا لم تُحمَّل الـ settings بعد)
export const REPORT_REASONS_FALLBACK: ReportReason[] = [
  'لم يُسلّم الغرض',
  'معلومات مضللة',
  'سلوك غير لائق',
  'غرض مختلف عن الوصف',
  'أخرى',
];

export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'actioned';
export type ReportDecision = Exclude<ReportStatus, 'pending'>;

export interface ReportParty {
  _id: string;
  name: string;
  avatar?: string;
  isBanned?: boolean;
}

export interface ReportItemReference {
  _id: string;
  title: string;
}

export interface CreateReportPayload {
  reportedUserId: string;
  itemId?:        string;
  reason:         ReportReason;
  details?:       string;
}

export interface Report {
  _id:            string;
  reporter:       string | ReportParty;
  reportedUser:   string | ReportParty;
  relatedItem:    string | ReportItemReference | null;
  reason:         ReportReason;
  details:        string;
  status:         ReportStatus;
  adminNote:      string | null;
  appealText:     string | null;
  appealedAt:     string | null;
  appealDeadline: string | null;
  resolvedBy:     string | null;
  resolvedAt:     string | null;
  createdAt:      string;
  updatedAt:      string;
}

export interface AppealPayload {
  appealText: string;
}

export interface ModerationReport {
  _id: string;
  reporter: ReportParty | null;
  reportedUser: ReportParty | null;
  relatedItem: ReportItemReference | null;
  reason: string;
  details: string;
  status: ReportStatus;
  adminNote: string | null;
  appealText: string | null;
  appealedAt: string | null;
  appealDeadline: string | null;
  resolvedAt: string | null;
  createdAt: string;
  totalReportsAgainstUser: number;
  pendingReportsAgainstUser: number;
  actionedReportsAgainstUser: number;
  isRepeatOffender: boolean;
}

export interface AdminReportsResponse {
  reports: ModerationReport[];
  totalPages: number;
  total: number;
  page: number;
}

export interface ResolveReportPayload {
  status: ReportDecision;
  adminNote: string;
}
