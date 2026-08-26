"use client";
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDonationRequest, getMyDonationRequests } from '@/lib/api/donationRequestApi';
import { extractErrorMsg } from '@/lib/api/extractErrorMsg';
import { useSettings } from '@/hooks/useSettings';
import PageIntro from '@/components/ui/PageIntro';

const DEFAULT_CATEGORIES = ['كتب', 'إلكترونيات', 'أثاث', 'ملابس', 'أخرى'];
const DEFAULT_LOCATIONS  = ['عمان', 'الزرقاء', 'إربد', 'العقبة', 'السلط', 'مادبا'];

export default function NewDonationRequestPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const categories = settings?.categories?.length ? settings.categories : DEFAULT_CATEGORIES;
  const locations = settings?.locations?.length ? settings.locations : DEFAULT_LOCATIONS;
  const [submitting,   setSubmitting]   = useState(false);
  const [toast,        setToast]        = useState<{ msg: string; ok: boolean } | null>(null);
  const [quota,        setQuota]        = useState<{ used: number; max: number; remaining: number } | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
  });

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
    if (isFormInvalid)   { setToast({ msg: 'يرجى تعبئة جميع الحقول', ok: false }); return; }
    if (isQuotaExceeded) { setToast({ msg: `وصلت الحد الأقصى (${quota!.max} طلبات)`, ok: false }); return; }
    setSubmitting(true);
    try {
      const res = await createDonationRequest({ 
        title: form.title.trim(), 
        description: form.description.trim(), 
        category: form.category, 
        location: form.location,
        urgency: form.urgency,
      });
      setToast({ msg: res.msg ?? 'تم نشر الطلب بنجاح', ok: true });
      // ✅ التوجيه إلى صفحة قائمة طلبات التبرع
      setTimeout(() => router.push('/donation-requests'), 700);
    } catch (err: unknown) {
      setToast({ msg: extractErrorMsg(err, 'تعذر نشر الطلب'), ok: false });
    } finally { 
      setSubmitting(false); 
    }
  };

  return (
    <div className="page-shell pb-24 pt-20" dir="rtl">
      {toast && (
        <div
          role={toast.ok ? "status" : "alert"}
          aria-live={toast.ok ? "polite" : "assertive"}
          aria-atomic="true"
          className={`fixed left-1/2 top-20 z-[60] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl px-6 py-3 text-center text-sm font-bold text-white shadow-lg ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}
        >
          {toast.msg}
        </div>
      )}
      <div className="site-container max-w-4xl space-y-6 md:pt-4">
        <PageIntro
          eyebrow="طلب مساعدة عينية"
          title="أنشئ طلبًا واضحًا ومحترمًا"
          description="صف الاحتياج نفسه دون نشر معلومات شخصية. التصنيف والمنطقة ودرجة الاستعجال تساعد المتبرعين المناسبين على الوصول إليك."
          icon="post_add"
          tone="warm"
          actions={
            <Link href="/donation-requests" className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-black text-white hover:bg-white/16">
              <span className="material-symbols-outlined ml-1 text-[17px]">arrow_forward</span>
              العودة إلى الطلبات
            </Link>
          }
          meta={
            <>
              <span className="data-chip">حتى 100 حرف للعنوان</span>
              <span className="data-chip">حتى 500 حرف للوصف</span>
              <span className="data-chip">
                <span className="material-symbols-outlined text-[15px]">privacy_tip</span>
                لا تكتب رقم هاتف أو عنوانًا دقيقًا
              </span>
            </>
          }
        />

        {/* [FIX-4] شريط quota */}
        {!quotaLoading && quota !== null && (
          <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-xs font-bold leading-6 ${isQuotaExceeded ? 'border-red-100 bg-red-50 text-red-700' : 'border-blue-100 bg-blue-50 text-blue-700'}`}>
            <span className="material-symbols-outlined mt-0.5 text-[18px]">
              {isQuotaExceeded ? "block" : "data_usage"}
            </span>
            <span>
              {isQuotaExceeded
                ? `وصلت الحد الأقصى (${quota.max} طلبات). يمكنك النشر مجددًا الشهر القادم.`
                : `الطلبات الشهرية: ${quota.used} من ${quota.max} — متبقي ${quota.remaining}`}
            </span>
          </div>
        )}

        <form onSubmit={submit} className="content-panel space-y-5 p-5 sm:p-7 md:p-8">
          <div className="space-y-2">
            <label htmlFor="request-title" className="text-xs font-black text-on-surface-variant">عنوان الطلب</label>
            <input 
              id="request-title"
              required
              value={form.title} 
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} 
              maxLength={100}
              placeholder="مثال: أحتاج لابتوب للدراسة" 
              className="field-control px-4 py-3 text-sm font-bold"
            />
            <p dir="ltr" className="text-left text-[11px] text-on-surface-soft">{form.title.length} / 100</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="request-category" className="text-xs font-black text-on-surface-variant">التصنيف</label>
              <select 
                id="request-category"
                required
                value={form.category} 
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} 
                className="field-control px-4 py-3 text-sm font-bold"
              >
                <option value="">اختر التصنيف</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="request-location" className="text-xs font-black text-on-surface-variant">المنطقة</label>
              <select 
                id="request-location"
                required
                value={form.location} 
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} 
                className="field-control px-4 py-3 text-sm font-bold"
              >
                <option value="">اختر المنطقة</option>
                {locations.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="request-urgency" className="text-xs font-black text-on-surface-variant">درجة الاستعجال</label>
            <select
              id="request-urgency"
              value={form.urgency}
              onChange={(e) => setForm((p) => ({
                ...p,
                urgency: e.target.value as 'low' | 'medium' | 'high',
              }))}
              className="field-control px-4 py-3 text-sm font-bold"
            >
              <option value="low">عادي</option>
              <option value="medium">متوسط</option>
              <option value="high">عاجل</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="request-description" className="text-xs font-black text-on-surface-variant">الوصف</label>
            <textarea 
              id="request-description"
              required
              value={form.description} 
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} 
              rows={7} 
              maxLength={500}
              placeholder="اشرح حاجتك بوضوح" 
              className="field-control resize-none px-4 py-3 text-sm font-bold"
            />
            <p dir="ltr" className="text-left text-[11px] text-on-surface-soft">{form.description.length} / 500</p>
          </div>
          {/* [FIX-4] زر معطّل عند تجاوز الحد */}
          <button 
            type="submit" 
            disabled={submitting || isFormInvalid || isQuotaExceeded}
            className="btn-primary w-full py-3.5 text-sm"
          >
            {submitting ? 'جارٍ النشر...' : isQuotaExceeded ? 'وصلت الحد الأقصى' : 'نشر الطلب'}
          </button>
        </form>
      </div>
    </div>
  );
}
