'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import axiosInstance from '@/lib/api/axiosInstance';
import { extractErrorMsg } from '@/lib/api/extractErrorMsg';
import type { DonationRequest, DonationOffer } from '@/types/donationRequest.types';

export default function DonationRequestDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();

  const [request,       setRequest]       = useState<DonationRequest | null>(null);
  const [offers,        setOffers]        = useState<DonationOffer[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [accepting,     setAccepting]     = useState<string | null>(null); // offerId جاري القبول
  const [confirming,    setConfirming]    = useState(false);
  const [toast,         setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // ── جلب البيانات ─────────────────────────────────────────
  useEffect(() => {
    axiosInstance.get('/api/auth/me')
      .then((r) => setCurrentUserId(r.data?.user?._id ?? r.data?._id ?? null))
      .catch(() => {});
  }, []);

  const fetchRequest = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const r = await axiosInstance.get(`/api/donation-requests/${id}`);
      setRequest(r.data?.request ?? r.data);
    } catch {
      showToast('تعذر تحميل الطلب', false);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchOffers = useCallback(async () => {
    if (!id) return;
    try {
      const r = await axiosInstance.get(`/api/donation-requests/${id}/offers`);
      setOffers(r.data?.offers ?? []);
    } catch {
      // ليس صاحب الطلب — لا يرى العروض، هذا طبيعي
    }
  }, [id]);

  useEffect(() => {
    fetchRequest();
    fetchOffers();
  }, [fetchRequest, fetchOffers]);

  // ── قبول عرض ─────────────────────────────────────────────
  // في handleAcceptOffer — أضف console مؤقت للتشخيص
const handleAcceptOffer = async (offerId: string) => {
  setAccepting(offerId);
  try {
    const r = await axiosInstance.post(
      `/api/donation-requests/${id}/offers/${offerId}/accept`
    );

    // ✅ استخرج الـ ID بشكل آمن — جرّب كل الاحتمالات
    const itemId = r.data?.itemId ?? r.data?.item?._id ?? r.data?.item?.id;

    showToast('🎉 تم اختيار المتبرع بنجاح!', true);
    await fetchRequest();
    setOffers([]);

    if (itemId) {
      router.push(`/items/${itemId}`);
    } else {
      // ✅ fallback: ابقَ في نفس الصفحة إذا ما وصل الـ ID
      showToast('🎉 تم الاختيار! راجع تفاصيل التسليم أدناه', true);
    }
  } catch (err) {
    showToast(extractErrorMsg(err, 'تعذر قبول العرض'), false);
  } finally {
    setAccepting(null);
  }
};

  // ── تأكيد استلام الغرض ───────────────────────────────────
const handleConfirmReceipt = async () => {
  if (!request?.fulfilledByItem?._id) return;
  setConfirming(true);
  try {
    await axiosInstance.put(
      `/api/items/complete/${request.fulfilledByItem._id}`,
      { confirmationType: 'recipient_confirm' }
    );

    // ✅ Optimistic Update أولاً — فوري بدون انتظار
    setRequest((prev) => {
      if (!prev?.fulfilledByItem) return prev;
      return {
        ...prev,
        fulfilledByItem: {
          ...prev.fulfilledByItem,
          recipientConfirmed: true,
        },
      };
    });

    showToast('✅ تم تأكيدك — في انتظار تأكيد المتبرع', true);

    // ✅ fetch بعد 800ms — يعطي الـ DB وقت يكتمل قبل ما نجلب
    setTimeout(async () => {
      await fetchRequest();
    }, 800);

  } catch (err) {
    // ✅ Rollback الـ optimistic update لو فشل
    setRequest((prev) => {
      if (!prev?.fulfilledByItem) return prev;
      return {
        ...prev,
        fulfilledByItem: {
          ...prev.fulfilledByItem,
          recipientConfirmed: false,
        },
      };
    });
    showToast(extractErrorMsg(err, 'تعذر تأكيد الاستلام'), false);
  } finally {
    setConfirming(false);
  }
};

  // ── Guards ────────────────────────────────────────────────
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

  const isOwner       = currentUserId === request.requester._id;
  const respondedItem = request.fulfilledByItem;
  const recipientDone = respondedItem?.recipientConfirmed ?? false;
  const donorDone     = respondedItem?.donorConfirmed     ?? false;
  const fullyDone     = recipientDone && donorDone;

  return (
    <div className="bg-surface min-h-screen pb-24 text-[#191c1d]" dir="rtl">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-2xl shadow-lg text-sm font-bold text-white transition-all ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-2xl mx-auto space-y-5">

        {/* زر الرجوع */}
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
            بواسطة: {request.requester.name} · {new Date(request.createdAt).toLocaleDateString('ar-EG')}
          </p>
        </div>

        {/* ════════════════════════════════════════════════
            CASE A: الطلب نشط + صاحب الطلب يشوف العروض
        ════════════════════════════════════════════════ */}
        {request.status === 'active' && isOwner && (
          <>
            {offers.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center space-y-2">
                <span className="material-symbols-outlined text-4xl text-gray-300 block">hourglass_empty</span>
                <p className="text-gray-400 text-sm font-bold">لا أحد عرض التبرع بعد</p>
                <p className="text-gray-300 text-xs">ستصلك إشعارات فور تقديم أي شخص عرضاً 🔔</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="text-base font-black text-gray-800 px-1">
                  العروض المقدمة ({offers.length})
                </h2>
                {offers.map((offer) => (
                  <OfferCard
                    key={offer._id}
                    offer={offer}
                    onAccept={() => handleAcceptOffer(offer._id)}
                    isAccepting={accepting === offer._id}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════
            CASE B: الطلب نشط + الزائر متبرع (ليس صاحب الطلب)
            — هذا الـ section تتحكم فيه صفحة قائمة الطلبات
              عبر زر "أريد التبرع" — هنا نعرض فقط رسالة
        ════════════════════════════════════════════════ */}
        {request.status === 'active' && !isOwner && (
          <div className="bg-white rounded-3xl border border-primary/20 shadow-sm p-6 text-center space-y-3">
            <span className="material-symbols-outlined text-3xl text-primary block">volunteer_activism</span>
            <p className="text-sm font-bold text-gray-700">هل تريد التبرع بهذا الغرض؟</p>
            <button
              onClick={() => router.push(`/donation-requests/${id}/offer`)}
              className="w-full py-3 rounded-2xl text-sm font-black text-white bg-primary hover:bg-primary/90 transition-all"
            >
              🎁 أريد التبرع
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════════
            CASE C: الطلب fulfilled — مرحلة التسليم
        ════════════════════════════════════════════════ */}
        {respondedItem && (
          <div className="bg-white rounded-3xl border border-primary/20 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">volunteer_activism</span>
              <h2 className="text-base font-black text-gray-900">
                {fullyDone ? 'تم استلام الغرض 🎉' : 'جاهز للتسليم! 🤝'}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow label="المتبرع"    value={respondedItem.donor?.name ?? '—'} />
              <InfoRow label="حالة الغرض" value={respondedItem.condition} />
            </div>

            {!fullyDone && respondedItem.safeHub && (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-1">
                <p className="text-xs font-black text-primary">📍 نقطة التسليم الآمنة</p>
                <p className="text-sm font-bold text-gray-800">
                  {respondedItem.safeHub.name} — {respondedItem.safeHub.city}
                </p>
                {respondedItem.safeHub.address && (
                  <p className="text-xs text-gray-500">{respondedItem.safeHub.address}</p>
                )}
              </div>
            )}

            {/* أزرار التأكيد لصاحب الطلب */}
            {isOwner && (
              <div className="pt-2">
                {!recipientDone ? (
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
                    ) : '✅ تأكيد استلام الغرض'}
                  </button>
                ) : !donorDone ? (
                  <div className="w-full py-3 rounded-2xl text-sm font-black text-center bg-yellow-50 text-yellow-700 border border-yellow-100">
                    ⏳ تم تأكيدك — في انتظار تأكيد المتبرع
                  </div>
                ) : (
                  <div className="w-full py-3 rounded-2xl text-sm font-black text-center bg-green-50 text-green-700 border border-green-100">
                    🎉 تم التسليم بنجاح!
                  </div>
                )}
              </div>
            )}

            {/* زر المحادثة — بعد الاختيار مباشرة (لا تنتظر التسليم) */}
            {respondedItem.donor?._id && !fullyDone && (
              <button
                onClick={() => router.push(`/chat/${respondedItem.donor!._id}`)}
                className="w-full py-2.5 rounded-2xl text-sm font-black text-primary bg-primary/5 hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                محادثة مع المتبرع لتنسيق التسليم
              </button>
            )}

            <button
              onClick={() => {
  if (respondedItem._id) 
    router.push(`/items/${respondedItem._id}?ref=donation-request`);
}}
              className="w-full py-2.5 rounded-2xl text-xs font-black text-primary bg-primary/5 hover:bg-primary/10 transition-all"
            >
              عرض صفحة الغرض كاملة ←
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

// ── مكوّن بطاقة العرض ────────────────────────────────────────
function OfferCard({
  offer,
  onAccept,
  isAccepting,
}: {
  offer:       DonationOffer;
  onAccept:    () => void;
  isAccepting: boolean;
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3">
      {/* معلومات المتبرع */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-base">
          {offer.donor.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-black text-gray-900">{offer.donor.name}</p>
          <p className="text-xs text-gray-400">
            Level {offer.donor.trustLevel} · {offer.donor.trustScore} نقطة
          </p>
        </div>
        <span className="mr-auto text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
          {offer.condition}
        </span>
      </div>

      {/* صورة الغرض إن وجدت */}
      {offer.imageUrl && (
        <div className="relative w-full h-40 rounded-2xl overflow-hidden">
          <Image
            src={offer.imageUrl}
            alt="صورة الغرض"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 640px"
          />
        </div>
      )}

      {/* وصف المتبرع */}
      {offer.description && (
        <p className="text-sm text-gray-600 leading-6">{offer.description}</p>
      )}

      {/* نقطة التسليم */}
      <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
        <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
        {offer.safeHub.name} — {offer.safeHub.city}
      </div>

      {/* زر الاختيار */}
      <button
        onClick={onAccept}
        disabled={isAccepting}
        className="w-full py-3 rounded-2xl text-sm font-black text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {isAccepting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            جاري الاختيار...
          </>
        ) : '✅ اختر هذا المتبرع'}
      </button>
    </div>
  );
}

// ── مكوّنات مساعدة ────────────────────────────────────────────
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