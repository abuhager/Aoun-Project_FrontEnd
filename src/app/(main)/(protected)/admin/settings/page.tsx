// src/app/(main)/(protected)/admin/settings/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminSettings, updateAdminSettings } from "@/lib/api/settingsApi";
import type { UpdateSettingsPayload } from "@/types/settings.types";
import { useToast }                          from "@/hooks/useToast";

// ─── Interface ─────────────────────────────────────────────────────────────────
// ✅ مطابقة كاملة لـ SystemSettings Schema في الـ Backend
interface SystemSettings {
  defaultQuota:                  number;
  level2Quota:                   number;
  maxBookingsPerUser:            number;
  maxActiveRequestsPerMonth:     number;
  requestExpiryDays:             number;
  maxActiveDonationsPerUser:     number;
  maxActiveDonationsLevel2Plus:  number;
  categories:                    string[];
  reportReasons:                 string[];
  autoReportBanThreshold:        number;
  universityEmailDomains:        string[];
  requireHubForBooking:          boolean;
  maintenanceMode:               boolean;
  platformName:                  string;
  contactEmail:                  string;
  quotaResetDayOfMonth:          number;
  // ✅ FIX-SP-01: الحقلان الجديدان المضافان في validateBody
  donorQuotaReward:              number;
  bookingExpiryHours:            number;
  trustScorePerDonation:         number;
  trustScorePerRequest:          number;
}

// ✅ FIX-SP-01: الحقول المسموح بإرسالها للـ Backend — مطابقة 1:1 مع validateBody
const EDITABLE_FIELDS: (keyof SystemSettings)[] = [
  'defaultQuota', 'level2Quota', 'maxBookingsPerUser',
  'maxActiveRequestsPerMonth', 'requestExpiryDays',
  'maxActiveDonationsPerUser', 'maxActiveDonationsLevel2Plus',
  'donorQuotaReward', 'bookingExpiryHours',
  'trustScorePerDonation', 'trustScorePerRequest',
  'categories', 'reportReasons', 'autoReportBanThreshold',
  'universityEmailDomains', 'requireHubForBooking',
  'maintenanceMode', 'platformName', 'contactEmail',
  'quotaResetDayOfMonth',
];

// ─── TagListEditor ──────────────────────────────────────────────────────────
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

  const remove = (item: string) => onChange(items.filter((i) => i !== item));

  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-gray-700">{label}</label>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm
                     focus:outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={add}
          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black
                     hover:bg-primary/90 transition-colors"
        >
          إضافة
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs
                       font-bold px-3 py-1 rounded-full"
          >
            {item}
            <button
              type="button"
              onClick={() => remove(item)}
              aria-label={`حذف ${item}`}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-xs text-gray-400 italic">لا يوجد عناصر</span>
        )}
      </div>
    </div>
  );
}

// ─── NumberField ────────────────────────────────────────────────────────────
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
  const [local, setLocal] = useState(String(value));

  useEffect(() => { setLocal(String(value)); }, [value]);

  const commit = (raw: string) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n)) {
      const clamped = Math.min(max, Math.max(min, n));
      onChange(clamped);
      setLocal(String(clamped));
    } else {
      setLocal(String(value));
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-black text-gray-700">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={e => commit(e.target.value)}
        onKeyDown={e => e.key === "Enter" && commit((e.target as HTMLInputElement).value)}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm
                   focus:outline-none focus:border-primary"
      />
      {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
    </div>
  );
}

// ─── Toggle ─────────────────────────────────────────────────────────────────
function Toggle({
  checked, onChange, activeColor = "bg-primary",
}: {
  checked:      boolean;
  onChange:     () => void;
  activeColor?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors
                  ${checked ? activeColor : "bg-gray-200"}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow
                    transition-all ${checked ? "right-0.5" : "left-0.5"}`}
      />
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [dirty,    setDirty]    = useState(false);

  const { show: showToast, ToastComponent } = useToast();

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminSettings();
      setSettings(data);
      setDirty(false);
    } catch {
      showToast("تعذر تحميل الإعدادات الحالية", false);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const update = <K extends keyof SystemSettings>(key: K, val: SystemSettings[K]) => {
    setSettings(p => p ? { ...p, [key]: val } : p);
    setDirty(true);
  };

  const save = async () => {
    if (!settings || !dirty) return;
    setSaving(true);
    try {
      const payload: UpdateSettingsPayload = Object.fromEntries(
        EDITABLE_FIELDS
          .filter((k) => settings[k] !== undefined)
          .map((k) => [k, settings[k]])
      ) as UpdateSettingsPayload;

      await updateAdminSettings(payload);
      showToast("✅ تم حفظ الإعدادات بنجاح", true);
      setDirty(false);
    } catch (err: unknown) {
      const msg = (() => {
        if (
          err &&
          typeof err === "object" &&
          "response" in err &&
          (err as { response?: { data?: { msg?: string } } }).response?.data?.msg
        ) {
          return (err as { response: { data: { msg: string } } }).response.data.msg;
        }
        return "حدث خطأ أثناء حفظ الإعدادات";
      })();
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
    return (
      <div className="text-center py-20 text-gray-400 font-bold text-sm">
        تعذر تحميل الإعدادات
      </div>
    );
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
          <span className="text-xs text-orange-500 font-bold bg-orange-50 border
                           border-orange-200 px-3 py-1 rounded-full animate-pulse">
            ● تغييرات غير محفوظة
          </span>
        )}
      </div>

      {/* ── قسم: إعدادات عامة ─────────────────────────────────────────────── */}
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
          <Toggle
            checked={settings.maintenanceMode}
            onChange={() => update("maintenanceMode", !settings.maintenanceMode)}
            activeColor="bg-red-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-700">اسم المنصة</label>
            <input
              value={settings.platformName || ""}
              onChange={e => update("platformName", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm
                         focus:outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-700">بريد التواصل والدعم</label>
            <input
              type="email"
              value={settings.contactEmail || ""}
              onChange={e => update("contactEmail", e.target.value)}
              placeholder="info@aoun.com"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm
                         focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div>
            <p className="text-sm font-bold text-gray-800">إلزامية نقاط الاستلام (Safe Hubs)</p>
            <p className="text-xs text-gray-400">إجبار المستخدمين على التبادل عبر نقاط المركز حصراً</p>
          </div>
          <Toggle
            checked={settings.requireHubForBooking}
            onChange={() => update("requireHubForBooking", !settings.requireHubForBooking)}
          />
        </div>
      </section>

      {/* ── قسم: الحصص ────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-blue-500">inventory_2</span>
          حصص الحجز وتجديد الكوتا شهرياً
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <NumberField
            label="كوتا مستوى 1" value={settings.defaultQuota}
            onChange={v => update("defaultQuota", v)} min={1} max={20}
            hint="بريد موثق فقط"
          />
          <NumberField
            label="كوتا مستوى 2" value={settings.level2Quota}
            onChange={v => update("level2Quota", v)} min={1} max={20}
            hint="جامعي أو هاتف"
          />
          <NumberField
            label="مكافأة المتبرع" value={settings.donorQuotaReward}
            onChange={v => update("donorQuotaReward", v)} min={0} max={5}
            hint="كوتا إضافية بعد التسليم"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-50">
          <NumberField
            label="حد التبرعات النشطة (مستوى 1)" value={settings.maxActiveDonationsPerUser}
            onChange={v => update("maxActiveDonationsPerUser", v)} min={1} max={20}
            hint="أقصى تبرعات مفتوحة بالتوازي"
          />
          <NumberField
            label="حد التبرعات النشطة (مستوى 2+)" value={settings.maxActiveDonationsLevel2Plus}
            onChange={v => update("maxActiveDonationsLevel2Plus", v)} min={1} max={20}
            hint="للمستخدمين الموثقين"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-50">
          <NumberField
            label="يوم تصفير الكوتا التلقائي" value={settings.quotaResetDayOfMonth}
            onChange={v => update("quotaResetDayOfMonth", v)} min={1} max={28}
            hint="يوم تفعيل مهمة الـ Cron شهرياً"
          />
          <NumberField
            label="أقصى حجوزات نشطة معلقة" value={settings.maxBookingsPerUser}
            onChange={v => update("maxBookingsPerUser", v)} min={1} max={10}
            hint="للمستخدم في نفس الوقت"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-50">
          <NumberField
            label="انتهاء الحجز (ساعة)" value={settings.bookingExpiryHours}
            onChange={v => update("bookingExpiryHours", v)} min={1} max={336}
            hint="بعدها يُلغى الحجز تلقائياً"
          />
        </div>
      </section>

      {/* ── قسم: طلبات التبرع ─────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-green-500">volunteer_activism</span>
          طلبات التبرع والنطاقات التعليمية
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <NumberField
            label="الحد الشهري لكل مستخدم" value={settings.maxActiveRequestsPerMonth}
            onChange={v => update("maxActiveRequestsPerMonth", v)} min={1} max={5}
            hint="عدد الطلبات النشطة"
          />
          <NumberField
            label="مدة انتهاء الطلب (يوم)" value={settings.requestExpiryDays}
            onChange={v => update("requestExpiryDays", v)} min={7} max={90}
            hint="تلقائياً من تاريخ النشر"
          />
        </div>
        <TagListEditor
          label="النطاقات البريدية الجامعية المعتمدة"
          items={settings.universityEmailDomains}
          onChange={v => update("universityEmailDomains", v)}
          placeholder="مثال: @ju.edu.jo"
        />
      </section>

      {/* ── قسم: نقاط الثقة ────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-yellow-500">star</span>
          نقاط الثقة
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <NumberField
            label="نقاط الثقة لكل تبرع" value={settings.trustScorePerDonation}
            onChange={v => update("trustScorePerDonation", v)} min={0} max={20}
            hint="تُضاف بعد التسليم المؤكد"
          />
          <NumberField
            label="نقاط الثقة لكل طلب" value={settings.trustScorePerRequest}
            onChange={v => update("trustScorePerRequest", v)} min={0} max={10}
            hint="تُضاف عند إتمام الطلب"
          />
        </div>
      </section>

      {/* ── قسم: البلاغات ────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-red-500">flag</span>
          إعدادات البلاغات والحظر التلقائي
        </h2>
        <NumberField
          label="عتبة الحظر التلقائي" value={settings.autoReportBanThreshold}
          onChange={v => update("autoReportBanThreshold", v)} min={3} max={20}
          hint="عدد البلاغات المعتمدة قبل الحظر التلقائي"
        />
        <TagListEditor
          label="أسباب البلاغات" items={settings.reportReasons}
          onChange={v => update("reportReasons", v)}
          placeholder="مثال: لم يُسلّم الغرض"
        />
      </section>

      {/* ── قسم: التصنيفات ────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-purple-500">category</span>
          تصنيفات الأغراض
        </h2>
        <TagListEditor
          label="التصنيفات المتاحة" items={settings.categories}
          onChange={v => update("categories", v)}
          placeholder="مثال: كتب وروايات"
        />
      </section>

      {/* ZER AL-HIFTH */}
      <div className="pb-8">
        <button
          onClick={save}
          disabled={saving || !dirty}
          className="w-full py-3 bg-primary text-white font-black rounded-2xl text-sm
                     hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <span className="material-symbols-outlined text-sm animate-spin">
                progress_activity
              </span>
              جارٍ الحفظ...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">save</span>
              حفظ الإعدادات الحالية للمنصة
            </>
          )}
        </button>
      </div>
    </div>
  );
}