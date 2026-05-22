export type ReportReason =
  | 'لم يُسلّم الغرض'
  | 'معلومات مضللة'
  | 'سلوك غير لائق'
  | 'غرض مختلف عن الوصف'
  | 'أخرى';

export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'actioned';

export interface Report {
  _id:          string;
  reporter:     string;
  reportedUser: string;
  relatedItem?: string;
  reason:       ReportReason;
  details?:     string;
  status:       ReportStatus;
  adminNote?:   string;
  appealText?:  string;
  appealedAt?:  string;
  createdAt:    string;
}

export interface CreateReportPayload {
  reportedUserId: string;
  reason:         ReportReason;
  details?:       string;
  relatedItemId?: string;
}