import type { ReportStatus } from "@/types/report.types";

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "قيد المراجعة",
  reviewed: "تمّت المراجعة",
  dismissed: "تم الرفض",
  actioned: "تم الإجراء",
};

export const REPORT_STATUS_COLORS: Record<ReportStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  reviewed: "bg-blue-50 text-blue-700 border border-blue-200",
  dismissed: "bg-slate-100 text-slate-600 border border-slate-200",
  actioned: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

export const getReportUserInitial = (name?: string | null): string =>
  name?.trim().charAt(0).toUpperCase() ?? "؟";

export const getReportUserName = (name?: string | null): string =>
  name?.trim() || "مستخدم محذوف";
