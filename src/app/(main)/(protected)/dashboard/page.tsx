"use client";

import Navbar from "@/components/Navbar";
import { useDashboard } from "./hooks/useDashboard";
import { ActionModal }  from "./components/ActionModal";
import { Toast }        from "./components/Toast";
import { ProfileCard }  from "./components/ProfileCard";
import { StatsGrid }    from "./components/StatsGrid";
import { ItemsTable }   from "./components/ItemsTable";
import { OtpModal }     from "./components/OtpModal";

export default function DashboardPage() {
  const {
    data, activeTab, setActiveTab, loading,
    showOtpModal, confirmModal, setConfirmModal, toast, setToast,
    selectedItem, otp, setOtp, otpError, otpLoading,
    handleDelete, handleCancelBooking, handleDonorCancelBooking,
    handleEdit, handleConfirmDelivery,
    openOtpModal, closeOtpModal,
  } = useDashboard();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-surface">
        <p className="text-gray-400 text-sm">حدث خطأ في تحميل البيانات. تأكد من اتصالك بالسيرفر.</p>
      </div>
    );
  }

  const activeItems = activeTab === "donations" ? data.myDonations : data.myRequests;

  return (
    <div className="bg-surface min-h-screen pb-16 text-[#191c1d] font-body" dir="rtl">

      {/* Modals & Toasts */}
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

      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-6xl mx-auto space-y-6">

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

        <section className="space-y-4">
          <div className="flex gap-4 border-b border-gray-100">
            {(["donations", "requests"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`pb-3 text-sm font-black transition-all ${
                  activeTab === t
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-400"
                }`}
              >
                {t === "donations"
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
          />
        </section>
      </main>
    </div>
  );
}
