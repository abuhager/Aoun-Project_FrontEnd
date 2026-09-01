"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  bookItem,
  cancelBooking,
  getItemById,
  leaveWaitlist,
} from "@/lib/api/itemApi";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import type { Item } from "@/types/item.types";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { SOCKET_EVENTS } from "@/config/socket";

const getId = (field: unknown): string | null => {
  if (!field) return null;
  if (typeof field === "string") return field;
  if (typeof field === "object" && field !== null && "_id" in field) {
    return String((field as { _id: unknown })._id);
  }
  return null;
};

interface ConfirmModalState {
  show: boolean;
  msg: string;
  isDanger: boolean;
  onConfirm: () => void;
}

export function useItemDetails(itemId: string, initialItem: Item | null) {
  const router = useRouter();
  const { user, isLoading: authLoading, isLoggedIn } = useAuth();
  const { socket } = useSocket();
  const [item, setItem] = useState<Item | null>(initialItem);
  const [loading, setLoading] = useState(!initialItem);
  const [loadError, setLoadError] = useState(
    initialItem ? "" : "تعذّر تحميل بيانات الغرض"
  );
  const [message, setMessage] = useState({ type: "", text: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    show: false,
    msg: "",
    isDanger: false,
    onConfirm: () => {},
  });
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentUserId = user?._id ?? null;
  const isDonor = Boolean(currentUserId && getId(item?.donor) === currentUserId);
  const isBooker = Boolean(currentUserId && getId(item?.bookedBy) === currentUserId);
  const isWaitlisted = Boolean(currentUserId && item?.isInWaitlist);
  const isCancelledBefore = Boolean(
    currentUserId && item?.bookingPreviouslyCancelled
  );

  const setTimedMessage = useCallback((next: { type: string; text: string }) => {
    setMessage(next);
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(
      () => setMessage({ type: "", text: "" }),
      5000
    );
  }, []);

  useEffect(() => () => {
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
  }, []);

  const fetchItem = useCallback(async (silent = false, signal?: AbortSignal) => {
    if (!itemId) return null;
    if (!silent) setLoading(true);
    setLoadError("");

    try {
      const data = await getItemById(itemId, signal);
      if (!signal?.aborted) setItem(data);
      return data;
    } catch (requestError) {
      if (signal?.aborted) return null;
      setItem(null);
      setLoadError(extractErrorMsg(requestError, "تعذّر تحميل بيانات الغرض"));
      return null;
    } finally {
      if (!signal?.aborted && !silent) setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    if (authLoading) return;
    // البيانات العامة وصلت ضمن HTML من Server Component. نعيد الطلب فقط
    // للمستخدم المسجل حتى نحصل على حقول حالته الشخصية (قائمة الانتظار وغيرها).
    if (initialItem && !currentUserId) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    void fetchItem(false, controller.signal);
    return () => controller.abort();
  }, [authLoading, currentUserId, fetchItem, initialItem]);

  useEffect(() => {
    if (!socket || !itemId) return;

    const refreshItem = (payload: { itemId: string }) => {
      if (payload.itemId === itemId) void fetchItem(true);
    };
    const handleDeleted = (payload: { itemId: string }) => {
      if (payload.itemId !== itemId) return;
      setItem(null);
      setLoadError("لم يعد هذا الغرض متاحاً");
    };
    const resyncAfterReconnect = () => {
      if (!socket.recovered) void fetchItem(true);
    };
    socket.on(SOCKET_EVENTS.ITEM_BOOKED, refreshItem);
    socket.on(SOCKET_EVENTS.ITEM_BOOKING_CANCELLED, refreshItem);
    socket.on(SOCKET_EVENTS.ITEM_BOOKING_TRANSFERRED, refreshItem);
    socket.on(SOCKET_EVENTS.ITEM_WAITLIST_PROMOTED, refreshItem);
    socket.on(SOCKET_EVENTS.ITEM_RECIPIENT_CONFIRMED, refreshItem);
    socket.on(SOCKET_EVENTS.ITEM_DELIVERED, refreshItem);
    socket.on(SOCKET_EVENTS.ITEM_DELETED, handleDeleted);
    socket.on("connect", resyncAfterReconnect);
    return () => {
      socket.off(SOCKET_EVENTS.ITEM_BOOKED, refreshItem);
      socket.off(SOCKET_EVENTS.ITEM_BOOKING_CANCELLED, refreshItem);
      socket.off(SOCKET_EVENTS.ITEM_BOOKING_TRANSFERRED, refreshItem);
      socket.off(SOCKET_EVENTS.ITEM_WAITLIST_PROMOTED, refreshItem);
      socket.off(SOCKET_EVENTS.ITEM_RECIPIENT_CONFIRMED, refreshItem);
      socket.off(SOCKET_EVENTS.ITEM_DELIVERED, refreshItem);
      socket.off(SOCKET_EVENTS.ITEM_DELETED, handleDeleted);
      socket.off("connect", resyncAfterReconnect);
    };
  }, [fetchItem, itemId, socket]);

  const handleRequestItem = useCallback(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      router.push(`/login?redirect=/items/${itemId}`);
      return;
    }

    const modalMsg = item?.status === "متاح"
      ? "هل تريد حجز هذا الغرض؟ ستحتاج للتوجه إلى مركز التسليم وتأكيد الاستلام."
      : `هل تريد الانضمام لقائمة الانتظار؟ (${item?.waitlistCount ?? 0} شخص قبلك)`;

    setConfirmModal({
      show: true,
      msg: modalMsg,
      isDanger: false,
      onConfirm: async () => {
        setConfirmModal((previous) => ({ ...previous, show: false }));
        setActionLoading(true);
        try {
          const response = await bookItem(itemId);
          setTimedMessage({ type: "success", text: response.msg });
          await fetchItem(true);
        } catch (requestError) {
          setTimedMessage({
            type: "error",
            text: extractErrorMsg(requestError, "حدث خطأ أثناء الحجز"),
          });
          await fetchItem(true);
        } finally {
          setActionLoading(false);
        }
      },
    });
  }, [authLoading, fetchItem, isLoggedIn, item?.status, item?.waitlistCount, itemId, router, setTimedMessage]);

  const handleCancelAction = useCallback(() => {
    const isDanger = isBooker || isDonor;
    const confirmMsg = isBooker
      ? "⚠️ إلغاء الحجز سيمنعك من حجز هذا الغرض مجدداً. هل أنت متأكد؟"
      : isDonor
        ? "هل تريد إلغاء حجز المستلم وتمرير الدور لأول منتظر مؤهل؟"
        : "هل تريد الانسحاب من قائمة الانتظار؟";

    setConfirmModal({
      show: true,
      msg: confirmMsg,
      isDanger,
      onConfirm: async () => {
        setConfirmModal((previous) => ({ ...previous, show: false }));
        setActionLoading(true);
        try {
          const response = isWaitlisted && !isBooker && !isDonor
            ? await leaveWaitlist(itemId)
            : await cancelBooking(itemId);
          setTimedMessage({ type: "success", text: response.msg });
          await fetchItem(true);
        } catch (requestError) {
          setTimedMessage({
            type: "error",
            text: extractErrorMsg(requestError, "حدث خطأ أثناء الإلغاء"),
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  }, [fetchItem, isBooker, isDonor, isWaitlisted, itemId, setTimedMessage]);

  return {
    item,
    loading,
    loadError,
    message,
    setMessage: setTimedMessage,
    actionLoading,
    currentUserId,
    isDonor,
    isBooker,
    isWaitlisted,
    isCancelledBefore,
    confirmModal,
    setConfirmModal,
    handleRequestItem,
    handleCancelAction,
    fetchItem,
  };
}
