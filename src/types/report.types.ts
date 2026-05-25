// src/types/report.types.ts
export type ReportReason =
  | 'لم يُسلّم الغرض'
  | 'معلومات مضللة'
  | 'سلوك غير لائق'
  | 'غرض مختلف عن الوصف'
  | 'أخرى';

export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface Report {
  _id:       string;
  reporter:  { _id: string; name: string };
  reported:  { _id: string; name: string };
  item:      { _id: string; title: string };
  reason:    ReportReason;
  details?:  string;
  status:    ReportStatus;
  appeal?:   string;           // Phase 4 — AppealModal
  appealAt?: string;
  createdAt: string;
}

export interface CreateReportPayload {
  reportedUserId: string;
  itemId:         string;
  reason:         ReportReason;
  details?:       string;
  relatedItemId?: string;
}