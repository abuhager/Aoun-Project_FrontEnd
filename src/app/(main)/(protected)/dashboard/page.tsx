// src/app/(main)/(protected)/dashboard/page.tsx
// ✅ Patched: إزالة OtpModal → Double Confirmation Flow
'use client';

import { useState }           from 'react';
import { useDashboard }       from './hooks/useDashboard';
import { ActionModal }        from './components/ActionModal';
import { Toast }              from './components/Toast';
import { ProfileCard }        from './components/ProfileCard';
import { StatsGrid }          from './components/StatsGrid';
import { ItemsTable }         from './components/ItemsTable';
import ReportModal            from '@/components/ReportModal';
import AppealModal            from '@/components/AppealModal';
// ✅ استبدل OtpModal بـ DeliveryConfirmFlow (مُضمَّن في ItemsTable)

function DashboardSkeleton() {
  return (
    <div className="bg-surface min-h-screen pb-16 pt-20 md:pt-24 px-4 md:px-8 max-w-6xl mx-auto space-y-6" dir="rtl">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 animate-pulse">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-100 rounded w-40" />
          <div className="h-3 bg-gray-100 rounded w-56" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 animate-pulse">
        {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-20" />)}
      </div>
      <div className="space-y-3 animate-pulse">
        {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-24" />)}
      </div>
    </div>
  );
}

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

  if (loading) return <DashboardSkeleton />;

  if (!data) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-surface gap-3 p-8" dir="rtl">
        <span className="material-symbols-outlined text-5xl text-gray-200">error_outline</span>
        <p className="text-gray-400 text-sm font-bold">حدث خطأ في تحميل البيانات، يرجى تحديث الصفحة</p>
        {process.env.NODE_ENV === 'development' && error && (
          <pre className="text-xs text-yellow-400 bg-gray-900 rounded p-4 max-w-lg w-full overflow-auto text-left">{error}</pre>
        )}
      </div>
    );
  }

  const activeItems = activeTab === 'donations' ? data.myDonations : data.myRequests;

  return (
    <div className="bg-surface min-h-screen pb-16 text-[#191c1d] font-body" dir="rtl">

      {confirmModal.open && (
        <ActionModal
          message={confirmModal.message}
          isDanger
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(p => ({ ...p, open: false }))}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ✅ حُذف OtpModal — الـ Double Confirmation مُضمَّن في ItemsTable */}

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

      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-6xl mx-auto space-y-6">
        <ProfileCard
          name={data.user?.name}
          email={data.user?.email}
          trustScore={data.user?.gamification?.trustScore}
        />
        <StatsGrid
          trustScore={data.user?.gamification?.trustScore}
          quota={data.user?.quota}
          donationsCount={data.myDonations.length}
        />

        <section className="space-y-4">
          <div className="flex gap-4 border-b border-gray-100">
            {(['donations', 'requests'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`pb-3 text-sm font-black transition-all ${
                  activeTab === t
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t === 'donations'
                  ? `تبرعاتي (${data.myDonations.length})`
                  : `طلباتي (${data.myRequests.length})`}
              </button>
            ))}
          </div>

          {/* ✅ مرّر deliveryState و handlers للـ ItemsTable */}
          <ItemsTable
            items={activeItems}
            activeTab={activeTab}
            onDelete={handleDelete}
            onCancelBooking={handleCancelBooking}
            onDonorCancelBooking={handleDonorCancelBooking}
            onEdit={handleEdit}
            // ✅ Double Confirmation props
            deliveryState={deliveryState}
            deliveryLoading={deliveryLoading}
            onRecipientConfirm={handleRecipientConfirm}
            onDonorConfirm={handleDonorConfirm}
            onReport={(item, target) => {
              const isDonor  = target === 'donor';
              const userId   = isDonor
                ? (item.donor?._id ?? '')
                : (typeof item.bookedBy === 'object' ? item.bookedBy?._id ?? '' : '');
              const userName = isDonor
                ? (item.donor?.name ?? 'المتبرع')
                : (typeof item.bookedBy === 'object' ? item.bookedBy?.name ?? 'المستلم' : 'المستلم');
              setReportTarget({ userId, userName, itemId: item._id });
            }}
            onAppeal={openAppealModal}
          />
        </section>
      </main>
    </div>
  );
}
