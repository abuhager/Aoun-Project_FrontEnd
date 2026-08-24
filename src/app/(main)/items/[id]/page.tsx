"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ConfirmModal } from "./components/ConfirmModal";
import { CountdownTimer } from "./components/CountdownTimer";
import { useItemDetails } from "./hooks/useItemDetails";
import LevelGate from "@/components/LevelGate";
import ChatDrawer from "@/components/ChatDrawer";
import { useRouter } from "next/navigation";
import { useDeliveryConfirmation } from "@/hooks/useDeliveryConfirmation";
import { useAuth } from "@/context/AuthContext";
import { openConversation } from "@/lib/api/conversationApi";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";

export default function ItemDetailsPage() {
  const router = useRouter();
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
  } = useItemDetails();

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
      <div className="flex min-h-screen items-center justify-center bg-[#f7f6f2]" dir="rtl">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f6f2] px-4" dir="rtl">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 text-center shadow-sm">
          <p className="text-sm font-bold text-gray-700">
            🛑 {loadError || "القطعة غير موجودة"}
          </p>
        </div>
      </div>
    );
  }

  const isRequestLinked = Boolean(item.linkedRequestId);
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const imageUrl = item.imageUrl ?? "/placeholder-item.png";
  const showCountdown =
    !isRequestLinked && item.status === "محجوز" && (isBooker || isDonor);
  const showChat = (isDonor || isBooker) && item.status === "محجوز";

  const isRecipientConfirmedActual = item.recipientConfirmed || delivery.isRecipientConfirmed;

  return (
    <div className="min-h-screen bg-[#f7f6f2] pb-20 text-[#191c1d]" dir="rtl">
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

      <main className="mx-auto max-w-7xl px-4 pt-20 md:px-8 md:pt-24">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-gray-400">
          <Link
            href={isRequestLinked ? `/donation-requests/${item.linkedRequestId}` : "/browse"}
            className="font-bold transition-colors hover:text-primary"
          >
            {isRequestLinked ? "طلب التبرع" : "تصفح التبرعات"}
          </Link>
          <span className="material-symbols-outlined text-[11px] text-gray-300">chevron_left</span>
          <span className="truncate font-black text-gray-700">{item.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-2">
          {/* صورة الغرض */}
          <div className="relative overflow-hidden rounded-3xl border border-[#e3e0db] bg-white shadow-sm">
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
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {item.category && (
                  <span className="rounded-lg bg-gray-100 px-3 py-1 text-[10px] font-bold text-gray-600">
                    {item.category}
                  </span>
                )}
                <span className="rounded-lg bg-primary/5 px-3 py-1 text-[10px] font-bold text-primary">
                  {item.condition || "حالة جيدة"}
                </span>

                {(item.waitlistCount ?? 0) > 0 && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1">
                    <span className="material-symbols-outlined text-sm text-blue-500">group</span>
                    <p className="text-[10px] font-black text-blue-700">
                      {item.waitlistCount} ينتظرون
                    </p>
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-black leading-tight md:text-3xl">{item.title}</h1>
              <p className="rounded-2xl border border-gray-100 bg-white p-4 text-sm leading-7 text-gray-600 shadow-sm">
                {item.description}
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
                <div key={i} className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-3 text-center shadow-sm">
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
                className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
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
              <div className="space-y-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
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

            {/* أزرار الحالات والعمليات */}
            <div className="space-y-4">
              {isRequestLinked && (
                <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-center text-xs font-bold leading-6 text-primary">
                  هذا الغرض مخصص لتلبية طلب تبرع مقبول، ولا يظهر في التصفح العام أو قوائم الانتظار.
                </div>
              )}

              {message.text && (
                <div
                  className={`rounded-2xl border p-4 text-center text-xs font-bold ${
                    message.type === "success"
                      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                      : "border-red-100 bg-red-50 text-red-700"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex flex-col gap-3">
                {/* 🔒 1. إذا كان المستخدم غير مسجل دخول */}
                {!isLoggedIn ? (
                  item.status === "تم التسليم" ? (
                    <div className="w-full rounded-2xl bg-emerald-50 py-4 text-center text-sm font-bold text-emerald-600">
                      تم التسليم بنجاح ✅
                    </div>
                  ) : (
                    <button
                      onClick={redirectToLogin}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-black text-white shadow-md shadow-primary/20 transition-all hover:bg-[#004d44]"
                    >
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                      {item.status === "محجوز"
                        ? "سجل دخولك للانضمام لقائمة الانتظار"
                        : "سجل دخولك لحجز هذا الغرض 🎁"}
                    </button>
                  )
                ) : isAdmin && !isDonor && !isBooker ? (
                  <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 text-center text-sm font-bold text-gray-600">
                    عرض إداري فقط — لا يمكن حجز هذا الغرض أو دخول قائمة انتظاره.
                  </div>
                ) : isDonor ? (
                  <div className="space-y-3">
                    <div className="w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-4 text-center text-sm font-bold text-gray-500">
                      هذا التبرع مقدم منك 🎁
                    </div>
                    {item.status === "محجوز" && (
                      <>
                        <button
                          onClick={delivery.confirmDelivery}
                          disabled={delivery.isLoading || !isRecipientConfirmedActual}
                          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black shadow-sm transition-all disabled:cursor-not-allowed ${
                            isRecipientConfirmedActual
                              ? "bg-primary text-white hover:bg-[#004d44]"
                              : "border border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {delivery.isLoading ? (
                            <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          ) : isRecipientConfirmedActual ? (
                            "تأكيد تسليم الغرض للمستلم 📦"
                          ) : (
                            "بانتظار تأكيد الاستلام من المستلم أولاً ⏳"
                          )}
                        </button>
                        {!isRecipientConfirmedActual && !isRequestLinked && (
                          <button
                            onClick={handleCancelAction}
                            disabled={actionLoading}
                            className="w-full rounded-2xl border border-red-100 bg-red-50 py-3 text-xs font-bold text-red-600 transition-all hover:bg-red-100"
                          >
                            إلغاء حجز المستلم الحالي
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ) : item.status === "تم التسليم" ? (
                  <div className="w-full rounded-2xl bg-emerald-50 py-4 text-center text-sm font-bold text-emerald-600">
                    تم التسليم بنجاح ✅
                  </div>
                ) : isCancelledBefore ? (
                  <div className="w-full rounded-2xl bg-gray-100 py-4 text-center text-sm font-bold text-gray-500">
                    لا يمكنك حجز هذا الغرض مرة أخرى 🚫
                  </div>
                ) : isBooker ? (
                  <div className="space-y-3 w-full">
                    {item.status === "محجوز" && (
                      <button
                        onClick={delivery.confirmReceipt}
                        disabled={delivery.isLoading || isRecipientConfirmedActual}
                        className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black shadow-sm transition-all ${
                          !isRecipientConfirmedActual
                            ? "bg-[#005a8c] text-white hover:bg-[#004a75]"
                            : "cursor-not-allowed border border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {delivery.isLoading ? (
                          <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : isRecipientConfirmedActual ? (
                          "تم تأكيد استلامك، بانتظار المتبرع... ⏳"
                        ) : (
                          "تأكيد استلام الغرض عيناً 👍"
                        )}
                      </button>
                    )}
                    {!isRecipientConfirmedActual && !isRequestLinked && (
                      <button
                        onClick={handleCancelAction}
                        disabled={actionLoading}
                        className="w-full rounded-2xl border border-red-200 bg-red-50 py-4 text-sm font-bold text-red-600 shadow-sm transition-all hover:bg-red-100"
                      >
                        {actionLoading ? (
                          <div className="h-5 w-5 rounded-full border-2 border-red-600 border-t-transparent animate-spin mx-auto" />
                        ) : (
                          "إلغاء الحجز ⚠️"
                        )}
                      </button>
                    )}
                  </div>
                ) : isWaitlisted ? (
                  <button
                    onClick={handleCancelAction}
                    disabled={actionLoading}
                    className="w-full rounded-2xl border border-orange-200 bg-orange-50 py-4 text-sm font-bold text-orange-600 transition-all hover:bg-orange-100"
                  >
                    {actionLoading ? (
                      <div className="h-5 w-5 rounded-full border-2 border-orange-600 border-t-transparent animate-spin mx-auto" />
                    ) : (
                      "الانسحاب من الانتظار 🚶‍♂️"
                    )}
                  </button>
                ) : item.status === "متاح" ? (
                  <LevelGate>
                    <button
                      onClick={handleRequestItem}
                      disabled={actionLoading}
                      className="w-full rounded-2xl bg-primary py-4 text-sm font-black text-white shadow-md shadow-primary/20 transition-all hover:bg-[#004d44]"
                    >
                      {actionLoading ? (
                        <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto" />
                      ) : (
                        "احجز هذه القطعة الآن"
                      )}
                    </button>
                  </LevelGate>
                ) : (
                  <LevelGate
                    fallback={
                      <div className="w-full rounded-2xl bg-gray-100 py-4 text-center text-sm font-bold text-gray-500">
                        🔐 يجب رفع مستوى الثقة للانضمام لقائمة الانتظار
                      </div>
                    }
                  >
                    <button
                      onClick={handleRequestItem}
                      disabled={actionLoading}
                      className="w-full rounded-2xl bg-[#005a8c] py-4 text-sm font-black text-white shadow-md transition-all hover:bg-[#004a75]"
                    >
                      {actionLoading ? (
                        <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto" />
                      ) : (
                        "انضم لقائمة الانتظار 🕒"
                      )}
                    </button>
                  </LevelGate>
                )}

                {/* زر التواصل */}
                {showChat && (
                  <button
                    onClick={handleOpenChatFlow}
                    disabled={fetchingChat}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 py-3 text-sm font-bold text-primary transition-all hover:bg-primary/10 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">
                      {fetchingChat ? "sync" : "chat"}
                    </span>
                    {fetchingChat
                      ? "جاري تجهيز غرفة المحادثة..."
                      : `تواصل مع ${isDonor ? "الحاجز" : "المتبرع"}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
