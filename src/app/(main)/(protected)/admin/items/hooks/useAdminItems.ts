"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteAdminItem, getAdminItems } from "@/lib/api/adminApi";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import type { AdminItem } from "@/types/admin.types";

export type PendingItemDelete = {
  id: string;
  title: string;
  donorName?: string;
} | null;

type ToastState = { msg: string; ok: boolean } | null;

export function useAdminItems() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const [items, setItems] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [toast, setToast] = useState<ToastState>(null);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [pendingDelete, setPendingDelete] = useState<PendingItemDelete>(null);
  const [deleteNote, setDeleteNote] = useState("");

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const loadItems = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const data = await getAdminItems(page, signal);
        if (!signal?.aborted) {
          setItems(data.items);
          setPages(data.pages);
        }
      } catch {
        if (!signal?.aborted) showToast("تعذر تحميل الأغراض", false);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [page, showToast]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadItems(controller.signal);
    return () => controller.abort();
  }, [loadItems]);

  const openDelete = (item: AdminItem) => {
    setPendingDelete({
      id: item._id,
      title: item.title,
      donorName: item.donor?.name ?? undefined,
    });
    setDeleteNote("");
  };

  const closeDelete = () => {
    if (pendingDelete && busy[pendingDelete.id]) return;
    setPendingDelete(null);
    setDeleteNote("");
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const note = deleteNote.trim();
    if (!note) {
      showToast("تعليق الحذف إجباري", false);
      return;
    }

    const { id } = pendingDelete;
    if (busy[id]) return;
    setBusy((current) => ({ ...current, [id]: true }));

    try {
      await deleteAdminItem(id, note);
      setItems((current) => current.filter((item) => item._id !== id));
      showToast("تم حذف الغرض ✅", true);
      setPendingDelete(null);
      setDeleteNote("");
    } catch (error) {
      showToast(extractErrorMsg(error, "حدث خطأ أثناء حذف الغرض"), false);
    } finally {
      setBusy((current) => ({ ...current, [id]: false }));
    }
  };

  const getImage = (item: AdminItem): string | null => {
    if (!item.imageUrl) return null;
    return item.imageUrl.startsWith("http")
      ? item.imageUrl
      : `${apiUrl}/${item.imageUrl}`;
  };

  return {
    busy,
    closeDelete,
    confirmDelete,
    deleteNote,
    getImage,
    items,
    loading,
    openDelete,
    page,
    pages,
    pendingDelete,
    setDeleteNote,
    setPage,
    toast,
  };
}
