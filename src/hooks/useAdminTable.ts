'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getAdminTableRows } from '@/lib/api/adminApi';
import { extractErrorMsg } from '@/lib/api/apiError';
import { useToast }  from '@/hooks/useToast';

type Deps = Record<string, unknown>;

export function useAdminTable<T>(endpoint: string, deps: Deps = {}) {
  const [rows,    setRows]    = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);

  const depsKey = JSON.stringify(deps);
  const requestRef = useRef<AbortController | null>(null);

  const { show: showToast, ToastComponent } = useToast();

  const load = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    try {
      const result = await getAdminTableRows<T>(
        endpoint,
        { page, ...(JSON.parse(depsKey) as Deps) },
        controller.signal
      );
      if (!controller.signal.aborted) {
        setRows(result.rows);
        setPages(result.pages);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        showToast(extractErrorMsg(err, 'تعذر تحميل البيانات'), false);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [depsKey, endpoint, page, showToast]);

  useEffect(() => {
    void load();
    return () => requestRef.current?.abort();
  }, [load]);

  return { rows, setRows, loading, page, setPage, pages, reload: load, showToast, ToastComponent };
}
