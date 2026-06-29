"use client";

import { useState } from "react";
import { useDashboard } from "./hooks/useDashboard";
import { ActionModal } from "./components/ActionModal";
import { Toast } from "./components/Toast";
import { ProfileCard } from "./components/ProfileCard";
import { StatsGrid } from "./components/StatsGrid";
import { ItemsTable } from "./components/ItemsTable";
import ReportModal from "@/components/ReportModal";
import AppealModal from "@/components/AppealModal";
import ChatDrawer from "@/components/ChatDrawer";

/* ─── Skeleton ──────────────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div
      className="min-h-screen bg-[#f7f6f2] pb-16 pt-20 md:pt-24"
      dir="rtl"
    >
      <div className="mx-auto max-w-7xl space-y-4 px-4 md:px-6">
        {/* Top heading skeleton */}
        <div className="animate-pulse space-y-2">
          <div className="h-6 w-48 rounded-xl bg-gray-200" />
          <div className="h-4 w-72 rounded-xl bg-gray-100" />
        </div>

        {/* Profile skeleton */}
        <div className="animate-pulse rounded-3xl border border-black/[0.06] bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 shrink-0 rounded-full bg-gray-100" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-40 rounded-lg bg-gray-100" />
              <div className="h-3 w-56 rounded-lg bg-gray-100" />
              <div className="h-2.5 w-full rounded-full bg-gray-100" />
            </div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-3xl border border-black/[0.06] bg-white p-4"
            />
          ))}
        </div>

        {/* Tabs skeleton */}
        <div className="animate-pulse rounded-2xl border border-black/[0.06] bg-white p-1 shadow-sm">
          <div className="grid grid-cols-2 gap-1">
            <div className="h-11 rounded-xl bg-gray-100" />
            <div className="h-11 rounded-xl bg-gray-100" />
          </div>
        </div>

        {/* Items skeleton */}
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-3xl border border-black/[0.06] bg-white p-4"
            >
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/5 rounded-lg bg-gray-100" />
                <div className="h-3 w-2/5 rounded-lg bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function DashboardPage() {
  const {
    data,
    activeTab,
    setActiveTab,
    loading,
    error,
    confirmModal,
    setConfirmModal,
    toast,
    setToast,
    deliveryState,
    deliveryLoading,
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
  } = useDashboard();

  const [reportTarget, setReportTarget] = useState<{
    userId: string;
    userName: string;
    itemId?: string;
  } | null>(null);

  const [chatTarget, setChatTarget] = useState<{
    itemId: string;
    itemTitle: string;
  } | null>(null);

  if (loading) return <DashboardSkeleton />;

  if (!data) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f6f2] p-8"
        dir="rtl"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <span className="material-symbols-outlined text-4xl text-red-400">
            error_outline
          </span>
        </div>

        <p className="text-sm font-bold text-gray-500">
          حدث خطأ في تحميل البيانات، يرجى تحديث الصفحة
        </p>

        {process.env.NODE_ENV === "development" && error && (
          <pre className="max-w-lg w-full overflow-auto rounded-xl bg-gray-900 p-4 text-left text-xs text-yellow-400">
            {error}
          </pre>
        )}
      </div>
    );
  }

  const activeItems =
    activeTab === "donations" ? data.myDonations : data.myRequests;

  return (
    <div
      className="min-h-screen bg-[#f7f6f2] pb-16 font-body text-[#191c1d]"
      dir="rtl"
    >
      {/* ── Modals & Overlays ────────────────────────────────── */}
      {confirmModal.open && (
        <ActionModal
          message={confirmModal.message}
          isDanger
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal((p) => ({ ...p, open: false }))}
        />
      )}

      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {reportTarget && (
        <ReportModal
          reportedUserId={reportTarget.userId}
          reportedUserName={reportTarget.userName}
          itemId={reportTarget.itemId}
          onClose={() => setReportTarget(null)}
        />
      )}

      {appealModal.open && (
        <AppealModal
          reportId={appealModal.reportId}
          onClose={closeAppealModal}
          onSuccess={onAppealSuccess}
        />
      )}

      {chatTarget && (
        <ChatDrawer
          itemId={chatTarget.itemId}
          itemTitle={chatTarget.itemTitle}
          isOpen={!!chatTarget}
          onClose={() => setChatTarget(null)}
        />
      )}

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl space-y-5 px-4 pt-20 md:px-6 md:pt-24">
        {/* Header */}
        <section className="flex flex-col gap-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-[11px] font-black text-primary">
            <span className="material-symbols-outlined text-[14px]">
              dashboard
            </span>
            لوحة التحكم
          </div>

          <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#1d2324] md:text-3xl">
                أهلاً {data.user?.name || "بك"}
              </h1>
              <p className="mt-1 text-sm font-medium text-[#7a756f]">
                راقب تبرعاتك وطلباتك، وتابع حالة العناصر والإجراءات الجارية من مكان واحد.
              </p>
            </div>

            <div className="text-xs font-bold text-[#9b948d]">
              آخر تحديث للبيانات من جلستك الحالية
            </div>
          </div>
        </section>

        {/* Summary cards */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <ProfileCard
            name={data.user?.name}
            email={data.user?.email}
            trustScore={data.user?.trustScore}
          />

          <StatsGrid
            trustScore={data.user?.trustScore}
            quota={data.user?.quota}
            donationsCount={data.myDonations.length}
          />
        </section>

        {/* Work area */}
        <section className="space-y-3">
          {/* Tabs card */}
          <div className="rounded-3xl border border-black/[0.06] bg-white p-1.5 shadow-sm">
            <div className="grid grid-cols-2 gap-1">
              {(["donations", "requests"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black transition-all duration-300 ${
                    activeTab === t
                      ? "bg-primary text-white shadow-[0_10px_24px_rgba(1,105,111,0.16)]"
                      : "text-gray-500 hover:bg-[#f8f6f2] hover:text-[#1d2324]"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{
                      fontVariationSettings:
                        activeTab === t ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {t === "donations" ? "volunteer_activism" : "inventory_2"}
                  </span>

                  <span>{t === "donations" ? "تبرعاتي" : "طلباتي"}</span>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${
                      activeTab === t
                        ? "bg-white/15 text-white"
                        : "bg-[#f1efea] text-gray-600"
                    }`}
                  >
                    {t === "donations"
                      ? data.myDonations.length
                      : data.myRequests.length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table card wrapper */}
          <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-black/[0.05] px-4 py-3 md:px-5">
              <div>
                <h2 className="text-sm font-black text-[#1f2425]">
                  {activeTab === "donations" ? "سجل التبرعات" : "سجل الطلبات"}
                </h2>
                <p className="mt-0.5 text-xs font-medium text-[#8a847d]">
                  {activeTab === "donations"
                    ? "راجع التبرعات التي أضفتها وتابع حالتها الحالية."
                    : "راجع العناصر التي قمت بحجزها أو تنتظرها."}
                </p>
              </div>

              <div className="rounded-full bg-[#f6f3ee] px-3 py-1 text-[11px] font-black text-[#5f5952]">
                {activeItems.length} عنصر
              </div>
            </div>

            <div className="p-2 md:p-3">
              <ItemsTable
                items={activeItems}
                activeTab={activeTab}
                onDelete={handleDelete}
                onCancelBooking={handleCancelBooking}
                onDonorCancelBooking={handleDonorCancelBooking}
                onEdit={handleEdit}
                deliveryState={deliveryState}
                deliveryLoading={deliveryLoading}
                onRecipientConfirm={handleRecipientConfirm}
                onDonorConfirm={handleDonorConfirm}
                onOpenChat={(item) =>
                  setChatTarget({
                    itemId: item._id,
                    itemTitle: item.title,
                  })
                }
                onReport={(item, target) => {
                  const isDonor = target === "donor";
                  const userId = isDonor
                    ? item.donor?._id ?? ""
                    : typeof item.bookedBy === "object"
                    ? item.bookedBy?._id ?? ""
                    : "";
                  const userName = isDonor
                    ? item.donor?.name ?? "المتبرع"
                    : typeof item.bookedBy === "object"
                    ? item.bookedBy?.name ?? "المستلم"
                    : "المستلم";

                  setReportTarget({
                    userId,
                    userName,
                    itemId: item._id,
                  });
                }}
                onAppeal={openAppealModal}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}