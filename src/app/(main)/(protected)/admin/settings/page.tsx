// src/app/(main)/(protected)/admin/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axiosInstance";
import { useToast } from "@/hooks/useToast";

// ✅ تحديث الواجهة لتشمل كافة الحقول الـ 15 المطابقة للـ Backend
interface SystemSettings {
  defaultQuota:              number;
  level2Quota:               number;
  maxBookingsPerUser:        number; // 🧠 مضاف
  maxActiveRequestsPerMonth: number;
  requestExpiryDays:         number;
  categories:                string[];
  reportReasons:             string[];
  autoReportBanThreshold:    number;
  universityEmailDomains:    string[]; // 🧠 مضاف
  requireHubForBooking:      boolean;  // 🧠 مضاف
  maintenanceMode:           boolean;
  platformName:              string;
  contactEmail:              string;   // 🧠 مضاف
  quotaResetDayOfMonth:      number;   // 🧠 مضاف
}

// ── مكون إضافة/حذف قائمة الحقول النصية (Tags) ───────────────────
function TagListEditor({
  label, items = [], onChange, placeholder,
}: {
  label:       string;
  items:       string[];
  onChange:    (val: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const v = input.trim();
    if (!v || items.includes(v)) return;
    onChange([...items, v]);
    setInput("");
  };

  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-gray-700">{label}</label>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={add}
          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black hover:bg-primary/90 transition-colors"
        >
          إضافة
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <span key={idx} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
            {item}
            <button type="button" onClick={() => remove(idx)} className="text-gray-400 hover:text-red-500 transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </span>
        ))}
        {items.length === 0 && <span className="text-xs text-gray-400 italic">لا يوجد عناصر</span>}
      </div>
    </div>
  );
}

// ── مكون حقل رقمي ذكي يمنع إرسال قيم الصفر العشوائية أثناء مسح الكتابة ──────
function NumberField({
  label, value, onChange, min = 0, max = 100, hint,
}: {
  label:    string;
  value:    number;
  onChange: (v: number) => void;
  min?:     number;
  max?:     number;
  hint?:    string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-black text-gray-700">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        value={value || ""} // منع بقاء الصفر عند مسح الرقم بالكامل
        onChange={e => {
          const val = e.target.value === "" ? min : Number(e.target.value);
          onChange(val);
        }}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
      />
      {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [dirty,    setDirty]    = useState(false);

  const { show: showToast, ToastComponent } = useToast();

  useEffect(() => {
    axiosInstance.get("/api/settings")
      .then(r => { 
        // دمج البيانات المستلمة لضمان عدم سقوط أي حقل افتراضي من السيرفر
        setSettings(r.data); 
        setDirty(false); 
      })
      .catch(() => showToast("تعذر تحميل الإعدادات الحالية", false))
      .finally(() => setLoading(false));
  }, [showToast]);

  const update = <K extends keyof SystemSettings>(key: K, val: SystemSettings[K]) => {
    setSettings(p => p ? { ...p, [key]: val } : p);
    setDirty(true);
  };

  const save = async () => {
    if (!settings || !dirty) return;
    setSaving(true);
    
    try {
      // 1. حصر الحقول المسموح بتعديلها فقط والمطابقة تماماً للـ Backend
      const editableFields = [
        'defaultQuota', 'level2Quota', 'maxBookingsPerUser',
        'maxActiveRequestsPerMonth', 'requestExpiryDays', 'categories',
        'reportReasons', 'autoReportBanThreshold', 'universityEmailDomains',
        'requireHubForBooking', 'maintenanceMode', 'platformName',
        'contactEmail', 'quotaResetDayOfMonth'
      ];

      // 2. تصفية كائن الـ settings الحالي واستبعاد حقول قاعدة البيانات مثل _id و __v
      const cleanedPayload = Object.fromEntries(
        Object.entries(settings).filter(([key]) => editableFields.includes(key))
      );

      // 3. إرسال الحقول الصافية والنظيفة فقط للسيرفر
      await axiosInstance.patch("/api/settings", cleanedPayload);
      
      showToast("✅ تم حفظ الإعدادات بنجاح للمنصة وتحديث الكاش", true);
      setDirty(false);
    } catch (err) {
      let msg = "حدث خطأ أثناء حفظ الإعدادات";
      if (err && typeof err === "object" && "isAxiosError" in err) {
        const axiosError = err as { response?: { data?: { msg?: string } } };
        msg = axiosError.response?.data?.msg || msg;
      }
      showToast(msg, false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return <div className="text-center py-20 text-gray-400 font-bold text-sm">تعذر تحميل الإعدادات</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl" dir="rtl">
      {ToastComponent}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">settings</span>
          إعدادات المنصة
        </h1>
        {dirty && (
          <span className="text-xs text-orange-500 font-bold bg-orange-50 border border-orange-200 px-3 py-1 rounded-full animate-pulse">
            ● تغييرات غير محفوظة
          </span>
        )}
      </div>

      {/* إعدادات عامة */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-gray-500">build</span>
          إعدادات عامة للمنصة
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-800">وضع الصيانة</p>
            <p className="text-xs text-gray-400">يمنع المستخدمين من الدخول للمنصة حالياً</p>
          </div>
          <button
            type="button"
            onClick={() => update("maintenanceMode", !settings.maintenanceMode)}
            className={`relative w-12 h-6 rounded-full transition-colors ${settings.maintenanceMode ? "bg-red-500" : "bg-gray-200"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${settings.maintenanceMode ? "right-0.5" : "left-0.5"}`} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-700">اسم المنصة</label>
            <input
              value={settings.platformName || ""}
              onChange={e => update("platformName", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-700">بريد التواصل والدعم</label>
            <input
              type="email"
              value={settings.contactEmail || ""}
              onChange={e => update("contactEmail", e.target.value)}
              placeholder="info@aoun.com"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* حماية الـ Safe Hub الإجباري */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div>
            <p className="text-sm font-bold text-gray-800">إلزامية نقاط الاستلام (Safe Hubs)</p>
            <p className="text-xs text-gray-400">إجبار المستخدمين على التبادل عبر نقاط المركز حصراً</p>
          </div>
          <button
            type="button"
            onClick={() => update("requireHubForBooking", !settings.requireHubForBooking)}
            className={`relative w-12 h-6 rounded-full transition-colors ${settings.requireHubForBooking ? "bg-primary" : "bg-gray-200"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${settings.requireHubForBooking ? "right-0.5" : "left-0.5"}`} />
          </button>
        </div>
      </section>

      {/* حصص الحجز */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-blue-500">inventory_2</span>
          حصص الحجز وتجديد الكوتا شهرياً
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <NumberField
            label="كوتا مستوى 1" value={settings.defaultQuota}
            onChange={v => update("defaultQuota", v)} min={1} max={10} hint="بريد موثق فقط"
          />
          <NumberField
            label="كوتا مستوى 2" value={settings.level2Quota}
            onChange={v => update("level2Quota", v)} min={1} max={15} hint="جامعي أو هاتف"
          />
          
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-50">
          <NumberField
            label="يوم تصفير الكوتا التلقائي" value={settings.quotaResetDayOfMonth}
            onChange={v => update("quotaResetDayOfMonth", v)} min={1} max={28} hint="يوم تفعيل مهمة الـ Cron شهرياً"
          />
          <NumberField
            label="أقصى حجوزات نشطة معلقة" value={settings.maxBookingsPerUser}
            onChange={v => update("maxBookingsPerUser", v)} min={1} max={10} hint="للمستخدم في نفس الوقت"
          />
        </div>
      </section>

      {/* طلبات التبرع */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-green-500">volunteer_activism</span>
          طلبات التبرع والنطاقات التعليمية
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <NumberField
            label="الحد الشهري لكل مستخدم" value={settings.maxActiveRequestsPerMonth}
            onChange={v => update("maxActiveRequestsPerMonth", v)} min={1} max={5} hint="عدد الطلبات النشطة"
          />
          <NumberField
            label="مدة انتهاء الطلب (يوم)" value={settings.requestExpiryDays}
            onChange={v => update("requestExpiryDays", v)} min={7} max={90} hint="تلقائياً من تاريخ النشر"
          />
        </div>
        <TagListEditor
          label="النطاقات البريدية الجامعية المعتمدة للتكامل المباشر (Email Domains)"
          items={settings.universityEmailDomains}
          onChange={v => update("universityEmailDomains", v)}
          placeholder="مثال: edu.jo"
        />
      </section>

      {/* البلاغات */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-red-500">flag</span>
          إعدادات البلاغات والحظر التلقائي
        </h2>
        <NumberField
          label="عتبة الحظر التلقائي (عدد البلاغات المعتمدة)" value={settings.autoReportBanThreshold}
          onChange={v => update("autoReportBanThreshold", v)} min={3} max={20} hint="عند تجاوز هذا العدد يُحظر المستخدم تلقائياً"
        />
        <TagListEditor
          label="أسباب البلاغات" items={settings.reportReasons}
          onChange={v => update("reportReasons", v)} placeholder="مثال: لم يُسلّم الغرض"
        />
      </section>

      {/* التصنيفات */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-purple-500">category</span>
          تصنيفات الأغراض
        </h2>
        <TagListEditor
          label="التصنيفات المتاحة" items={settings.categories}
          onChange={v => update("categories", v)} placeholder="مثال: كتب وروايات"
        />
      </section>

      <div className="pb-8">
        <button
          onClick={save}
          disabled={saving || !dirty}
          className="w-full py-3 bg-primary text-white font-black rounded-2xl text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {saving ? (
            <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> جارٍ الحفظ...</>
          ) : (
            <><span className="material-symbols-outlined text-sm">save</span> حفظ الإعدادات الحالية للمنصة</>
          )}
        </button>
      </div>
    </div>
  );
}