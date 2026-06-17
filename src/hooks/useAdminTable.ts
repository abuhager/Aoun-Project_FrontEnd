'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '@/lib/api/axiosInstance';
import { useToast }  from '@/hooks/useToast';

type Deps = Record<string, unknown>;

interface AdminApiResponse {
  pages?:   number;
  users?:   unknown[];
  items?:   unknown[];
  hubs?:    unknown[];
  reports?: unknown[];
}

export function useAdminTable<T>(endpoint: string, deps: Deps = {}) {
  const [rows,    setRows]    = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);

  // ✅ FL13-04: تخزين deps في ref — يتجنب إعادة إنشاء load() عند كل render
  const depsRef = useRef(deps);
  useEffect(() => { depsRef.current = deps; });

  const { show: showToast, ToastComponent } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get<AdminApiResponse | unknown[]>(
        endpoint,
        { params: { page, ...depsRef.current } }
      );
      let items: unknown[] = [];
      let totalPages = 1;
      if (Array.isArray(data)) {
        items = data;
      } else if (data && typeof data === 'object') {
        items = data.users ?? data.items ?? data.hubs ?? data.reports ?? [];
        totalPages = data.pages ?? 1;
      }
      setRows(items as T[]);
      setPages(totalPages);
    } catch (err) {
      let msg = 'تعذر تحميل البيانات';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { msg?: string } } };
        if (e.response?.data?.msg) msg = e.response.data.msg;
      }
      showToast(msg, false);
    } finally {
      setLoading(false);
    }
  // ✅ FL13-04: deps لا تدخل هنا — تُقرأ من depsRef
  }, [endpoint, page, showToast]);

  useEffect(() => { load(); }, [load]);

  return { rows, setRows, loading, page, setPage, pages, reload: load, showToast, ToastComponent };
}