"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/useToast";
import {
  banUser,
  demoteUser,
  getAdminUsers,
  promoteUser,
  unbanUser,
} from "@/lib/api/adminApi";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import type { AdminUser } from "@/types/admin.types";

export type AdminUserAction = "ban" | "unban" | "promote" | "demote";

export type PendingUserAction = {
  userId: string;
  userName: string;
  type: AdminUserAction;
} | null;

export const ADMIN_USER_ACTION_LABELS: Record<
  AdminUserAction,
  { title: string; button: string; buttonClassName: string; icon: string; tone: string }
> = {
  ban: {
    title: "تأكيد حظر المستخدم",
    button: "تأكيد الحظر",
    buttonClassName: "bg-red-600 hover:bg-red-700 text-white",
    icon: "block",
    tone: "bg-red-50 text-red-600",
  },
  unban: {
    title: "تأكيد فك الحظر",
    button: "فك الحظر",
    buttonClassName: "bg-green-600 hover:bg-green-700 text-white",
    icon: "verified",
    tone: "bg-green-50 text-green-600",
  },
  promote: {
    title: "تأكيد ترقية المستخدم",
    button: "ترقية إلى Level 2",
    buttonClassName: "bg-blue-600 hover:bg-blue-700 text-white",
    icon: "arrow_upward",
    tone: "bg-blue-50 text-blue-600",
  },
  demote: {
    title: "تأكيد تخفيض المستخدم",
    button: "تخفيض إلى Level 1",
    buttonClassName: "bg-orange-500 hover:bg-orange-600 text-white",
    icon: "arrow_downward",
    tone: "bg-orange-50 text-orange-600",
  },
};

export function useAdminUsers() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState<PendingUserAction>(null);
  const [note, setNote] = useState("");
  const { show: showToast, ToastComponent } = useToast();

  const loadUsers = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const data = await getAdminUsers({ page, search }, signal);
        if (!signal?.aborted) {
          setUsers(data.users);
          setPages(data.pages);
        }
      } catch {
        if (!signal?.aborted) showToast("تعذر تحميل المستخدمين", false);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [page, search, showToast]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadUsers(controller.signal);
    return () => controller.abort();
  }, [loadUsers]);

  const setSearch = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  const openAction = (user: AdminUser, type: AdminUserAction) => {
    setPending({ userId: user._id, userName: user.name, type });
    setNote("");
  };

  const closeAction = () => {
    setPending(null);
    setNote("");
  };

  const updateUser = (userId: string, patch: Partial<AdminUser>) => {
    setUsers((current) =>
      current.map((user) => (user._id === userId ? { ...user, ...patch } : user))
    );
  };

  const confirmAction = async () => {
    if (!pending) return;
    const { userId, type } = pending;
    if (busy[userId]) return;

    const cleanedNote = note.trim();
    if (type === "ban" && cleanedNote.length < 5) {
      showToast("سبب الحظر مطلوب ويجب أن يكون 5 أحرف على الأقل", false);
      return;
    }

    setBusy((current) => ({ ...current, [userId]: true }));
    setPending(null);

    try {
      if (type === "ban") {
        await banUser(userId, { reason: cleanedNote, adminNote: cleanedNote });
        updateUser(userId, { isBanned: true });
        showToast("تم حظر المستخدم بنجاح", true);
      } else if (type === "unban") {
        await unbanUser(userId, cleanedNote ? { adminNote: cleanedNote } : {});
        updateUser(userId, { isBanned: false });
        showToast("تم فك الحظر بنجاح", true);
      } else if (type === "promote") {
        const response = await promoteUser(
          userId,
          cleanedNote ? { adminNote: cleanedNote } : {}
        );
        updateUser(userId, { trustLevel: response.user.trustLevel });
        showToast(`تمت ترقية المستخدم إلى المستوى ${response.user.trustLevel}`, true);
      } else {
        const response = await demoteUser(
          userId,
          cleanedNote ? { adminNote: cleanedNote } : {}
        );
        updateUser(userId, { trustLevel: response.user.trustLevel });
        showToast(`تم تخفيض المستخدم إلى المستوى ${response.user.trustLevel}`, true);
      }
    } catch (error: unknown) {
      showToast(extractErrorMsg(error, "حدث خطأ أثناء تنفيذ الإجراء"), false);
    } finally {
      setBusy((current) => ({ ...current, [userId]: false }));
      setNote("");
    }
  };

  const stats = useMemo(
    () => ({
      total: users.length,
      banned: users.filter((user) => user.isBanned).length,
      active: users.filter((user) => !user.isBanned).length,
      lvl2: users.filter((user) => user.trustLevel === 2).length,
      lvl1: users.filter((user) => user.trustLevel === 1).length,
    }),
    [users]
  );

  const getAvatar = (url?: string) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${apiUrl}${url}`;
  };

  return {
    busy,
    closeAction,
    confirmAction,
    getAvatar,
    loading,
    note,
    openAction,
    page,
    pages,
    pending,
    search,
    setNote,
    setPage,
    setSearch,
    stats,
    ToastComponent,
    users,
  };
}
