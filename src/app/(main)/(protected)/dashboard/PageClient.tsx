"use client";

import { useState } from "react";
import Link from "next/link";
import { useDashboard } from "./hooks/useDashboard";
import { ActionModal } from "./components/ActionModal";
import { Toast } from "./components/Toast";
import { ProfileCard } from "./components/ProfileCard";
import { StatsGrid } from "./components/StatsGrid";
import { ItemsTable } from "./components/ItemsTable";
import ReportModal from "@/components/ReportModal";
import AppealModal from "@/components/AppealModal";
import type { Item } from "@/types/item.types";
import ChatDrawer from "@/components/ChatDrawer";
import GlobalRatingModal from "@/components/GlobalRatingModal";
import { openConversation } from "@/lib/api/conversationApi";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import PageIntro from "@/components/ui/PageIntro";

/* ─── Skeleton ──────────────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div className="page-shell pb-16 pt-24" dir="rtl">
      <div className="site-container space-y-4">
        <div className="animate-pulse space-y-2">
          <div className="h-6 w-48 rounded-xl bg-surface-container-high" />
          <div className="h-4 w-72 rounded-xl bg-surface-container" />
        </div>
        <div className="animate-pulse rounded-[20px] border border-black/[0.06] bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 shrink-0 rounded-full bg-surface-container" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-40 rounded-lg bg-surface-container" />
              <div className="h-3 w-56 rounded-lg bg-surface-container" />
              <div className="h-2.5 w-full rounded-full bg-surface-container" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-[20px] border border-black/[0.06] bg-white p-4" />
          ))}
        </div>
        <div className="animate-pulse rounded-2xl border border-black/[0.06] bg-white p-1 shadow-sm">
          <div className="grid grid-cols-2 gap-1">
            <div className="h-11 rounded-xl bg-gray-100" />
            <div className="h-11 rounded-xl bg-gray-100" />
          </div>
        </div>
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-[20px] border border-black/[0.06] bg-white p-4">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-surface-container" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/5 rounded-lg bg-surface-container" />
                <div className="h-3 w-2/5 rounded-lg bg-surface-container" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function DashboardClient() {
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
  } = useDashboard();

  const [reportTarget, setReportTarget] = useState<{
    userId: string;
    userName: string;
    itemId?: string;
  } | null>(null);

  // حالات الشات
  const [chatOpen, setChatOpen] = useState(false);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activeItemTitle, setActiveItemTitle] = useState("");

  if (loading) return <DashboardSkeleton />;

  if (!data) {
    return (
      <div className="page-shell flex flex-col items-center justify-center gap-4 p-8" dir="rtl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <span className="material-symbols-outlined text-4xl text-red-400">error_outline</span>
        </div>
        <p className="text-sm font-bold text-gray-500">حدث خطأ في تحميل البيانات، يرجى تحديث الصفحة</p>
        {process.env.NODE_ENV === "development" && error && (
          <pre className="max-w-lg w-full overflow-auto rounded-xl bg-gray-900 p-4 text-left text-xs text-yellow-400">
            {error}
          </pre>
        )}
      </div>
    );
  }

  // دالة فتح المحادثة
  const handleOpenChatFlow = async (item: Item & { owner?: { _id: string } }) => {
    try {
      const { conversation } = await openConversation(item._id);
      setActiveConvId(conversation._id);
      setActiveItemTitle(item.title);
      setChatOpen(true);
    } catch (error) {
      setToast({
        type: "error",
        msg: extractErrorMsg(error, "تعذّر فتح المحادثة"),
      });
    }
  };

  const activeItems = activeTab === "donations" ? data.myDonations : data.myRequests;

  return (
    <div className="page-shell pb-16 pt-20 font-body" dir="rtl">
      {/* ── Modals & Overlays ────────────────────────────────── */}
      <GlobalRatingModal />

      {confirmModal.open && (
        <ActionModal
          message={confirmModal.message}
          isDanger
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal((p) => ({ ...p, open: false }))}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {reportTarget && (
        <ReportModal
          reportedUserId={reportTarget.userId}
          reportedUserName={reportTarget.userName}
          itemId={reportTarget.itemId}
          onClose={() => setReportTarget(null)}
        />
      )}

      {appealModal.open && (
        <AppealModal reportId={appealModal.reportId} onClose={closeAppealModal} onSuccess={onAppealSuccess} />
      )}

      {/* ChatDrawer */}
      {chatOpen && activeConvId && (
        <ChatDrawer
          key={activeConvId}
          conversationId={activeConvId}
          itemTitle={activeItemTitle}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="site-container space-y-6 md:pt-4">
        <PageIntro
          eyebrow="مساحة العمل الشخصية"
          title={<>أهلًا {data.user?.name || "بك"}</>}
          description="تابع التبرعات والحجوزات والإجراءات التي تحتاج انتباهك، وابدأ مهمة جديدة دون مغادرة اللوحة."
          icon="space_dashboard"
          tone="ink"
          actions={
            <div className="flex flex-wrap gap-2">
              <Link href="/donation-requests/new" className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-black text-white hover:bg-white/16">
                <span className="material-symbols-outlined ml-1 text-[17px]">campaign</span>
                إنشاء طلب
              </Link>
              <Link href="/add-item" className="rounded-xl bg-white px-4 py-3 text-xs font-black text-primary-container shadow-lg">
                <span className="material-symbols-outlined ml-1 text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                إضافة تبرع
              </Link>
            </div>
          }
          meta={
            <>
              <span className="data-chip">{data.myDonations.length} تبرع</span>
              <span className="data-chip">{data.myRequests.length} حجز أو طلب</span>
              <span className="data-chip">{data.user?.trustScore ?? 0} نقطة ثقة</span>
            </>
          }
        />

        {/* Summary cards */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <ProfileCard
            name={data.user?.name}
            email={data.user?.email}
            avatar={data.user?.avatar}
            trustScore={data.user?.trustScore}
          />
          <StatsGrid trustScore={data.user?.trustScore} quota={data.user?.quota} donationsCount={data.myDonations.length} />
        </section>

        {/* Work area */}
        <section className="space-y-3">
          {/* Tabs card */}
          <div className="rounded-[20px] border border-black/[0.06] bg-white p-1.5 shadow-sm">
            <div className="grid grid-cols-2 gap-1">
              {(["donations", "requests"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black transition-all duration-300 ${
                    activeTab === t
                      ? "bg-primary text-white shadow-[0_10px_24px_rgba(1,105,111,0.16)]"
                      : "text-on-surface-soft hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: activeTab === t ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {t === "donations" ? "volunteer_activism" : "inventory_2"}
                  </span>
                  <span>{t === "donations" ? "تبرعاتي" : "طلباتي"}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${
                      activeTab === t ? "bg-white/15 text-white" : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {t === "donations" ? data.myDonations.length : data.myRequests.length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table card wrapper */}
          <div className="overflow-hidden rounded-[20px] border border-black/[0.06] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-black/[0.05] px-4 py-3 md:px-5">
              <div>
                <h2 className="text-sm font-black text-on-surface">
                  {activeTab === "donations" ? "سجل التبرعات" : "سجل الطلبات"}
                </h2>
                <p className="mt-0.5 text-xs font-medium text-on-surface-soft">
                  {activeTab === "donations"
                    ? "راجع التبرعات التي أضفتها وتابع حالتها الحالية."
                    : "راجع العناصر التي قمت بحجزها أو تنتظرها."}
                </p>
              </div>
              <div className="rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-black text-on-surface-variant">
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
                deliveryLoadingItemId={deliveryLoadingItemId}
                onRecipientConfirm={handleRecipientConfirm}
                onDonorConfirm={handleDonorConfirm}
                onOpenChat={handleOpenChatFlow}
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

                  setReportTarget({ userId, userName, itemId: item._id });
                }}
                onAppeal={openAppealModal}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
