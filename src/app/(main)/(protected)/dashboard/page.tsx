// src/app/(main)/(protected)/dashboard/page.tsx  ✅ REDESIGNED
"use client";

import { useState }          from 'react';
import { useDashboard }      from './hooks/useDashboard';
import { ActionModal }       from './components/ActionModal';
import { Toast }             from './components/Toast';
import { ProfileCard }       from './components/ProfileCard';
import { StatsGrid }         from './components/StatsGrid';
import { ItemsTable }        from './components/ItemsTable';
import ReportModal           from '@/components/ReportModal';
import AppealModal           from '@/components/AppealModal';
import ChatDrawer            from '@/components/ChatDrawer';

/* ─── Skeleton ──────────────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div
      className="min-h-screen bg-[#f7f6f2] pb-20 pt-20 md:pt-24"
      dir="rtl"
    >
      <div className="mx-auto max-w-5xl space-y-5 px-4 md:px-6">

        {/* Hero card skeleton */}
        <div className="animate-pulse rounded-2xl border border-black/[0.06]
                        bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 rounded-full bg-gray-100" />
            <div className="flex-1 space-y-2.5">
              <div className="h-5 w-40 rounded-lg bg-gray-100" />
              <div className="h-3 w-56 rounded-lg bg-gray-100" />
              <div className="h-2.5 w-full rounded-full bg-gray-100" />
            </div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="rounded-2xl border border-black/[0.06] bg-white p-5 h-24"
            />
          ))}
        </div>

        {/* Items skeleton */}
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border
                         border-black/[0.06] bg-white p-4"
            >
              <div className="h-16 w-16 shrink-0 rounded-xl bg-gray-100" />
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
    data, activeTab, setActiveTab, loading, error,
    confirmModal, setConfirmModal, toast, setToast,
    deliveryState, deliveryLoading,
    handleRecipientConfirm, handleDonorConfirm,
    handleDelete, handleCancelBooking, handleDonorCancelBooking,
    handleEdit,
    appealModal, openAppealModal, closeAppealModal, onAppealSuccess,
  } = useDashboard();

  const [reportTarget, setReportTarget] = useState<{
    userId: string; userName: string; itemId?: string;
  } | null>(null);

  const [chatTarget, setChatTarget] = useState<{
    itemId: string; itemTitle: string;
  } | null>(null);

  if (loading) return <DashboardSkeleton />;

  /* ── حالة الخطأ ─────────────────────────── */
  if (!data) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center
                   gap-4 bg-[#f7f6f2] p-8"
        dir="rtl"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl
                        bg-red-50">
          <span className="material-symbols-outlined text-4xl text-red-400">
            error_outline
          </span>
        </div>
        <p className="text-sm font-bold text-gray-500">
          حدث خطأ في تحميل البيانات، يرجى تحديث الصفحة
        </p>
        {process.env.NODE_ENV === 'development' && error && (
          <pre className="max-w-lg w-full overflow-auto rounded-xl bg-gray-900
                          p-4 text-left text-xs text-yellow-400">
            {error}
          </pre>
        )}
      </div>
    );
  }

  const activeItems = activeTab === 'donations'
    ? data.myDonations
    : data.myRequests;

  return (
    <div
      className="min-h-screen bg-[#f7f6f2] pb-20 font-body text-[#191c1d]"
      dir="rtl"
    >
      {/* ── Modals & Overlays ────────────────────────────────── */}
      {confirmModal.open && (
        <ActionModal
          message={confirmModal.message}
          isDanger
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(p => ({ ...p, open: false }))}
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
      <main className="mx-auto max-w-5xl space-y-5 px-4 pt-20 md:px-6 md:pt-24">

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

        {/* ── Tabs + Table ─────────────────────────────────── */}
        <section className="space-y-4">

          {/* Tabs */}
          <div className="flex gap-1 rounded-2xl border border-black/[0.06]
                          bg-white p-1.5 shadow-sm">
            {(['donations', 'requests'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl
                            py-2.5 text-sm font-black transition-all duration-200
                            ${activeTab === t
                              ? 'bg-primary text-white shadow-md shadow-primary/20'
                              : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
                            }`}
              >
                <span
                  className="material-symbols-outlined text-[17px]"
                  style={{
                    fontVariationSettings: activeTab === t ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {t === 'donations' ? 'volunteer_activism' : 'inventory_2'}
                </span>
                {t === 'donations'
                  ? `تبرعاتي`
                  : `طلباتي`}
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-black
                              transition-colors duration-200
                              ${activeTab === t
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-100 text-gray-500'
                              }`}
                >
                  {t === 'donations'
                    ? data.myDonations.length
                    : data.myRequests.length}
                </span>
              </button>
            ))}
          </div>

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
            onOpenChat={(item) => setChatTarget({
              itemId: item._id,
              itemTitle: item.title,
            })}
            onReport={(item, target) => {
              const isDonor  = target === 'donor';
              const userId   = isDonor
                ? (item.donor?._id ?? '')
                : (typeof item.bookedBy === 'object'
                    ? item.bookedBy?._id ?? '' : '');
              const userName = isDonor
                ? (item.donor?.name ?? 'المتبرع')
                : (typeof item.bookedBy === 'object'
                    ? item.bookedBy?.name ?? 'المستلم' : 'المستلم');
              setReportTarget({ userId, userName, itemId: item._id });
            }}
            onAppeal={openAppealModal}
          />
        </section>
      </main>
    </div>
  );
}