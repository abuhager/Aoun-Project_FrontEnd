"use client";

import { useCallback, useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/useToast";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import { getAdminReports, resolveAdminReport } from "@/lib/api/reportApi";
import type {
  AdminReportsResponse,
  ModerationReport,
  ReportDecision,
  ReportStatus,
  ResolveReportPayload,
} from "@/types/report.types";

const reportsKey = (page: number, status: ReportStatus | "all") =>
  ["admin-reports", page, status] as const;

const reportsFetcher = ([, page, status]: ReturnType<typeof reportsKey>) =>
  getAdminReports({ page, status });

export function useAdminReports() {
  const { user, isLoading: authLoading } = useAuth();
  const { show: showToast, ToastComponent } = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilterValue] = useState<ReportStatus | "all">("all");
  const [selected, setSelected] = useState<ModerationReport | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [actionStatus, setActionStatus] = useState<ReportDecision>("actioned");
  const [submitting, setSubmitting] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const key = !authLoading && isAdmin ? reportsKey(page, statusFilter) : null;
  const { data, error, isLoading, mutate } = useSWR<AdminReportsResponse>(
    key,
    reportsFetcher,
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  const setStatusFilter = (status: ReportStatus | "all") => {
    setStatusFilterValue(status);
    setPage(1);
  };

  const openReport = (report: ModerationReport) => {
    setSelected(report);
    setAdminNote(report.adminNote ?? "");
    if (report.status === "pending") setActionStatus("actioned");
  };

  const closeReport = () => {
    if (submitting) return;
    setSelected(null);
    setAdminNote("");
  };

  const resolveSelected = useCallback(async () => {
    if (!selected || submitting) return;
    const trimmedNote = adminNote.trim();
    if (!trimmedNote) {
      showToast("يجب كتابة ملاحظة المشرف قبل الإجراء", false);
      return;
    }

    setSubmitting(true);
    setLoadingId(selected._id);
    try {
      const payload: ResolveReportPayload = {
        status: actionStatus,
        adminNote: trimmedNote,
      };
      await resolveAdminReport(selected._id, payload);
      await mutate();
      showToast("تم تنفيذ الإجراء بنجاح ✅", true);
      setSelected(null);
      setAdminNote("");
    } catch (error) {
      showToast(extractErrorMsg(error, "فشل تنفيذ الإجراء"), false);
    } finally {
      setSubmitting(false);
      setLoadingId(null);
    }
  }, [actionStatus, adminNote, mutate, selected, showToast, submitting]);

  const dismissReport = useCallback(
    async (reportId: string) => {
      if (loadingId) return;
      setLoadingId(reportId);
      try {
        await resolveAdminReport(reportId, {
          status: "dismissed",
          adminNote: "تم رفض البلاغ بعد المراجعة",
        });
        await mutate();
        showToast("تم رفض البلاغ ✅", true);
      } catch (error) {
        showToast(extractErrorMsg(error, "فشل رفض البلاغ"), false);
      } finally {
        setLoadingId(null);
      }
    },
    [loadingId, mutate, showToast]
  );

  return {
    actionStatus,
    adminNote,
    authLoading,
    closeReport,
    data,
    dismissReport,
    error,
    isAdmin,
    isLoading,
    loadingId,
    openReport,
    page,
    retry: mutate,
    resolveSelected,
    selected,
    setActionStatus,
    setAdminNote,
    setPage,
    setStatusFilter,
    statusFilter,
    submitting,
    ToastComponent,
    user,
  };
}
