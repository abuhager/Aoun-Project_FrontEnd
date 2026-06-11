'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/api/axiosInstance';
import { extractErrorMsg } from '@/lib/api/extractErrorMsg';

interface RequestDetail {
  _id:         string;
  title:       string;
  description: string;
  category:    string;
  location:    string;
  urgency:     string;
  status:      'active' | 'fulfilled' | 'expired' | 'cancelled';
  requester: {
    _id:  string;
    name: string;
  };
  fulfilledByItem?: {
    _id:       string;
    condition: string;
    status:    string;
    safeHub: {
      name:    string;
      city:    string;
      address: string;
    };
    donor: {
      _id:  string;
      name: string;
    };
  } | null;
  expiresAt:  string;
  createdAt:  string;
}

export default function DonationRequestDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();

  const [request,    setRequest]    = useState<RequestDetail | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [toast,      setToast]      = useState<{ msg: string; ok: boolean } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // جلب المستخدم الحالي
  useEffect(() => {
    axiosInstance.get('/api/auth/me')
      .then((r) => setCurrentUserId(r.data?.user?._id ?? r.data?._id ?? null))
      .catch(() => {});
  }, []);

  // جلب تفاصيل الطلب
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axiosInstance.get(`/api/donation-requests/${id}`)
      .then((r) => setRequest(r.data?.request ?? r.data))
      .catch(() => setToast({ msg: 'تعذر تحميل الطلب', ok: false }))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // ✅ صاحب الطلب يضغط "تأكيد الاستلام" — الخطوة 1 من التأكيد المزدوج
  const handleConfirmReceipt = async () => {
    if (!request?.fulfilledByItem?._id) return;
    setConfirming(true);
    try {
        // في handleConfirmReceipt  
    await axiosInstance.post(
        `/api/items/${request.fulfilledByItem._id}/confirm-receipt`,
       { confirmationType: 'recipient_confirm' }  // ← أضف هذا
    );      setToast({ msg: '✅ تم تأكيد استلامك — في انتظار تأكيد المتبرع', ok: true });
      // أعد تحميل الطلب
      const r = await axiosInstance.get(`/api/donation-requests/${id}`);
      setRequest(r.data?.request ?? r.data);
    } catch (err) {
      setToast({ msg: extractErrorMsg(err, 'تعذر تأكيد الاستلام'), ok: false });
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!request) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 font-bold">
      الطلب غير موجود
    </div>
  );

  const isOwner     = currentUserId === request.requester._id;
  const respondedItem = request.fulfilledByItem;
  const itemStatus    = respondedItem?.status ?? '';

  return (
    <div className="bg-surface min-h-screen pb-24 text-[#191c1d]" dir="rtl">

      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-2xl shadow-lg text-sm font-bold text-white transition-all ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-2xl mx-auto space-y-5">

        {/* رجوع */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-xs font-black text-gray-500 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          رجوع
        </button>

        {/* بطاقة الطلب */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h1 className="text-lg font-black text-gray-900">{request.title}</h1>
            <StatusBadge status={request.status} />
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{request.category}</span>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">📍 {request.location}</span>
            <span className={`px-3 py-1 rounded-full ${
              request.urgency === 'high'   ? 'bg-red-50 text-red-600' :
              request.urgency === 'medium' ? 'bg-yellow-50 text-yellow-700' :
              'bg-green-50 text-green-700'
            }`}>
              {request.urgency === 'high' ? '🔴 عاجل' : request.urgency === 'medium' ? '🟡 متوسط' : '🟢 عادي'}
            </span>
          </div>

          {request.description && (
            <p className="text-sm text-gray-600 leading-7">{request.description}</p>
          )}

          <p className="text-xs text-gray-400 font-bold">
            بواسطة: {request.requester.name} ·{' '}
            {new Date(request.createdAt).toLocaleDateString('ar-EG')}
          </p>
        </div>

        {/* ✅ قسم الاستجابة — يظهر فقط لو في غرض مرتبط */}
        {respondedItem ? (
          <div className="bg-white rounded-3xl border border-primary/20 shadow-sm p-6 space-y-4">

            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">volunteer_activism</span>
              <h2 className="text-base font-black text-gray-900">شخص استجاب لطلبك! 🎁</h2>
            </div>

            {/* معلومات المتبرع والغرض */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow label="المتبرع"   value={respondedItem.donor?.name ?? '—'} />
              <InfoRow label="حالة الغرض" value={respondedItem.condition} />
            </div>

            {/* نقطة التسليم */}
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-1">
              <p className="text-xs font-black text-primary">📍 نقطة التسليم الآمنة</p>
              <p className="text-sm font-bold text-gray-800">
                {respondedItem.safeHub?.name} — {respondedItem.safeHub?.city}
              </p>
              {respondedItem.safeHub?.address && (
                <p className="text-xs text-gray-500">{respondedItem.safeHub.address}</p>
              )}
            </div>

            {/* ✅ زر تأكيد الاستلام — لصاحب الطلب فقط */}
            {isOwner && (
              <div className="pt-2">
                {itemStatus === 'محجوز' ? (
                  <button
                    onClick={handleConfirmReceipt}
                    disabled={confirming}
                    className="w-full py-3 rounded-2xl text-sm font-black text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {confirming ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        جاري التأكيد...
                      </>
                    ) : (
                      '✅ تأكيد استلام الغرض'
                    )}
                  </button>
                ) : itemStatus === 'في انتظار تأكيد المتبرع' ? (
                  <div className="w-full py-3 rounded-2xl text-sm font-black text-center bg-yellow-50 text-yellow-700 border border-yellow-100">
                    ⏳ تم تأكيدك — في انتظار تأكيد المتبرع
                  </div>
                ) : itemStatus === 'مُسلَّم' ? (
                  <div className="w-full py-3 rounded-2xl text-sm font-black text-center bg-green-50 text-green-700 border border-green-100">
                    🎉 تم التسليم بنجاح!
                  </div>
                ) : null}
              </div>
            )}

            {/* رابط لصفحة الغرض للمزيد من التفاصيل */}
            <button
              onClick={() => router.push(`/items/${respondedItem._id}`)}
              className="w-full py-2.5 rounded-2xl text-xs font-black text-primary bg-primary/5 hover:bg-primary/10 transition-all"
            >
              عرض صفحة الغرض كاملة ←
            </button>

          </div>
        ) : request.status === 'active' ? (
          // لا أحد استجاب بعد
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center space-y-2">
            <span className="material-symbols-outlined text-4xl text-gray-300 block">hourglass_empty</span>
            <p className="text-gray-400 text-sm font-bold">لا أحد استجاب لطلبك بعد</p>
            <p className="text-gray-300 text-xs">ستصلك إشعارات فور استجابة أحدهم 🔔</p>
          </div>
        ) : null}

      </main>
    </div>
  );
}

// ── مكونات مساعدة ──────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:    'bg-green-50 text-green-700 border-green-100',
    fulfilled: 'bg-blue-50 text-blue-700 border-blue-100',
    expired:   'bg-orange-50 text-orange-700 border-orange-100',
    cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  const labels: Record<string, string> = {
    active:    'نشط',
    fulfilled: 'تمت تلبيته',
    expired:   'منتهي',
    cancelled: 'ملغي',
  };
  return (
    <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${map[status] ?? ''}`}>
      {labels[status] ?? status}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-3">
      <p className="text-[10px] font-black text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  );
}