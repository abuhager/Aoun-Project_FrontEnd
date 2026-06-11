// src/app/(main)/donation-requests/new/page.tsx
// [FIX-2] /api/settings/public بدل /api/settings — صمت تام عند خطأ
// [FIX-4] جلب quota عند mount + تحذير + تعطيل زر النشر عند remaining=0
"use client";
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/api/axiosInstance';
import { createDonationRequest, getMyDonationRequests } from '@/lib/api/donationRequestApi';

const DEFAULT_CATEGORIES = ['كتب','إلكترونيات','أثاث','ملابس','أخرى'];
const DEFAULT_LOCATIONS  = ['عمان','الزرقاء','إربد','العقبة','السلط','مادبا'];

export default function NewDonationRequestPage() {
  const router = useRouter();
  const [submitting,   setSubmitting]   = useState(false);
  const [toast,        setToast]        = useState<{msg:string;ok:boolean}|null>(null);
  const [categories,   setCategories]   = useState(DEFAULT_CATEGORIES);
  const [locations,    setLocations]    = useState(DEFAULT_LOCATIONS);
  const [quota,        setQuota]        = useState<{used:number;max:number;remaining:number}|null>(null);
  const [quotaLoading, setQuotaLoading] = useState(true);
  const [form, setForm] = useState({ title:'', description:'', category:'', location:'' });

  // [FIX-2] جلب التصنيفات من endpoint العام
  useEffect(() => {
    axiosInstance.get('/api/settings')
      .then((r) => {
        if (Array.isArray(r.data?.categories) && r.data.categories.length) setCategories(r.data.categories);
        if (Array.isArray(r.data?.locations)  && r.data.locations.length)  setLocations(r.data.locations);
      })
      .catch(() => console.warn('[Settings] fallback إلى القيم الافتراضية'));
  }, []);

  // [FIX-4] جلب quota
  useEffect(() => {
    getMyDonationRequests()
      .then((d) => setQuota(d.quota ?? null))
      .catch(() => {})
      .finally(() => setQuotaLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const isFormInvalid   = useMemo(() => !form.title.trim() || !form.description.trim() || !form.category || !form.location, [form]);
  const isQuotaExceeded = quota !== null && quota.remaining === 0;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isFormInvalid)   { setToast({ msg:'يرجى تعبئة جميع الحقول', ok:false }); return; }
    if (isQuotaExceeded) { setToast({ msg:`وصلت الحد الأقصى (${quota!.max} طلبات)`, ok:false }); return; }
    setSubmitting(true);
    try {
      const res = await createDonationRequest({ title:form.title.trim(), description:form.description.trim(), category:form.category, location:form.location });
      setToast({ msg: res.msg ?? 'تم نشر الطلب بنجاح', ok:true });
      setTimeout(() => router.push('/donation-requests?mine=true'), 700);
    } catch (err: unknown) {
      const msg = (err as {response?:{data?:{msg?:string}}})?.response?.data?.msg ?? 'حدث خطأ';
      setToast({ msg, ok:false });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="bg-surface min-h-screen pb-24 text-[#191c1d]" dir="rtl">
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-2xl shadow-lg text-sm font-bold text-white ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}
      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-3xl mx-auto space-y-6">
        <div className="space-y-3 text-center">
          <h1 className="text-2xl md:text-3xl font-black">إنشاء طلب جديد</h1>
          <div className="flex justify-center">
            <Link href="/donation-requests" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-200 text-sm font-black text-gray-700 hover:bg-gray-50 transition-all">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              العودة إلى الطلبات
            </Link>
          </div>
        </div>

        {/* [FIX-4] شريط quota */}
        {!quotaLoading && quota !== null && (
          <div className={`rounded-2xl px-4 py-3 text-[12px] font-bold leading-6 border ${isQuotaExceeded ? 'bg-red-50 border-red-100 text-red-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
            {isQuotaExceeded
              ? `🚫 وصلت الحد الأقصى (${quota.max} طلبات). الشهر القادم يمكنك النشر مجدداً.`
              : `📊 الطلبات الشهرية: ${quota.used} / ${quota.max} — متبقي ${quota.remaining}`}
          </div>
        )}

        <form onSubmit={submit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-700">عنوان الطلب *</label>
            <input value={form.title} onChange={(e)=>setForm(p=>({...p,title:e.target.value}))} maxLength={120} placeholder="مثال: أحتاج لابتوب للدراسة" className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-primary" />
            <p className="text-[11px] text-gray-400 text-left">{form.title.length} / 120</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-700">التصنيف *</label>
              <select value={form.category} onChange={(e)=>setForm(p=>({...p,category:e.target.value}))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-primary">
                <option value="">اختر التصنيف</option>
                {categories.map((c)=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-700">المنطقة *</label>
              <select value={form.location} onChange={(e)=>setForm(p=>({...p,location:e.target.value}))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-primary">
                <option value="">اختر المنطقة</option>
                {locations.map((l)=><option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-700">الوصف *</label>
            <textarea value={form.description} onChange={(e)=>setForm(p=>({...p,description:e.target.value}))} rows={7} maxLength={600} placeholder="اشرح حاجتك بوضوح" className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-primary resize-none" />
            <p className="text-[11px] text-gray-400 text-left">{form.description.length} / 600</p>
          </div>
          {/* [FIX-4] زر معطّل عند تجاوز الحد */}
          <button type="submit" disabled={submitting || isFormInvalid || isQuotaExceeded}
            className="w-full py-3 rounded-2xl bg-primary text-white text-sm font-black hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {submitting ? 'جارٍ النشر...' : isQuotaExceeded ? '🚫 وصلت الحد الأقصى' : 'نشر الطلب'}
          </button>
        </form>
      </main>
    </div>
  );
}
