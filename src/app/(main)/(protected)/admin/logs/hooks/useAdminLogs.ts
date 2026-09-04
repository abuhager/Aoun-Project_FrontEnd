"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminLogs } from "@/lib/api/adminApi";
import type { AdminAuditLog } from "@/types/admin.types";

type AdminLogsState = {
  logs: AdminAuditLog[];
  pages: number;
  loading: boolean;
};

export function useAdminLogs() {
  const [page, setPage] = useState(1);
  const [state, setState] = useState<AdminLogsState>({
    logs: [],
    pages: 1,
    loading: true,
  });

  useEffect(() => {
    const controller = new AbortController();

    void getAdminLogs(page, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ logs: data.logs, pages: data.pages, loading: false });
        }
      })
      .catch((error: unknown) => {
        if (
          !controller.signal.aborted &&
          (!(error instanceof Error) || error.name !== "CanceledError")
        ) {
          setState((current) => ({ ...current, loading: false }));
        }
      });

    return () => controller.abort();
  }, [page]);

  const changePage = (nextPage: number) => {
    setState((current) => ({ ...current, loading: true }));
    setPage(nextPage);
  };

  const stats = useMemo(
    () => ({
      total: state.logs.length,
      reportActions: state.logs.filter((log) => log.action === "REPORT_ACTION").length,
      bans: state.logs.filter((log) => log.action === "BAN").length,
      promotions: state.logs.filter((log) => log.action === "PROMOTE").length,
      notes: state.logs.filter((log) => Boolean(log.adminNote)).length,
    }),
    [state.logs]
  );

  return {
    loading: state.loading,
    logs: state.logs,
    page,
    pages: state.pages,
    setPage: changePage,
    stats,
  };
}
