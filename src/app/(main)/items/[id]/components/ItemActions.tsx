"use client";

import LevelGate from "@/components/LevelGate";
import type { Item } from "@/types/item.types";
import type { ReactNode } from "react";

type ItemActionMessage = {
  type: string;
  text: string;
};

type ItemActionsProps = {
  item: Item;
  message: ItemActionMessage;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isDonor: boolean;
  isBooker: boolean;
  isWaitlisted: boolean;
  isCancelledBefore: boolean;
  isRequestLinked: boolean;
  isRecipientConfirmed: boolean;
  actionLoading: boolean;
  deliveryLoading: boolean;
  fetchingChat: boolean;
  showChat: boolean;
  onLogin: () => void;
  onRequest: () => void;
  onCancel: () => void;
  onConfirmDelivery: () => void;
  onConfirmReceipt: () => void;
  onOpenChat: () => void;
};

export function ItemActions({
  item,
  message,
  isLoggedIn,
  isAdmin,
  isDonor,
  isBooker,
  isWaitlisted,
  isCancelledBefore,
  isRequestLinked,
  isRecipientConfirmed,
  actionLoading,
  deliveryLoading,
  fetchingChat,
  showChat,
  onLogin,
  onRequest,
  onCancel,
  onConfirmDelivery,
  onConfirmReceipt,
  onOpenChat,
}: ItemActionsProps) {
  return (
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
        {!isLoggedIn ? (
          item.status === "تم التسليم" ? (
            <ActionNotice tone="success">تم التسليم بنجاح ✅</ActionNotice>
          ) : (
            <button
              onClick={onLogin}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-black text-white shadow-md shadow-primary/20 transition-all hover:bg-[#004d44]"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
              {item.status === "محجوز"
                ? "سجل دخولك للانضمام لقائمة الانتظار"
                : "سجل دخولك لحجز هذا الغرض 🎁"}
            </button>
          )
        ) : isAdmin && !isDonor && !isBooker ? (
          <ActionNotice>عرض إداري فقط — لا يمكن حجز هذا الغرض أو دخول قائمة انتظاره.</ActionNotice>
        ) : isDonor ? (
          <div className="space-y-3">
            <div className="w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-4 text-center text-sm font-bold text-gray-500">
              هذا التبرع مقدم منك 🎁
            </div>
            {item.status === "محجوز" && (
              <>
                <button
                  onClick={onConfirmDelivery}
                  disabled={deliveryLoading || !isRecipientConfirmed}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black shadow-sm transition-all disabled:cursor-not-allowed ${
                    isRecipientConfirmed
                      ? "bg-primary text-white hover:bg-[#004d44]"
                      : "border border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  {deliveryLoading ? (
                    <LoadingSpinner tone="light" />
                  ) : isRecipientConfirmed ? (
                    "تأكيد تسليم الغرض للمستلم 📦"
                  ) : (
                    "بانتظار تأكيد الاستلام من المستلم أولاً ⏳"
                  )}
                </button>
                {!isRecipientConfirmed && !isRequestLinked && (
                  <button
                    onClick={onCancel}
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
          <ActionNotice tone="success">تم التسليم بنجاح ✅</ActionNotice>
        ) : isCancelledBefore ? (
          <ActionNotice>لا يمكنك حجز هذا الغرض مرة أخرى 🚫</ActionNotice>
        ) : isBooker ? (
          <div className="w-full space-y-3">
            {item.status === "محجوز" && (
              <button
                onClick={onConfirmReceipt}
                disabled={deliveryLoading || isRecipientConfirmed}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black shadow-sm transition-all ${
                  !isRecipientConfirmed
                    ? "bg-[#005a8c] text-white hover:bg-[#004a75]"
                    : "cursor-not-allowed border border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                {deliveryLoading ? (
                  <LoadingSpinner tone="light" />
                ) : isRecipientConfirmed ? (
                  "تم تأكيد استلامك، بانتظار المتبرع... ⏳"
                ) : (
                  "تأكيد استلام الغرض عيناً 👍"
                )}
              </button>
            )}
            {!isRecipientConfirmed && !isRequestLinked && (
              <button
                onClick={onCancel}
                disabled={actionLoading}
                className="w-full rounded-2xl border border-red-200 bg-red-50 py-4 text-sm font-bold text-red-600 shadow-sm transition-all hover:bg-red-100"
              >
                {actionLoading ? <LoadingSpinner tone="danger" /> : "إلغاء الحجز ⚠️"}
              </button>
            )}
          </div>
        ) : isWaitlisted ? (
          <button
            onClick={onCancel}
            disabled={actionLoading}
            className="w-full rounded-2xl border border-orange-200 bg-orange-50 py-4 text-sm font-bold text-orange-600 transition-all hover:bg-orange-100"
          >
            {actionLoading ? <LoadingSpinner tone="warning" /> : "الانسحاب من الانتظار 🚶‍♂️"}
          </button>
        ) : item.status === "متاح" ? (
          <LevelGate>
            <button
              onClick={onRequest}
              disabled={actionLoading}
              className="w-full rounded-2xl bg-primary py-4 text-sm font-black text-white shadow-md shadow-primary/20 transition-all hover:bg-[#004d44]"
            >
              {actionLoading ? <LoadingSpinner tone="light" /> : "احجز هذه القطعة الآن"}
            </button>
          </LevelGate>
        ) : (
          <LevelGate
            fallback={
              <ActionNotice>🔐 يجب رفع مستوى الثقة للانضمام لقائمة الانتظار</ActionNotice>
            }
          >
            <button
              onClick={onRequest}
              disabled={actionLoading}
              className="w-full rounded-2xl bg-[#005a8c] py-4 text-sm font-black text-white shadow-md transition-all hover:bg-[#004a75]"
            >
              {actionLoading ? <LoadingSpinner tone="light" /> : "انضم لقائمة الانتظار 🕒"}
            </button>
          </LevelGate>
        )}

        {showChat && (
          <button
            onClick={onOpenChat}
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
  );
}

function ActionNotice({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success";
}) {
  const colors =
    tone === "success"
      ? "bg-emerald-50 text-emerald-600"
      : "border border-gray-200 bg-gray-50 text-gray-600";
  return (
    <div className={`w-full rounded-2xl py-4 text-center text-sm font-bold ${colors}`}>
      {children}
    </div>
  );
}

function LoadingSpinner({
  tone,
}: {
  tone: "light" | "danger" | "warning";
}) {
  const color =
    tone === "danger"
      ? "border-red-600"
      : tone === "warning"
        ? "border-orange-600"
        : "border-white";
  return <div className={`mx-auto h-5 w-5 rounded-full border-2 border-t-transparent ${color} animate-spin`} />;
}
