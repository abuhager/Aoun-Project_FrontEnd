// src/hooks/useAdminTable.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/api/axiosInstance";
import { useToast } from "@/hooks/useToast";

type Deps = Record<string, unknown>;

// ✅ 1. تعريف الهيكل المتوقع من الـ API لمنع استخدام any
interface AdminApiResponse {
  pages?: number;
  users?: unknown[];
  items?: unknown[];
  hubs?: unknown[];
  reports?: unknown[];
  settings?: unknown[];
}

export function useAdminTable<T>(
  endpoint: string,
  deps: Deps = {}
) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const { show: showToast, ToastComponent } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ تزويد أكسيوس بالأنواع المتوقعة كـ Generic
      const { data } = await axiosInstance.get<AdminApiResponse | unknown[]>(endpoint, {
        params: { page, ...deps },
      });

      let extractedItems: unknown[] = [];
      let totalPages = 1;

      // ✅ 2. فحص نوع البيانات المستلمة بأمان تيب-سكربت صارم
      if (Array.isArray(data)) {
        extractedItems = data;
      } else if (data && typeof data === "object") {
        extractedItems = 
          data.users ??
          data.items ??
          data.hubs ??
          data.reports ??
          data.settings ??
          [];
        
        totalPages = data.pages ?? 1; // 👈 تم حل مشكلة الـ any هنا بنجاح
      }

      setRows(extractedItems as T[]);
      setPages(totalPages);
    } catch (err) {
      let msg = "تعذر تحميل البيانات";

      // ✅ 3. فحص الخطأ برمجياً بدون استيراد أكسيوس العادي وبدون any
      if (err && typeof err === "object" && "isAxiosError" in err) {
        const axiosError = err as { response?: { data?: { msg?: string } } };
        if (axiosError.response?.data?.msg) {
          msg = axiosError.response.data.msg;
        }
      }
      
      showToast(msg, false);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, page, JSON.stringify(deps)]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    rows,
    setRows,
    loading,
    page,
    setPage,
    pages,
    reload: load,
    showToast,
    ToastComponent,
  };
}