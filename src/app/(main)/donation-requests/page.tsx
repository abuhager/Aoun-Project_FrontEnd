// src/app/(main)/donation-requests/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getDonationRequests,
  cancelDonationRequest,
  respondToDonationRequest,
  getPublicSettings,           // ✅ بدل axiosInstance.get('/api/settings')
} from '@/lib/api/donationRequestApi';
import axiosInstance from '@/lib/api/axiosInstance';
import type { DonationRequest } from '@/types/donationRequest.types';
import { extractErrorMsg } from '@/lib/api/extractErrorMsg';

const DEFAULT_CATEGORIES = ['كتب', 'إلكترونيات', 'أثاث', 'ملابس', 'أخرى'];
const DEFAULT_LOCATIONS  = ['عمان', 'الزرقاء', 'إربد', 'العقبة', 'السلط', 'مادبا'];
const CONDITIONS         = ['جديد', 'مستعمل ممتاز', 'مستعمل جيد'] as const;

function RequestStatusBadge({ status }: { status: DonationRequest['status'] }) {
  const styles = {
    active:    'bg-green-50 text-green-700 border-green-100',
    fulfilled: 'bg-blue-50 text-blue-700 border-blue-100',
    expired:   'bg-orange-50 text-orange-700 border-orange-100',
    cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  } as const;

  const labels = {
    active:    'نشط',
    fulfilled: 'تمت تلبيته',
    expired:   'منتهي',
    cancelled: 'ملغي',
  } as const;

  return (
    <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function DonationRequestsPage() {
  const router = useRouter();

  const [myOnly, setMyOnly] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('mine') === 'true'
      : false
  );

  const [requests,           setRequests]           = useState<DonationRequest[]>([]);
  const [loading,            setLoading]            = useState(true);
  const [cancelingId,        setCancelingId]        = useState<string | null>(null);
  const [toast,              setToast]              = useState<{ msg: string; ok: boolean } | null>(null);
  const [page,               setPage]               = useState(1);
  const [pages,              setPages]              = useState(1);
  const [selectedCategory,   setSelectedCategory]   = useState('');
  const [selectedLocation,   setSelectedLocation]   = useState('');
  const [settingsCategories, setSettingsCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [settingsLocations,  setSettingsLocations]  = useState<string[]>(DEFAULT_LOCATIONS);
  const [respondingTo,       setRespondingTo]       = useState<DonationRequest | null>(null);
  const [hubs,               setHubs]               = useState<{ _id: string; name: string; city: string }[]>([]);
  const [submitting,         setSubmitting]         = useState(false);

  // ✅ respondForm معدّل — أضفنا description و imageFile
  const [respondForm, setRespondForm] = useState<{
    condition:   typeof CONDITIONS[number];
    safeHub:     string;
    description: string;
    imageFile:   File | null;
  }>({
    condition:   'مستعمل جيد',
    safeHub:     '',
    description: '',
    imageFile:   null,
  });

  // ✅ preview URL للصورة المختارة
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const stateRef = useRef({ myOnly, selectedCategory, selectedLocation, page });
  useEffect(() => {
    stateRef.current = { myOnly, selectedCategory, selectedLocation, page };
  });

  const load = useCallback(async (
    targetPage = 1,
    category   = stateRef.current.selectedCategory,
    mine       = stateRef.current.myOnly,
    location   = stateRef.current.selectedLocation,
  ) => {
    setLoading(true);
    try {
      const data = await getDonationRequests({
        page:     targetPage,
        limit:    10,
        category: category || undefined,
        location: location || undefined,
        mine:     mine === true ? true : undefined,
      });
      setRequests(data.requests ?? []);
      setPage(data.page   ?? 1);
      setPages(data.pages ?? 1);
    } catch (err) {
      setToast({ msg: extractErrorMsg(err, 'تعذر تحميل طلبات التبرع'), ok: false });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRespond = async () => {
    if (!respondingTo || !respondForm.safeHub) return;
    setSubmitting(true);
    try {
      const res = await respondToDonationRequest(respondingTo._id, {
        condition:   respondForm.condition,
        safeHub:     respondForm.safeHub,
        description: respondForm.description || undefined,   // ✅ اختياري
        imageFile:   respondForm.imageFile   || undefined,   // ✅ اختياري
      });

      setRespondingTo(null);
      setImagePreview(null);
      setToast({ msg: res.msg ?? 'تم التبرع بنجاح! جارٍ التحويل...', ok: true });

      if (res.item?._id) {
        setTimeout(() => router.push(`/items/${res.item._id}`), 1200);
      } else {
        load(1);
      }
    } catch (err) {
      setToast({ msg: extractErrorMsg(err, 'تعذر الاستجابة للطلب'), ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async (id: string) => {
    if (cancelingId) return;
    setCancelingId(id);
    try {
      const res = await cancelDonationRequest(id);
      setToast({ msg: res.msg ?? 'تم إلغاء الطلب بنجاح', ok: true });
      load(stateRef.current.page);
    } catch (err) {
      setToast({ msg: extractErrorMsg(err, 'تعذر إلغاء الطلب'), ok: false });
    } finally {
      setCancelingId(null);
    }
  };

  useEffect(() => {
    load(1, selectedCategory, myOnly, selectedLocation);
  }, [load, selectedCategory, myOnly, selectedLocation]);

  useEffect(() => {
    // ✅ إصلاح المشكلة الرئيسية — بدل '/api/settings' اللي يطلب Admin
    //    نستخدم getPublicSettings() → GET /api/settings/public (بدون auth)
    getPublicSettings()
      .then((s) => {
        if (s.categories?.length) setSettingsCategories(s.categories);
        if (s.locations?.length)  setSettingsLocations(s.locations);
      })
      .catch(() => {
        // ✅ عند الفشل نبقى على الـ defaults — لا نوقف الصفحة
      });

    axiosInstance.get('/api/hubs').then((r) => {
      if (Array.isArray(r.data)) setHubs(r.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // ✅ تنظيف الـ object URL عند إغلاق الـ Modal أو تغيير الصورة
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const activeMineCount = useMemo(
    () => requests.filter((r) => r.status === 'active').length,
    [requests]
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setRespondForm((prev) => ({ ...prev, imageFile: file }));
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const resetRespondForm = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setRespondForm({ condition: 'مستعمل جيد', safeHub: '', description: '', imageFile: null });
  };

  return (
    <div className="bg-surface min-h-screen pb-24 text-[#191c1d]" dir="rtl">
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-2xl shadow-lg text-sm font-bold text-white transition-all ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">طلبات التبرع</h1>
            <p className="text-xs text-gray-500 font-bold mt-1">
              {myOnly
                ? `لديك ${activeMineCount} طلب نشط`
                : 'تصفح الطلبات وساهم بتبرع'}
            </p>
          </div>
          <Link
            href="/donation-requests/new"
            className="px-5 py-2.5 bg-primary text-white rounded-2xl text-xs font-black hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            اطلب تبرعاً
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setMyOnly(false)}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              !myOnly ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            كل الطلبات
          </button>
          <button
            onClick={() => setMyOnly(true)}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              myOnly ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            طلباتي فقط
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-gray-200 text-xs font-black bg-white focus:outline-none focus:border-primary"
          >
            <option value="">كل التصنيفات</option>
            {settingsCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-gray-200 text-xs font-black bg-white focus:outline-none focus:border-primary"
          >
            <option value="">كل المناطق</option>
            {settingsLocations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <section className="space-y-4 max-w-4xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-300 block mb-2">inbox</span>
              <p className="text-gray-400 text-sm font-bold">
                {myOnly ? 'لا توجد طلبات بعد — اضغط "اطلب تبرعاً"' : 'لا توجد طلبات حالياً'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <article key={request._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-gray-900 text-sm">{request.title}</h3>
                        <RequestStatusBadge status={request.status} />
                        <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                          {request.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-bold">
                        بواسطة: {request.requester?.name ?? 'مستخدم'}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 leading-7">{request.description}</p>

                  <div className="pt-2 border-t border-gray-50 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex gap-2">
                      {myOnly && request.fulfilledByItem && request.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => router.push(`/donation-requests/${request._id}`)}
                          className="px-4 py-2 rounded-2xl text-xs font-black transition-all bg-green-50 text-green-700 hover:bg-green-100 flex items-center gap-1 animate-pulse"
                        >
                          <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                          شخص استجاب! اضغط هنا 🎁
                        </button>
                      )}
                      {myOnly && !request.fulfilledByItem && (
                        <button
                          type="button"
                          onClick={() => router.push(`/donation-requests/${request._id}`)}
                          className="px-4 py-2 rounded-2xl text-xs font-black transition-all bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          عرض التفاصيل
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {!myOnly && request.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => {
                            resetRespondForm();
                            setRespondingTo(request);
                          }}
                          className="px-4 py-2 rounded-2xl text-xs font-black transition-all bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
                          سأتبرع بهذا 🎁
                        </button>
                      )}
                      {myOnly && request.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => cancel(request._id)}
                          disabled={cancelingId === request._id}
                          className="px-4 py-2 rounded-2xl text-xs font-black transition-all bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >
                          {cancelingId === request._id ? 'جاري الإلغاء...' : 'إلغاء الطلب'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => load(page - 1)}
                disabled={page <= 1 || loading}
                className="px-4 py-2 rounded-2xl text-xs font-black bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40"
              >
                السابق
              </button>
              <span className="px-4 py-2 text-xs font-black text-gray-500">
                {page} / {pages}
              </span>
              <button
                onClick={() => load(page + 1)}
                disabled={page >= pages || loading}
                className="px-4 py-2 rounded-2xl text-xs font-black bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          )}
        </section>
      </main>

      {/* ✅ Modal الاستجابة — معدّل بإضافة حقل الوصف والصورة */}
      {respondingTo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => !submitting && (resetRespondForm(), setRespondingTo(null))}
        >
          <div
            className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-gray-900">
                  الاستجابة لطلب: {respondingTo.title}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  سيُنشأ غرض ويُحجز تلقائياً لصاحب الطلب.
                  توجّها معاً للنقطة الآمنة لإتمام التسليم.
                </p>
              </div>
              <button
                onClick={() => { resetRespondForm(); setRespondingTo(null); }}
                disabled={submitting}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* حالة الغرض */}
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1">حالة الغرض</label>
              <select
                value={respondForm.condition}
                onChange={(e) => setRespondForm({ ...respondForm, condition: e.target.value as typeof CONDITIONS[number] })}
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* ✅ وصف اختياري */}
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1">
                وصف الغرض
                <span className="text-gray-400 font-normal mr-1">(اختياري)</span>
              </label>
              <textarea
                value={respondForm.description}
                onChange={(e) => setRespondForm({ ...respondForm, description: e.target.value })}
                placeholder="مثلاً: كتاب رياضيات صف عاشر، حالة ممتازة، لم يُستخدم كثيراً..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-primary resize-none"
              />
              <p className="text-[10px] text-gray-400 text-left mt-1">
                {respondForm.description.length}/500
              </p>
            </div>

            {/* ✅ صورة اختيارية */}
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1">
                صورة الغرض
                <span className="text-gray-400 font-normal mr-1">(اختيارية)</span>
              </label>
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all relative overflow-hidden">
                {imagePreview ? (
                  // ✅ Preview للصورة المختارة
                  <>
                    <img
                      src={imagePreview}
                      alt="معاينة الصورة"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-2xl">
                      <span className="text-white text-xs font-black">تغيير الصورة</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-400">
                    <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                    <span className="text-xs font-bold">اضغط لإضافة صورة</span>
                    <span className="text-[10px]">JPG, PNG, WebP — بحد أقصى 5MB</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              {/* ✅ زر إزالة الصورة */}
              {respondForm.imageFile && (
                <button
                  type="button"
                  onClick={() => { if (imagePreview) URL.revokeObjectURL(imagePreview); setImagePreview(null); setRespondForm((prev) => ({ ...prev, imageFile: null })); }}
                  className="mt-1 text-[10px] text-red-500 font-bold hover:text-red-700 transition-colors"
                >
                  ✕ إزالة الصورة
                </button>
              )}
            </div>

            {/* نقطة التسليم */}
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1">نقطة التسليم الآمنة</label>
              {hubs.length === 0 ? (
                <div className="w-full px-4 py-2.5 rounded-2xl border border-orange-200 bg-orange-50 text-xs text-orange-600 font-bold">
                  ⚠️ لا توجد نقاط تسليم متاحة — تواصل مع الإدارة
                </div>
              ) : (
                <select
                  value={respondForm.safeHub}
                  onChange={(e) => setRespondForm({ ...respondForm, safeHub: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">اختر نقطة...</option>
                  {hubs.map((h) => (
                    <option key={h._id} value={h._id}>{h.name} — {h.city}</option>
                  ))}
                </select>
              )}
            </div>

            {respondForm.safeHub && (
              <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 text-xs text-primary font-bold">
                ✅ بعد التأكيد ستُوجَّه لصفحة الغرض مباشرة لمتابعة عملية التسليم
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleRespond}
                disabled={submitting || !respondForm.safeHub}
                className="flex-1 py-2.5 rounded-2xl text-sm font-black text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  'تأكيد التبرع 🎁'
                )}
              </button>
              <button
                type="button"
                onClick={() => { resetRespondForm(); setRespondingTo(null); }}
                disabled={submitting}
                className="px-5 py-2.5 rounded-2xl text-sm font-black text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}