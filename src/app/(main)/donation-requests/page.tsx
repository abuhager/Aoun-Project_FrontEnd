"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  getDonationRequests,
  cancelDonationRequest,
  respondToDonationRequest, // تم استيراد الدالة المطلوبة
} from '@/lib/api/donationRequestApi';
import axiosInstance from '@/lib/api/axiosInstance';
import type { DonationRequest } from '@/types/donationRequest.types';
import { extractErrorMsg } from '@/lib/api/extractErrorMsg';

const DEFAULT_CATEGORIES = ['كتب', 'إلكترونيات', 'أثاث', 'ملابس', 'أخرى'];
const DEFAULT_LOCATIONS  = ['عمان', 'الزرقاء', 'إربد', 'العقبة', 'السلط', 'مادبا'];

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
  const [requests,           setRequests]           = useState<DonationRequest[]>([]);
  const [loading,            setLoading]            = useState(true);
  const [cancelingId,        setCancelingId]        = useState<string | null>(null);
  const [toast,              setToast]              = useState<{ msg: string; ok: boolean } | null>(null);
  const [page,               setPage]               = useState(1);
  const [pages,              setPages]              = useState(1);
  const [myOnly,             setMyOnly]             = useState(false);
  const [selectedCategory,   setSelectedCategory]   = useState('');
  const [selectedLocation,   setSelectedLocation]   = useState('');
  const [settingsCategories, setSettingsCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [settingsLocations,  setSettingsLocations]  = useState<string[]>(DEFAULT_LOCATIONS);

  // 1. حالة الـ Modal والبيانات الجديدة
  const [respondingTo, setRespondingTo] = useState<DonationRequest | null>(null);
  const [respondForm, setRespondForm]   = useState({ condition: 'مستعمل جيد', safeHub: '' });
  const [hubs,        setHubs]          = useState<{ _id: string; name: string; city: string }[]>([]);
  const [submitting,  setSubmitting]    = useState(false);

  // ── دالة الاستجابة 3 ──
  const handleRespond = async () => {
    if (!respondingTo || !respondForm.safeHub) return;
    setSubmitting(true);
    try {
      const res = await respondToDonationRequest(respondingTo._id, {
        condition: respondForm.condition as 'جديد' | 'مستعمل ممتاز' | 'مستعمل جيد',
        safeHub:   respondForm.safeHub,
      });
      setToast({ msg: res.msg, ok: true });
      setRespondingTo(null);
    } catch (err) {
      setToast({ msg: extractErrorMsg(err, 'تعذر الاستجابة للطلب'), ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  // ── جلب الطلبات ──────────────────────────────────────────────────────────────
  const load = useCallback(
    async (
      targetPage = 1,
      category   = selectedCategory,
      mine       = myOnly,
      location   = selectedLocation
    ) => {
      setLoading(true);
      try {
        const data = await getDonationRequests({
          page:    targetPage,
          limit:    10,
          category: category || undefined,
          location: location || undefined,
          mine:    mine === true ? true : undefined,
        });
        setRequests(data.requests ?? []);
        setPage(data.page  ?? 1);
        setPages(data.pages ?? 1);
      } catch (err) {
        setToast({ msg: extractErrorMsg(err, 'تعذر تحميل طلبات التبرع'), ok: false });
      } finally {
        setLoading(false);
      }
    },
    [myOnly, selectedCategory, selectedLocation]
  );

  // ── إلغاء طلب ────────────────────────────────────────────────────────────────
  const cancel = async (id: string) => {
    if (cancelingId) return;
    setCancelingId(id);
    try {
      const res = await cancelDonationRequest(id);
      setToast({ msg: res.msg ?? 'تم إلغاء الطلب بنجاح', ok: true });
      await load(page, selectedCategory, myOnly, selectedLocation);
    } catch (err) {
      setToast({ msg: extractErrorMsg(err, 'تعذر إلغاء الطلب'), ok: false });
    } finally {
      setCancelingId(null);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mine = new URLSearchParams(window.location.search).get('mine');
    setMyOnly(mine === 'true');
  }, []);

  // ── جلب التصنيفات والمناطق والـ Hubs ──────────────────────────────────────────
  useEffect(() => {
    axiosInstance
      .get('/api/settings')
      .then((r) => {
        if (Array.isArray(r.data?.categories) && r.data.categories.length > 0)
          setSettingsCategories(r.data.categories);
        if (Array.isArray(r.data?.locations) && r.data.locations.length > 0)
          setSettingsLocations(r.data.locations);
      })
      .catch((err) => {
        setToast({ msg: extractErrorMsg(err, 'فشل جلب الإعدادات'), ok: false });
      });

    // 2. جلب الـ Hubs
    axiosInstance.get('/api/hubs').then((r) => {  
      if (Array.isArray(r.data?.hubs)) setHubs(r.data.hubs);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    load(1, selectedCategory, myOnly, selectedLocation);
  }, [load, selectedCategory, myOnly, selectedLocation]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const activeMineCount = useMemo(
    () => requests.filter((r) => r.status === 'active').length,
    [requests]
  );

  return (
    <div className="bg-surface min-h-screen pb-24 text-[#191c1d]" dir="rtl">
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-2xl shadow-lg text-sm font-bold text-white ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-6xl mx-auto space-y-6">
        {/* Header... (تم اختصار الكود هنا للحفاظ على التنسيق) */}
        
        <section className="space-y-4 max-w-4xl mx-auto">
          {/* Filters Bar... */}

          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-300 block mb-2">inbox</span>
              <p className="text-gray-400 text-sm font-bold">لا توجد طلبات حالياً</p>
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
                        <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{request.category}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-bold">بواسطة: {request.requester?.name ?? 'مستخدم'}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 leading-7">{request.description}</p>

                  {/* 4. زر الاستجابة */}
                  <div className="pt-2 border-t border-gray-50 flex justify-end gap-2">
                    {!myOnly && request.status === 'active' && (
                      <button
                        type="button"
                        onClick={() => setRespondingTo(request)}
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
                        className="px-4 py-2 rounded-2xl text-xs font-black transition-all bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        إلغاء الطلب
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 5. Modal الاستجابة */}
      {respondingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setRespondingTo(null)}>
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-black text-gray-900">الاستجابة لطلب: {respondingTo.title}</h2>
            <p className="text-xs text-gray-500">سيُنشأ غرض ويُحجز تلقائياً لصاحب الطلب. توجّها معاً للنقطة الآمنة لإتمام التسليم.</p>
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1">حالة الغرض</label>
              <select value={respondForm.condition} onChange={(e) => setRespondForm({ ...respondForm, condition: e.target.value })} className="w-full px-4 py-2 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-primary">
                {['جديد', 'مستعمل ممتاز', 'مستعمل جيد'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1">نقطة التسليم الآمنة</label>
              <select value={respondForm.safeHub} onChange={(e) => setRespondForm({ ...respondForm, safeHub: e.target.value })} className="w-full px-4 py-2 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-primary">
                <option value="">اختر نقطة...</option>
                {hubs.map((h) => <option key={h._id} value={h._id}>{h.name} — {h.city}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleRespond} disabled={submitting || !respondForm.safeHub} className="flex-1 py-2.5 rounded-2xl text-sm font-black text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all">
                {submitting ? 'جاري الإرسال...' : 'تأكيد التبرع 🎁'}
              </button>
              <button type="button" onClick={() => setRespondingTo(null)} className="px-5 py-2.5 rounded-2xl text-sm font-black text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}