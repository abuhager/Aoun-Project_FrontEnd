"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ConfirmModal } from "./components/ConfirmModal";
import { CountdownTimer } from "./components/CountdownTimer";
import { ItemActions } from "./components/ItemActions";
import { useItemDetails } from "./hooks/useItemDetails";
import ChatDrawer from "@/components/ChatDrawer";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeliveryConfirmation } from "@/hooks/useDeliveryConfirmation";
import { useAuth } from "@/context/AuthContext";
import { openConversation } from "@/lib/api/conversationApi";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import type { Item } from "@/types/item.types";

export default function ItemDetailsClient({
  itemId,
  initialItem,
}: {
  itemId: string;
  initialItem: Item | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, user } = useAuth();
  const {
    item,
    loading,
    loadError,
    message,
    setMessage,
    actionLoading,
    confirmModal,
    setConfirmModal,
    isDonor,
    isBooker,
    isWaitlisted,
    isCancelledBefore,
    handleRequestItem,
    handleCancelAction,
    fetchItem,
  } = useItemDetails(itemId, initialItem);

  const [chatOpen, setChatOpen] = useState(false);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [fetchingChat, setFetchingChat] = useState(false);

  const delivery = useDeliveryConfirmation({
    itemId: item?._id ?? "",
    initialRecipientConfirmed: item?.recipientConfirmed ?? false,
    onSuccess: async () => {
      await fetchItem(true);
      setMessage({ type: "success", text: "تم تحديث حالة التسليم بنجاح ✅" });
      router.refresh();
    },
    onError: (text) => setMessage({ type: "error", text }),
  });

  const handleOpenChatFlow = async () => {
    if (!item) return;
    setFetchingChat(true);
    try {
      const { conversation } = await openConversation(item._id);
      setActiveConvId(conversation._id);
      setChatOpen(true);
    } catch (error) {
      setMessage({
        type: "error",
        text: extractErrorMsg(error, "تعذّر فتح المحادثة"),
      });
    } finally {
      setFetchingChat(false);
    }
  };

  const redirectToLogin = () => {
    if (!item?._id) return;
    router.push(`/login?redirect=/items/${item._id}`);
  };

  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center" dir="rtl">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="page-shell flex items-center justify-center px-4" dir="rtl">
        <div className="surface-card max-w-md px-8 py-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-danger-bg text-danger">
            <span className="material-symbols-outlined text-[24px]">inventory_2</span>
          </span>
          <p className="mt-4 text-sm font-bold text-on-surface-variant">
            {loadError || "الغرض غير موجود"}
          </p>
        </div>
      </div>
    );
  }

  const isRequestLinked = Boolean(item.linkedRequestId);
  const requestedReturnTo = searchParams.get("returnTo");
  const browseReturnTo =
    requestedReturnTo === "/browse" || requestedReturnTo?.startsWith("/browse?")
      ? requestedReturnTo
      : "/browse";
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const imageUrl = item.imageUrl ?? "/placeholder.svg";
  const showCountdown =
    !isRequestLinked && item.status === "محجوز" && (isBooker || isDonor);
  const showChat = (isDonor || isBooker) && item.status === "محجوز";

  const isRecipientConfirmedActual = item.recipientConfirmed || delivery.isRecipientConfirmed;

  return (
    <div className="page-shell pb-20 pt-20" dir="rtl">
      {confirmModal.show && (
        <ConfirmModal
          message={confirmModal.msg}
          isDanger={confirmModal.isDanger}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal((p) => ({ ...p, show: false }))}
        />
      )}

      {showChat && chatOpen && activeConvId && (
        <ChatDrawer
          key={activeConvId}
          conversationId={activeConvId}
          itemTitle={item.title}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}

      <div className="site-container md:pt-4">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-gray-400">
          <Link
            href={
              isRequestLinked
                ? `/donation-requests/${item.linkedRequestId}`
                : browseReturnTo
            }
            className="font-bold transition-colors hover:text-primary"
          >
            {isRequestLinked ? "طلب التبرع" : "تصفح التبرعات"}
          </Link>
          <span className="material-symbols-outlined text-[11px] text-gray-300">chevron_left</span>
          <span className="truncate font-black text-gray-700">{item.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-2">
          {/* صورة الغرض */}
          <div className="content-panel relative h-fit overflow-hidden lg:sticky lg:top-24">
            <div className="relative aspect-square">
              <Image
                src={imageUrl}
                alt={item.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                className="object-cover"
              />
            </div>
          </div>

          {/* تفاصيل الغرض */}
          <div className="flex flex-col gap-6">
            <div className="route-intro route-intro--compact space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {item.category && (
                  <span className="data-chip">
                    {item.category}
                  </span>
                )}
                <span className="data-chip">
                  {item.condition || "حالة جيدة"}
                </span>

                {(item.waitlistCount ?? 0) > 0 && (
                  <div className="data-chip">
                    <span className="material-symbols-outlined text-sm">group</span>
                    <p className="text-[10px] font-black text-white/80">
                      {item.waitlistCount} ينتظرون
                    </p>
                  </div>
                )}
              </div>

              <h1 className="route-intro__title">{item.title}</h1>
              <p className="max-w-xl text-sm leading-8 text-white/65">
                {item.description || "لم يضف المتبرع وصفًا لهذا الغرض."}
              </p>
            </div>

            {/* Countdown Timer */}
            {showCountdown && item.bookedAt && (
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <CountdownTimer
                  bookedAt={item.bookedAt}
                  isBooker={isBooker}
                  isDonor={isDonor}
                  expiryHours={item.expiryHours ?? 72}
                />
              </div>
            )}

            {/* معلومات الغرض */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "الموقع", val: item.location || "غير محدد", ic: "distance" },
                { label: "التاريخ", val: new Date(item.createdAt).toLocaleDateString("ar-EG"), ic: "event" },
              ].map((s, i) => (
                <div key={i} className="content-panel flex flex-col items-center p-3 text-center">
                  <span className="mb-1 material-symbols-outlined text-xl text-primary">{s.ic}</span>
                  <p className="text-[10px] font-bold text-gray-400">{s.label}</p>
                  <p className="mt-1 truncate text-[11px] font-black text-primary">{s.val}</p>
                </div>
              ))}
            </div>

            {/* بطاقة المتبرع */}
            {item.donor ? (
              <Link
                href={`/profile/${item.donor._id}`}
                className="content-panel group flex items-center justify-between p-4 transition-all hover:border-primary/30 hover:shadow-md"
              >
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-gray-50">
                  {item.donor.avatar ? (
                    <Image src={item.donor.avatar} alt="avatar" fill className="object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-gray-300">account_circle</span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-800 transition-colors group-hover:text-primary">
                    {item.donor.name}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400">ملف المتبرع</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-gray-300 transition-transform group-hover:-translate-x-1">
                chevron_left
              </span>
              </Link>
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-white p-4 text-sm font-bold text-gray-500">
                بيانات المتبرع غير متاحة
              </div>
            )}

            {/* مركز التسليم */}
            {item.safeHub && (
              <div className="content-panel space-y-2 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-primary">warehouse</span>
                  <p className="text-sm font-black text-gray-800">مركز التسليم</p>
                </div>
                <p className="text-sm font-bold text-gray-800">{item.safeHub.name}</p>
                <p className="text-[11px] text-gray-500">
                  {item.safeHub.address} — {item.safeHub.city}
                </p>
                <p className="flex items-center gap-1 text-[11px] text-gray-500">
                  <span className="material-symbols-outlined text-xs">schedule</span>
                  {item.safeHub.workingHours}
                </p>
              </div>
            )}

            <ItemActions
              item={item}
              message={message}
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              isDonor={isDonor}
              isBooker={isBooker}
              isWaitlisted={isWaitlisted}
              isCancelledBefore={isCancelledBefore}
              isRequestLinked={isRequestLinked}
              isRecipientConfirmed={isRecipientConfirmedActual}
              actionLoading={actionLoading}
              deliveryLoading={delivery.isLoading}
              fetchingChat={fetchingChat}
              showChat={showChat}
              onLogin={redirectToLogin}
              onRequest={handleRequestItem}
              onCancel={handleCancelAction}
              onConfirmDelivery={delivery.confirmDelivery}
              onConfirmReceipt={delivery.confirmReceipt}
              onOpenChat={handleOpenChatFlow}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
