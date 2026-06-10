// src/app/(main)/donation-requests/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  getDonationRequests,
  cancelDonationRequest,
} from '@/lib/api/donationRequestApi';
import axiosInstance from '@/lib/api/axiosInstance';                // ✅ مباشر — settingsService محذوف
import type { DonationRequest } from '@/types/donationRequest.types';
import { extractErrorMsg } from '@/lib/api/extractErrorMsg';        // ✅ الملف الجديد

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
  const [requests,         setRequests]         = useState<DonationRequest[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [cancelingId,      setCancelingId]      = useState<string | null>(null);
  const [toast,            setToast]            = useState<{ msg: string; ok: boolean } | null>(null);
  const [page,             setPage]             = useState(1);
  const [pages,            setPages]            = useState(1);
  const [myOnly,           setMyOnly]           = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [settingsCategories, setSettingsCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [settingsLocations,  setSettingsLocations]  = useState<string[]>(DEFAULT_LOCATIONS);

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
          page:     targetPage,
          limit:    10,
          category: category  || undefined,
          location: location  || undefined,
          mine:     mine      || undefined,
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

  // ── قراءة ?mine=true من URL ───────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mine = new URLSearchParams(window.location.search).get('mine');
    setMyOnly(mine === 'true');
  }, []);

  // ── جلب التصنيفات والمناطق من إعدادات السيرفر ────────────────────────────
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
        // تخصيص رسالة 401/403 ثم تمريرها لـ extractErrorMsg
        const e = err as { response?: { status?: number } };
        const is401or403 =
          e?.response?.status === 401 || e?.response?.status === 403;
        const fallback = is401or403
          ? '🔒 لا تمتلك صلاحية الوصول للتصنيفات الحية'
          : 'فشل جلب التصنيفات من السيرفر';
        setToast({ msg: extractErrorMsg(err, fallback), ok: false });
      });
  }, []);

  // ── إعادة تحميل عند تغيير الفلاتر ───────────────────────────────────────
  useEffect(() => {
    load(1, selectedCategory, myOnly, selectedLocation);
  }, [load, selectedCategory, myOnly, selectedLocation]);

  // ── إخفاء Toast تلقائياً ─────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const activeMineCount = useMemo(
    () => requests.filter((r) => r.status === 'active').length,
    [requests]
  );

  // ── الواجهة ───────────────────────────────────────────────────────────────
  return (
    <div className="bg-surface min-h-screen pb-24 text-[#191c1d]" dir="rtl">
      {toast && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-6 py-3
            rounded-2xl shadow-lg text-sm font-bold text-white
            ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}
        >
          {toast.msg}
        </div>
      )}

      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-6xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl md:text-3xl font-black">طلبات التبرع</h1>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            يمكن للمستخدم المحتاج نشر طلب واضح لغرض معيّن.
          </p>
          <div className="flex justify-center">
            <Link
              href="/donation-requests/new"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl
                bg-primary text-white text-sm font-black hover:bg-primary/90 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              إنشاء طلب جديد
            </Link>
          </div>
        </div>

        <section className="space-y-4 max-w-4xl mx-auto">
          {/* ── Filters Bar ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4
            flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'كل الطلبات', value: false },
                { label: 'طلباتي',     value: true  },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => { setMyOnly(value); setPage(1); }}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all
                    ${myOnly === value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                className="px-4 py-2 rounded-2xl border border-gray-200 text-xs font-bold
                  focus:outline-none focus:border-primary"
              >
                <option value="">كل التصنيفات</option>
                {settingsCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                value={selectedLocation}
                onChange={(e) => { setSelectedLocation(e.target.value); setPage(1); }}
                className="px-4 py-2 rounded-2xl border border-gray-200 text-xs font-bold
                  focus:outline-none focus:border-primary"
              >
                <option value="">كل المناطق</option>
                {settingsLocations.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>

              {myOnly && (
                <span className="text-xs font-black text-orange-600 bg-orange-50
                  px-3 py-2 rounded-2xl border border-orange-100">
                  النشطة: {activeMineCount}
                </span>
              )}
            </div>
          </div>

          {/* ── Content ── */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent
                rounded-full animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm
              p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-300 block mb-2">
                inbox
              </span>
              <p className="text-gray-400 text-sm font-bold">لا توجد طلبات حالياً</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <article
                  key={request._id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-gray-900 text-sm">
                          {request.title}
                        </h3>
                        <RequestStatusBadge status={request.status} />
                        <span className="text-[11px] font-black px-2.5 py-1
                          rounded-full bg-gray-100 text-gray-600">
                          {request.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-bold">
                        بواسطة: {request.requester?.name ?? 'مستخدم'}
                      </p>
                    </div>
                    <span className="text-[11px] text-gray-400 font-bold">
                      {new Date(request.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 leading-7">{request.description}</p>

                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[11px] bg-blue-50 text-blue-700 border
                      border-blue-100 rounded-full px-3 py-1 font-black">
                      📍 {request.location}
                    </span>
                    <span className="text-[11px] bg-gray-50 text-gray-500 border
                      border-gray-100 rounded-full px-3 py-1 font-bold">
                      ينتهي: {new Date(request.expiresAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>

                  {myOnly && request.status === 'active' && (
                    <div className="pt-2 border-t border-gray-50 flex justify-end">
                      <button
                        type="button"
                        onClick={() => cancel(request._id)}
                        disabled={cancelingId === request._id}
                        className={`px-4 py-2 rounded-2xl text-xs font-black transition-all
                          ${cancelingId === request._id
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                      >
                        {cancelingId === request._id ? 'جاري الإلغاء...' : 'إلغاء الطلب'}
                      </button>
                    </div>
                  )}
                </article>
              ))}

              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => load(page - 1)}
                    disabled={page <= 1}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-gray-100
                      text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                  >
                    السابق
                  </button>
                  <span className="text-xs text-gray-500 font-bold">{page} / {pages}</span>
                  <button
                    type="button"
                    onClick={() => load(page + 1)}
                    disabled={page >= pages}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-gray-100
                      text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                  >
                    التالي
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}