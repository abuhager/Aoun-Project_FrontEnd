// src/app/(main)/(protected)/dashboard/page.tsx
'use client';

import { useState }      from 'react';
import { useDashboard }  from './hooks/useDashboard';
import { ActionModal }   from './components/ActionModal';
import { Toast }         from './components/Toast';
import { ProfileCard }   from './components/ProfileCard';
import { StatsGrid }     from './components/StatsGrid';
import { ItemsTable }    from './components/ItemsTable';
import { OtpModal }      from './components/OtpModal';
import ReportModal       from '@/components/ReportModal';
import AppealModal       from '@/components/AppealModal';  // ✅ إضافة


export default function DashboardPage() {
  const {
    data, activeTab, setActiveTab, loading, error,
    showOtpModal, confirmModal, setConfirmModal, toast, setToast,
    selectedItem, otp, setOtp, otpError, otpLoading,
    handleDelete, handleCancelBooking, handleDonorCancelBooking,
    handleEdit, handleConfirmDelivery,
    openOtpModal, closeOtpModal,
  } = useDashboard();

  // ✅ Report state
  const [reportTarget, setReportTarget] = useState<{
    userId:   string;
    userName: string;
    itemId?:  string;
  } | null>(null);

  // ✅ Appeal state
  const [appealReportId, setAppealReportId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-surface gap-3 p-8">
        <p className="text-red-400 text-sm font-bold">
          حدث خطأ في تحميل البيانات، يرجى تحديث الصفحة
        </p>
        {process.env.NODE_ENV === 'development' && error && (
          <pre className="text-xs text-yellow-400 bg-gray-900 rounded p-4 max-w-lg w-full overflow-auto text-left dir-ltr">
            {error}
          </pre>
        )}
        {process.env.NODE_ENV === 'development' && (
          <p className="text-gray-500 text-xs">
            API: {process.env.NEXT_PUBLIC_API_URL ?? 'غير معرّف'}
          </p>
        )}
      </div>
    );
  }

  const activeItems = activeTab === 'donations' ? data.myDonations : data.myRequests;

  return (
    <div className="bg-surface min-h-screen pb-16 text-[#191c1d] font-body" dir="rtl">

      {/* ── Modals ── */}
      {confirmModal.open && (
        <ActionModal
          message={confirmModal.message}
          isDanger
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal((p) => ({ ...p, open: false }))}
        />
      )}

      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}

      {showOtpModal && selectedItem && (
        <OtpModal
          item={selectedItem}
          otp={otp}
          otpError={otpError}
          otpLoading={otpLoading}
          onOtpChange={setOtp}
          onSubmit={handleConfirmDelivery}
          onClose={closeOtpModal}
        />
      )}

      {/* ✅ Report Modal */}
      {reportTarget && (
        <ReportModal
          reportedUserId={reportTarget.userId}
          reportedUserName={reportTarget.userName}
          itemId={reportTarget.itemId}
          onClose={() => setReportTarget(null)}
        />
      )}

      {/* ✅ Appeal Modal */}
      {appealReportId && (
        <AppealModal
          reportId={appealReportId}
          onClose={() => setAppealReportId(null)}
        />
      )}

      {/* ── Main Content ── */}
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
            {(['donations', 'requests'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`pb-3 text-sm font-black transition-all ${
                  activeTab === t
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-400'
                }`}
              >
                {t === 'donations'
                  ? `تبرعاتي (${data.myDonations.length})`
                  : `طلباتي (${data.myRequests.length})`}
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
            onOpenOtp={openOtpModal}
            onReport={(item, target) => {
              const isDonorTarget = target === 'donor';
              const userId   = isDonorTarget
                ? (item.donor?._id ?? '')
                : (typeof item.bookedBy === 'object' ? item.bookedBy?._id ?? '' : '');
              const userName = isDonorTarget
                ? (item.donor?.name ?? 'المتبرع')
                : (typeof item.bookedBy === 'object' ? item.bookedBy?.name ?? 'المستلم' : 'المستلم');
              setReportTarget({ userId, userName, itemId: item._id });
            }}
            onAppeal={(reportId) => setAppealReportId(reportId)}  // ✅ إضافة
          />
        </section>
      </main>
    </div>
  );
}