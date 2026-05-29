"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/api/axiosInstance';
import { createDonationRequest } from '@/lib/api/donationRequestApi';

const DEFAULT_CATEGORIES = ['كتب', 'إلكترونيات', 'أثاث', 'ملابس', 'أخرى'];
const DEFAULT_LOCATIONS = ['عمان', 'الزرقاء', 'إربد', 'العقبة', 'السلط', 'مادبا'];

type DonationRequestFormState = {
  title: string;
  description: string;
  category: string;
  location: string;
};

export default function NewDonationRequestPage() {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [settingsCategories, setSettingsCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [settingsLocations, setSettingsLocations] = useState<string[]>(DEFAULT_LOCATIONS);

  const [form, setForm] = useState<DonationRequestFormState>({
    title: '',
    description: '',
    category: '',
    location: '',
  });

  useEffect(() => {
    axiosInstance
      .get('/api/settings')
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

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const isFormInvalid = useMemo(() => {
    return (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.category ||
      !form.location
    );
  }, [form]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isFormInvalid) {
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

      setTimeout(() => {
        router.push('/donation-requests?mine=true');
      }, 700);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.msg ?? 'حدث خطأ أثناء إنشاء الطلب'
        : 'حدث خطأ أثناء إنشاء الطلب';

      setToast({ msg, ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen pb-24 text-[#191c1d]" dir="rtl">
      {toast && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-2xl shadow-lg text-sm font-bold text-white ${
            toast.ok ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-3xl mx-auto space-y-6">
        <div className="space-y-3 text-center">
          <h1 className="text-2xl md:text-3xl font-black">إنشاء طلب جديد</h1>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            اكتب طلبك بشكل واضح ومختصر حتى يسهل على المتبرعين فهم حاجتك والتفاعل معها.
          </p>

          <div className="flex justify-center">
            <Link
              href="/donation-requests"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-200 text-sm font-black text-gray-700 hover:bg-gray-50 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              العودة إلى الطلبات
            </Link>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6 space-y-4"
        >
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-[12px] text-blue-700 font-bold leading-6">
            ملاحظة: النظام قد يفرض حداً أقصى لعدد الطلبات النشطة شهرياً لكل مستخدم، لذلك اكتب طلبك بدقة وتأكد من صحة البيانات قبل النشر.
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-gray-700">عنوان الطلب *</label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              maxLength={120}
              placeholder="مثال: أحتاج لابتوب للدراسة"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
            />
            <p className="text-[11px] text-gray-400 text-left">
              {form.title.length} / 120
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-700">التصنيف *</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
              >
                <option value="">اختر التصنيف</option>
                {settingsCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
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
                {settingsLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-gray-700">الوصف *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={7}
              maxLength={600}
              placeholder="اشرح حاجتك بشكل واضح ومختصر"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-primary resize-none"
            />
            <p className="text-[11px] text-gray-400 text-left">
              {form.description.length} / 600
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || isFormInvalid}
            className="w-full py-3 rounded-2xl bg-primary text-white text-sm font-black hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? 'جارٍ النشر...' : 'نشر الطلب'}
          </button>
        </form>
      </main>
    </div>
  );
}