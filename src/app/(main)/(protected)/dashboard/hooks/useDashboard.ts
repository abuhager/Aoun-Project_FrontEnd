"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  cancelBooking,
  confirmDelivery,
  confirmReceipt,
  deleteItem,
  getMyItems,
} from "@/lib/api/itemApi";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import { useSocket } from '@/context/SocketContext';
import { SOCKET_EVENTS } from '@/config/socket';
import type { Item as DashboardItem, MyItemsResponse } from "@/types/item.types";

export type { DashboardItem as Item };

interface DashboardData {
  user: MyItemsResponse["user"];
  myDonations: MyItemsResponse["myDonations"];
  myRequests: MyItemsResponse["myRequests"];
}

interface ConfirmModalState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
}

interface AppealModalState {
  open: boolean;
  reportId: string;
}

interface DeliveryState {
  itemId: string | null;
  waitingForDonor: boolean;
}

export function getBookedByName(val: DashboardItem["bookedBy"]): string {
  if (!val) return "";
  return val.name ?? "";
}

export function useDashboard() {
  const router = useRouter();
  // تفكيك الـ socket مباشرة من الـ context
  const { socket } = useSocket();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"donations" | "requests">("donations");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [deliveryState, setDeliveryState] = useState<DeliveryState>({
    itemId: null,
    waitingForDonor: false,
  });
  const [deliveryLoadingItemId, setDeliveryLoadingItemId] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    open: false,
    title: "",
    message: "",
    onConfirm: async () => {},
  });

  const [appealModal, setAppealModal] = useState<AppealModalState>({
    open: false,
    reportId: "",
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const appealReportIdRef = useRef<string>("");
  const deliveryInFlightRef = useRef<string | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    const id = setTimeout(() => setToast(null), 3500);
    timeoutIdsRef.current.push(id);
  }, []);

  const beginDeliveryRequest = useCallback((itemId: string) => {
    if (deliveryInFlightRef.current) return false;
    deliveryInFlightRef.current = itemId;
    setDeliveryLoadingItemId(itemId);
    return true;
  }, []);

  const endDeliveryRequest = useCallback((itemId: string) => {
    if (deliveryInFlightRef.current !== itemId) return;
    deliveryInFlightRef.current = null;
    setDeliveryLoadingItemId(null);
  }, []);

  const loadDashboard = useCallback(async (signal?: AbortSignal) => {
    const response = await getMyItems(signal);
    if (signal?.aborted) return;

    const myDonations = response.myDonations ?? [];
    const myRequests = response.myRequests ?? [];
    setData({ user: response.user, myDonations, myRequests });
    setError(null);

    const waitingItem = myDonations.find(
      (item) => item.status === "محجوز" && item.recipientConfirmed
    );
    setDeliveryState({
      itemId: waitingItem?._id ?? null,
      waitingForDonor: Boolean(waitingItem),
    });
  }, []);

  useEffect(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    void (async () => {
      try {
        await loadDashboard(controller.signal);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setError(extractErrorMsg(requestError, "تعذّر تحميل لوحة التحكم"));
        setData(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [loadDashboard]);

  useEffect(() => () => {
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleRecipientConfirmed = ({
      itemId,
      itemTitle,
    }: {
      itemId: string;
      itemTitle?: string;
    }) => {
      showToast(`✅ ${itemTitle || "الغرض"} — المستلم أكّد الاستلام، يرجى تأكيد التسليم الآن`, "success");
      setDeliveryState({ itemId, waitingForDonor: true });

      setData((prev) =>
        prev
          ? {
              ...prev,
              myDonations: prev.myDonations.map((i) =>
                i._id === itemId ? { ...i, recipientConfirmed: true } : i
              ),
            }
          : prev
      );
    };

    const handleDeliveryCompleted = ({ itemId }: { itemId: string }) => {
      setData((prev) =>
        prev
          ? {
              ...prev,
              myDonations: prev.myDonations.map((i) =>
                i._id === itemId ? { ...i, status: "تم التسليم" as const } : i
              ),
              myRequests: prev.myRequests.map((i) =>
                i._id === itemId ? { ...i, status: "تم التسليم" as const } : i
              ),
            }
          : prev
      );

      setDeliveryState({ itemId: null, waitingForDonor: false });
      showToast("تم التسليم بنجاح! شكراً لعطائك 💚", "success");
    };

    const refreshLifecycle = () => {
      void loadDashboard().catch(() => {});
    };
    const resyncAfterReconnect = () => {
      if (!socket.recovered) refreshLifecycle();
    };

    socket.on(SOCKET_EVENTS.ITEM_RECIPIENT_CONFIRMED, handleRecipientConfirmed);
    socket.on(SOCKET_EVENTS.ITEM_DELIVERED, handleDeliveryCompleted);
    socket.on(SOCKET_EVENTS.ITEM_BOOKED, refreshLifecycle);
    socket.on(SOCKET_EVENTS.ITEM_BOOKING_TRANSFERRED, refreshLifecycle);
    socket.on(SOCKET_EVENTS.ITEM_BOOKING_CANCELLED, refreshLifecycle);
    socket.on(SOCKET_EVENTS.ITEM_WAITLIST_PROMOTED, refreshLifecycle);
    socket.on("connect", resyncAfterReconnect);

    return () => {
      socket.off(SOCKET_EVENTS.ITEM_RECIPIENT_CONFIRMED, handleRecipientConfirmed);
      socket.off(SOCKET_EVENTS.ITEM_DELIVERED, handleDeliveryCompleted);
      socket.off(SOCKET_EVENTS.ITEM_BOOKED, refreshLifecycle);
      socket.off(SOCKET_EVENTS.ITEM_BOOKING_TRANSFERRED, refreshLifecycle);
      socket.off(SOCKET_EVENTS.ITEM_BOOKING_CANCELLED, refreshLifecycle);
      socket.off(SOCKET_EVENTS.ITEM_WAITLIST_PROMOTED, refreshLifecycle);
      socket.off("connect", resyncAfterReconnect);
    };
  }, [loadDashboard, socket, showToast]);

  const handleRecipientConfirm = useCallback(
    async (itemId: string) => {
      if (!beginDeliveryRequest(itemId)) return;

      try {
        const { msg } = await confirmReceipt(itemId);

        setData((prev) =>
          prev
            ? {
                ...prev,
                myRequests: prev.myRequests.map((i) =>
                  i._id === itemId ? { ...i, recipientConfirmed: true } : i
                ),
              }
            : prev
        );

        showToast(msg || "✅ تم تسجيل تأكيدك، بانتظار تأكيد المتبرع النهائي ⏳", "success");
      } catch (requestError) {
        showToast(extractErrorMsg(requestError, "تعذّر تأكيد الاستلام"), "error");
      } finally {
        endDeliveryRequest(itemId);
      }
    },
    [beginDeliveryRequest, endDeliveryRequest, showToast]
  );

  const handleDonorConfirm = useCallback(
    async (itemId: string) => {
      if (!beginDeliveryRequest(itemId)) return;

      try {
        const { msg } = await confirmDelivery(itemId);
        await loadDashboard();

        setDeliveryState({ itemId: null, waitingForDonor: false });
        showToast(msg || "تم التسليم بنجاح واكتملت العملية! 💚", "success");
      } catch (requestError) {
        showToast(extractErrorMsg(requestError, "تعذّر تأكيد التسليم"), "error");
      } finally {
        endDeliveryRequest(itemId);
      }
    },
    [beginDeliveryRequest, endDeliveryRequest, loadDashboard, showToast]
  );

  const handleDelete = useCallback(
    (id: string, status: string) => {
      if (status === "تم التسليم") {
        showToast("لا يمكن حذف غرض تم تسليمه مسبقاً", "error");
        return;
      }

      setConfirmModal({
        open: true,
        title: "حذف الغرض",
        message:
          status === "محجوز"
            ? "هذا الغرض محجوز حالياً. حذفه سيلغي الحجز ويُشعر الحاجز والمنتظرين. هل أنت متأكد؟"
            : "هل أنت متأكد من حذف هذا الغرض نهائياً؟ لا يمكن التراجع عن هذا الإجراء.",
        onConfirm: async () => {
          try {
            await deleteItem(id);
            setData((prev) =>
              prev
                ? { ...prev, myDonations: prev.myDonations.filter((i) => i._id !== id) }
                : prev
            );
            showToast("تم حذف الغرض بنجاح", "success");
          } catch (requestError) {
            showToast(extractErrorMsg(requestError, "تعذّر حذف الغرض"), "error");
          } finally {
            setConfirmModal((p) => ({ ...p, open: false }));
          }
        },
      });
    },
    [showToast]
  );

  const handleCancelBooking = useCallback(
    (id: string) => {
      setConfirmModal({
        open: true,
        title: "إلغاء الحجز",
        message: "هل أنت متأكد من إلغاء حجزك لهذا الغرض؟",
        onConfirm: async () => {
          try {
            const response = await cancelBooking(id);
            setData((prev) =>
              prev
                ? { ...prev, myRequests: prev.myRequests.filter((i) => i._id !== id) }
                : prev
            );
            showToast(response.msg, "success");
          } catch (requestError) {
            showToast(extractErrorMsg(requestError, "تعذّر إلغاء الحجز"), "error");
          } finally {
            setConfirmModal((p) => ({ ...p, open: false }));
          }
        },
      });
    },
    [showToast]
  );

  const handleDonorCancelBooking = useCallback(
    (id: string) => {
      setConfirmModal({
        open: true,
        title: "فك الحجز عن الغرض",
        message: "هل تريد إلغاء حجز هذا المستخدم؟ إذا وُجد منتظر مؤهل سينتقل الحجز إليه تلقائياً.",
        onConfirm: async () => {
          try {
            const response = await cancelBooking(id);
            setData((prev) =>
              prev
                ? {
                    ...prev,
                    myDonations: prev.myDonations.map((item) =>
                      item._id === id
                        ? {
                            ...item,
                            status: response.status,
                            bookedBy: response.bookedBy,
                            recipientConfirmed: false,
                            donorConfirmed: false,
                          }
                        : item
                    ),
                  }
                : prev
            );
            showToast(response.msg, "success");
          } catch (requestError) {
            showToast(extractErrorMsg(requestError, "تعذّر فك الحجز"), "error");
          } finally {
            setConfirmModal((p) => ({ ...p, open: false }));
          }
        },
      });
    },
    [showToast]
  );

  const handleEdit = useCallback((id: string) => {
    router.push(`/items/${id}/edit`);
  }, [router]);

  const openAppealModal = useCallback((reportId: string) => {
    appealReportIdRef.current = reportId;
    setAppealModal({ open: true, reportId });
  }, []);

  const closeAppealModal = useCallback(() => {
    setAppealModal({ open: false, reportId: "" });
  }, []);

  const onAppealSuccess = useCallback(() => {
    const targetReportId = appealReportIdRef.current;

    setData((prev) => {
      if (!prev) return prev;

      const clearReport = (items: DashboardData["myDonations"]) =>
        items.map((i) =>
          i.reportId === targetReportId ? { ...i, reportId: null } : i
        );

      return {
        ...prev,
        myDonations: clearReport(prev.myDonations),
        myRequests: clearReport(prev.myRequests),
      };
    });

    closeAppealModal();
    showToast("تم تقديم اعتراضك بنجاح وجاري مراجعته من قبل الإدارة ✅", "success");
  }, [closeAppealModal, showToast]);

  return {
    data,
    loading,
    error,
    activeTab,
    setActiveTab,
    toast,
    setToast,
    confirmModal,
    setConfirmModal,
    deliveryState,
    deliveryLoadingItemId,
    handleRecipientConfirm,
    handleDonorConfirm,
    handleDelete,
    handleCancelBooking,
    handleDonorCancelBooking,
    handleEdit,
    appealModal,
    openAppealModal,
    closeAppealModal,
    onAppealSuccess,
  };
}
