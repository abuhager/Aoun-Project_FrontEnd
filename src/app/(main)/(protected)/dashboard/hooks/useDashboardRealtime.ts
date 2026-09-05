"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";
import { SOCKET_EVENTS } from "@/config/socket";
import { useSocket } from "@/context/SocketContext";
import type { DashboardData, DashboardToastType, DeliveryState } from "./dashboard.types";

interface UseDashboardRealtimeOptions {
  loadDashboard: (signal?: AbortSignal) => Promise<void>;
  setData: Dispatch<SetStateAction<DashboardData | null>>;
  setDeliveryState: Dispatch<SetStateAction<DeliveryState>>;
  showToast: (message: string, type: DashboardToastType) => void;
}

export function useDashboardRealtime({ loadDashboard, setData, setDeliveryState, showToast }: UseDashboardRealtimeOptions) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleRecipientConfirmed = ({ itemId, itemTitle }: { itemId: string; itemTitle?: string }) => {
      showToast(`✅ ${itemTitle || "الغرض"} — المستلم أكّد الاستلام، يرجى تأكيد التسليم الآن`, "success");
      setDeliveryState({ itemId, waitingForDonor: true });
      setData((current) => current ? {
        ...current,
        myDonations: current.myDonations.map((item) =>
          item._id === itemId ? { ...item, recipientConfirmed: true } : item
        ),
      } : current);
    };

    const handleDeliveryCompleted = ({ itemId }: { itemId: string }) => {
      setData((current) => current ? {
        ...current,
        myDonations: current.myDonations.map((item) =>
          item._id === itemId ? { ...item, status: "تم التسليم" as const } : item
        ),
        myRequests: current.myRequests.map((item) =>
          item._id === itemId ? { ...item, status: "تم التسليم" as const } : item
        ),
      } : current);
      setDeliveryState({ itemId: null, waitingForDonor: false });
      showToast("تم التسليم بنجاح! شكراً لعطائك 💚", "success");
    };

    const refreshLifecycle = () => void loadDashboard().catch(() => {});
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
  }, [loadDashboard, setData, setDeliveryState, showToast, socket]);
}
