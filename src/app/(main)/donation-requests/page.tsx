// src/app/(main)/donation-requests/page.tsx
"use client";

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import axiosInstance from '@/lib/api/axiosInstance';
import {
  getDonationRequests,
  createDonationRequest,
  cancelDonationRequest,
} from '@/lib/api/donationRequestApi';
import type { DonationRequest } from '@/types/donationRequest.types';

const DEFAULT_CATEGORIES = ['كتب', 'إلكترونيات', 'أثاث', 'ملابس', 'أخرى'];
const DEFAULT_LOCATIONS = ['عمان', 'الزرقاء', 'إربد', 'العقبة', 'السلط', 'مادبا'];

function RequestStatusBadge({ status }: { status: DonationRequest['status'] }) {
  const styles = {
    active: 'bg-green-50 text-green-700 border-green-100',
    fulfilled: 'bg-blue-50 text-blue-700 border-blue-100',
    expired: 'bg-orange-50 text-orange-700 border-orange-100',
    cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  } as const;

  const labels = {
    active: 'نشط',
    fulfilled: 'تمت تلبيته',
    expired: 'منتهي',
    cancelled: 'ملغي',
  } as const;

  return (
    <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function DonationRequestsPage() {
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [myOnly, setMyOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [settingsCategories, setSettingsCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [settingsLocations, setSettingsLocations] = useState<string[]>(DEFAULT_LOCATIONS);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
  });

  useEffect(() => {
    axiosInstance.get('/api/settings')
      .then((r) => {
        if (Array.isArray(r.data?.categories) && r.data.categories.length > 0) {
          setSettingsCategories(r.data.categories);
        }
        if (Array.isArray(r.data?.locations) && r.data.locations.length > 0) {
          setSettingsLocations(r.data.locations);
        }
      })
      .catch(() => {});
  }, []);

  const load = async (targetPage = 1, category = selectedCategory, mine = myOnly) => {
    setLoading(true);
    try {
      const data = await getDonationRequests({
        page: targetPage,
        category: category || undefined,
        mine: mine || undefined,
      });
      setRequests(data.requests ?? []);
      setPage(data.page ?? 1);
      setPages(data.pages ?? 1);
    } catch {
      setToast({ msg: 'تعذر تحميل طلبات التبرع', ok: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, selectedCategory, myOnly);
  }, [selectedCategory, myOnly]);

  const activeMineCount = useMemo(
    () => requests.filter((r) => r.status === 'active').length,
    [requests],
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.category || !form.location) {
      setToast({ msg: 'يرجى تعبئة جميع الحقول المطلوبة', ok: false });
      return;
    }

    setSubmitting(true);
    try {
      const res = await createDonationRequest({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        location: form.location,
      });
      setToast({ msg: res.msg ?? 'تم نشر الطلب بنجاح', ok: true });
      setForm({ title: '', description: '', category: '', location: '' });
      setMyOnly(true);
      await load(1, selectedCategory, true);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.msg ?? 'حدث خطأ أثناء إنشاء الطلب'
        : 'حدث خطأ أثناء إنشاء الطلب';
      setToast({ msg, ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async (id: string) => {
    try {
      const res = await cancelDonationRequest(id);
      setToast({ msg: res.msg ?? 'تم إلغاء الطلب', ok: true });
      await load(page, selectedCategory, myOnly);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.msg ?? 'تعذر إلغاء الطلب'
        : 'تعذر إلغاء الطلب';
      setToast({ msg, ok: false });
    }
  };

  return (
    <div className="bg-surface min-h-screen pb-24 text-[#191c1d]" dir="rtl">
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-2xl shadow-lg text-sm font-bold text-white ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-black">طلبات التبرع</h1>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            يمكن للمستخدم المحتاج نشر طلب واضح لغرض معيّن، مع التزام حد شهري يحدده النظام.
          </p>
        </div>

        <section className="grid lg:grid-cols-[1.1fr_1.9fr] gap-6">
          <form onSubmit={submit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4 h-fit">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit_square</span>
              <h2 className="font-black text-gray-900">إنشاء طلب جديد</h2>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-[12px] text-blue-700 font-bold">
              ملاحظة: النظام قد يفرض حداً أقصى لعدد الطلبات النشطة شهرياً لكل مستخدم.
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-gray-700">عنوان الطلب *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="مثال: أحتاج لابتوب للدراسة"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-gray-700">التصنيف *</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
              >
                <option value="">اختر التصنيف</option>
                {settingsCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-gray-700">المنطقة / المدينة *</label>
              <select
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
              >
                <option value="">اختر المنطقة</option>
                {settingsLocations.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-gray-700">الوصف *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={5}
                placeholder="اشرح حاجتك بشكل واضح ومختصر"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-primary text-white text-sm font-black hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              {submitting ? 'جارٍ النشر...' : 'نشر الطلب'}
            </button>
          </form>

          <section className="space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setMyOnly(false)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${!myOnly ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}
                >
                  كل الطلبات
                </button>
                <button
                  onClick={() => setMyOnly(true)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${myOnly ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}
                >
                  طلباتي
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-3 md:items-center">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 rounded-2xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-primary"
                >
                  <option value="">كل التصنيفات</option>
                  {settingsCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {myOnly && (
                  <span className="text-xs font-black text-orange-600 bg-orange-50 px-3 py-2 rounded-2xl border border-orange-100">
                    الطلبات النشطة المعروضة: {activeMineCount}
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
                <span className="material-symbols-outlined text-5xl text-gray-300 block mb-2">inventory_2</span>
                <p className="text-gray-400 text-sm font-bold">لا توجد طلبات حالياً</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <article key={request._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-gray-900 text-sm md:text-base">{request.title}</h3>
                          <RequestStatusBadge status={request.status} />
                          <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                            {request.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-bold">بواسطة: {request.requester?.name ?? 'مستخدم'}</p>
                      </div>
                      <span className="text-[11px] text-gray-400 font-bold">
                        {new Date(request.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 leading-7">{request.description}</p>

                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 font-black">
                        📍 {request.location}
                      </span>
                      <span className="text-[11px] bg-gray-50 text-gray-500 border border-gray-100 rounded-full px-3 py-1 font-bold">
                        ينتهي: {new Date(request.expiresAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>

                    {myOnly && request.status === 'active' && (
                      <div className="pt-2 border-t border-gray-50 flex justify-end">
                        <button
                          onClick={() => cancel(request._id)}
                          className="px-4 py-2 rounded-2xl text-xs font-black bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                        >
                          إلغاء الطلب
                        </button>
                      </div>
                    )}
                  </article>
                ))}

                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => load(page - 1)}
                      disabled={page <= 1}
                      className="px-4 py-2 rounded-xl text-xs font-black bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                    >
                      السابق
                    </button>
                    <span className="text-xs text-gray-500 font-bold">{page} / {pages}</span>
                    <button
                      onClick={() => load(page + 1)}
                      disabled={page >= pages}
                      className="px-4 py-2 rounded-xl text-xs font-black bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                    >
                      التالي
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
