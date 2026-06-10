// src/app/(main)/items/[id]/page.tsx
// [FIX-3] window.location.reload() → fetchItem() من الـ hook
"use client";
import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { ConfirmModal }      from "./components/ConfirmModal";
import { CountdownTimer }    from "./components/CountdownTimer";
import { useItemDetails }    from "./hooks/useItemDetails";
import LevelGate             from "@/components/LevelGate";
import DeliveryConfirmButton from "@/components/DeliveryConfirmButton";
import ChatDrawer            from "@/components/ChatDrawer";
import { useSettings }       from "@/hooks/useSettings";

const backendUrl = process.env.NEXT_PUBLIC_API_URL!;

export default function ItemDetailsPage() {
  const {
    item, loading, message, actionLoading,
    confirmModal, setConfirmModal,
    isDonor, isBooker, isWaitlisted, isCancelledBefore,
    handleRequestItem, handleCancelAction,
    fetchItem, // [FIX-3]
  } = useItemDetails();

  const { settings } = useSettings();
  const expiryHours = settings?.bookingExpiryHours ?? 72;
  const [chatOpen, setChatOpen] = useState(false);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-surface">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!item) return <div className="text-center py-20 font-bold">🛑 القطعة غير موجودة</div>;

  const imageUrl = item.imageUrl.startsWith("http") ? item.imageUrl : `${backendUrl}/${item.imageUrl}`;
  const showCountdown = item.status === "محجوز" && (isBooker || isDonor);
  const initialRecipientConfirmed = item.recipientConfirmed === true;
  const showChat = (isDonor || isBooker) && item.status === "محجوز";

  // [FIX-3] بدلاً من reload
  const handleDeliverySuccess = (_itemId: string) => { fetchItem(); };

  return (
    <div className="bg-surface min-h-screen text-[#191c1d] pb-20" dir="rtl">
      {confirmModal.show && (
        <ConfirmModal message={confirmModal.msg} isDanger={confirmModal.isDanger}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal((p) => ({ ...p, show: false }))} />
      )}
      {showChat && (
        <ChatDrawer itemId={item._id} itemTitle={item.title} isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      )}
      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-5xl mx-auto">
        <nav className="mb-6 flex items-center gap-2 text-on-surface-variant text-xs font-medium">
          <Link href="/browse" className="hover:text-primary transition-colors">تصفح التبرعات</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_left</span>
          <span className="font-black truncate">{item.title}</span>
        </nav>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <div className="relative rounded-3xl overflow-hidden bg-white aspect-square border border-[#edeeef] shadow-sm">
            <Image src={imageUrl} alt={item.title} fill priority sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold">{item.category}</span>
                <span className="px-3 py-1 rounded-lg bg-primary/5 text-primary text-[10px] font-bold">{item.condition || "حالة جيدة"}</span>
              </div>
              <h1 className="text-3xl font-black leading-tight">{item.title}</h1>
              <p className="text-sm text-on-surface-variant bg-white p-4 rounded-2xl border border-gray-100">{item.description}</p>
            </div>
            {showCountdown && item.bookedAt && (
              <CountdownTimer bookedAt={item.bookedAt} isBooker={isBooker} isDonor={isDonor} expiryHours={expiryHours} />
            )}
            {message.text && (
              <div className={`p-4 rounded-2xl text-center text-xs font-bold border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                {message.text}
              </div>
            )}
            <div className="flex flex-col gap-3">
              {isDonor ? (
                <div className="space-y-3">
                  <div className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold text-center border-2 border-dashed text-sm">هذا التبرع مقدم منك 🎁</div>
                  {item.status === "محجوز" && (
                    <>
                      <DeliveryConfirmButton itemId={item._id} userRole="donor" initialRecipientConfirmed={initialRecipientConfirmed} onSuccess={handleDeliverySuccess} className="w-full py-4 rounded-2xl font-black text-sm" />
                      <button onClick={handleCancelAction} disabled={actionLoading} className="w-full bg-red-50 text-red-600 border border-red-100 py-3 rounded-xl text-xs font-bold hover:bg-red-100 transition-all">إلغاء حجز المستلم الحالي</button>
                    </>
                  )}
                </div>
              ) : item.status === "تم التسليم" ? (
                <div className="w-full py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-center text-sm">تم التسليم بنجاح ✅</div>
              ) : isCancelledBefore ? (
                <div className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold text-center text-sm">لا يمكنك حجز هذا الغرض مرة أخرى 🚫</div>
              ) : isBooker ? (
                <div className="space-y-3">
                  {item.status === "محجوز" && (
                    <DeliveryConfirmButton itemId={item._id} userRole="recipient" initialRecipientConfirmed={initialRecipientConfirmed} onSuccess={handleDeliverySuccess} className="w-full py-4 rounded-2xl font-black text-sm" />
                  )}
                  <button onClick={handleCancelAction} disabled={actionLoading} className="w-full bg-red-50 text-red-600 border border-red-200 py-4 rounded-2xl font-black text-sm hover:bg-red-100 transition-all">إلغاء الحجز ⚠️</button>
                </div>
              ) : isWaitlisted ? (
                <button onClick={handleCancelAction} disabled={actionLoading} className="w-full bg-orange-50 text-orange-600 border border-orange-200 py-4 rounded-2xl font-black text-sm hover:bg-orange-100 transition-all">الانسحاب من الانتظار 🚶‍♂️</button>
              ) : item.status === "متاح" ? (
                <LevelGate>
                  <button onClick={handleRequestItem} disabled={actionLoading} className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:bg-[#004d44] transition-all">احجز هذه القطعة الآن</button>
                </LevelGate>
              ) : (
                <button onClick={handleRequestItem} disabled={actionLoading} className="w-full bg-[#005a8c] text-white py-4 rounded-2xl font-black text-sm shadow-lg hover:bg-[#004a75] transition-all">انضم لقائمة الانتظار 🕒</button>
              )}
              {showChat && (
                <button onClick={() => setChatOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-primary/20 bg-primary/5 text-primary font-black text-sm hover:bg-primary/10 transition-all">
                  <span className="material-symbols-outlined text-base">chat</span>
                  تواصل مع {isDonor ? 'الحاجز' : 'المتبرع'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
