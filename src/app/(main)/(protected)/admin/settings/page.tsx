"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminSettings, updateAdminSettings } from "@/lib/api/settingsApi";
import type { SystemSettings, UpdateSettingsPayload } from "@/types/settings.types";
import { useToast } from "@/hooks/useToast";

// ─── Interface ───────────────────────────────────────────────────────────────

const EDITABLE_FIELDS: (keyof SystemSettings)[] = [
  "defaultUserQuota",         
  "studentQuota",             
  "studentDefaultTrustLevel", 
  "level2Quota",
  "maxBookingsPerUser",
  "maxActiveRequestsPerMonth",
  "requestExpiryDays",
  "maxActiveDonationsPerUser",
  "maxActiveDonationsLevel2Plus",
  "donorQuotaReward",
  "bookingExpiryHours",
  "trustScorePerDonation",
  "trustScorePerRequest",
  "ratingThresholdExcellent",
  "ratingThresholdGood",
  "ratingThresholdNeutral",
  "ratingThresholdBad",
  "adminPageSize",
  "adminReportsPageSize",
  "minTrustLevelForRequests",
  "minTrustLevelForDonating",
  "maxPendingOffersPerDonor",
  "categories",
  "reportReasons",
  "autoReportBanThreshold",
  "universityEmailDomains",
  "requireHubForBooking",
  "maintenanceMode",
  "platformName",
  "contactEmail",
  "quotaResetDayOfMonth",
];

// ─── UI Helpers ──────────────────────────────────────────────────────────────
function SectionCard({
  icon,
  title,
  subtitle,
  iconTone = "bg-[#eef6f5] text-primary",
  children,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  iconTone?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[30px] border border-[#e8e2d9] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="border-b border-[#f2ede6] bg-[#fcfaf7] px-5 py-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconTone}`}
          >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
          <div>
            <h2 className="text-sm font-black text-[#223433]">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-xs leading-6 text-[#8c857d]">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-[28px] border border-[#e8e2d9] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>

      <div className="mt-7">
        <p className="text-2xl font-black leading-none tracking-tight text-[#1f312f]">
          {value}
        </p>
        <p className="mt-2 text-sm font-bold text-[#7a746d]">{label}</p>
      </div>
    </div>
  );
}

function FieldShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#eee8e0] bg-[#fcfaf7] p-4 transition-all duration-300 hover:border-primary/15 hover:bg-white ${className}`}
    >
      {children}
    </div>
  );
}

// ─── TagListEditor ───────────────────────────────────────────────────────────
function TagListEditor({
  label,
  items = [],
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (val: string[]) => void;
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
    <div className="space-y-3">
      <label className="text-xs font-black text-[#5f5953]">{label}</label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 rounded-2xl border border-[#e7e1d8] bg-white px-4 py-3 text-sm text-[#24302f] outline-none transition-all duration-300 placeholder:text-[#b3aba1] focus:border-primary focus:shadow-[0_0_0_4px_rgba(1,105,111,0.08)]"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-2xl bg-primary px-5 py-3 text-xs font-black text-white transition-all duration-300 hover:bg-primary/90"
        >
          إضافة
        </button>
      </div>

      <div className="flex min-h-[44px] flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#ebe5dc] bg-[#f5f1eb] px-3 py-1.5 text-xs font-bold text-[#605a54]"
          >
            {item}
            <button
              type="button"
              onClick={() => remove(item)}
              aria-label={`حذف ${item}`}
              className="text-[#aaa298] transition-colors hover:text-red-500"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-xs italic text-[#b3aba1]">لا يوجد عناصر</span>
        )}
      </div>
    </div>
  );
}

// ─── NumberField ─────────────────────────────────────────────────────────────
function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  hint?: string;
}) {
  const [local, setLocal] = useState(String(value));

  useEffect(() => {
    setLocal(String(value));
  }, [value]);

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
    <FieldShell>
      <div className="space-y-2">
        <label className="text-xs font-black text-[#5f5953]">{label}</label>
        <input
          type="number"
          min={min}
          max={max}
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && commit((e.target as HTMLInputElement).value)
          }
          className="w-full rounded-2xl border border-[#e7e1d8] bg-white px-4 py-3 text-sm text-[#24302f] outline-none transition-all duration-300 focus:border-primary focus:shadow-[0_0_0_4px_rgba(1,105,111,0.08)]"
        />
        {hint && <p className="text-[11px] leading-5 text-[#9f978e]">{hint}</p>}
      </div>
    </FieldShell>
  );
}

// ─── Toggle ──────────────────────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  activeColor = "bg-primary",
}: {
  checked: boolean;
  onChange: () => void;
  activeColor?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-7 w-14 rounded-full transition-all duration-300 ${
        checked ? activeColor : "bg-[#ddd7cf]"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${
          checked ? "right-1" : "left-1"
        }`}
      />
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

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

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const update = <K extends keyof SystemSettings>(key: K, val: SystemSettings[K]) => {
    setSettings((p) => (p ? { ...p, [key]: val } : p));
    setDirty(true);
  };

  const save = async () => {
    if (!settings || !dirty) return;
    setSaving(true);
    try {
      const payload: UpdateSettingsPayload = Object.fromEntries(
        EDITABLE_FIELDS.filter((k) => settings[k] !== undefined).map((k) => [
          k,
          settings[k],
        ])
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
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="py-24 text-center text-sm font-bold text-[#9f978e]">
        تعذر تحميل الإعدادات
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="mx-auto max-w-7xl space-y-6 pb-24 text-[#211d18]"
      style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
    >
      {ToastComponent}

      {/* Header */}
      <section className="relative overflow-hidden rounded-[32px] border border-[#e7e1d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7f4ee_100%)] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:p-7">
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-36 w-36 rounded-full bg-[#005a8c]/[0.05] blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-[11px] font-extrabold text-primary">
              <span className="material-symbols-outlined text-[15px]">settings</span>
              Platform Configuration
            </div>

            <h1 className="text-2xl font-black tracking-tight text-[#1f312f] md:text-[2rem]">
              إعدادات المنصة
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#7a746d]">
              تحكم مركزي في القواعد التشغيلية، الحصص، البلاغات، الثقة، والتفضيلات
              العامة للمنصة من واجهة أوضح وأسهل في المراجعة.
            </p>
          </div>

          {dirty ? (
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-black text-orange-600 shadow-sm">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse" />
              تغييرات غير محفوظة
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-black text-green-700 shadow-sm">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              جميع التغييرات محفوظة
            </div>
          )}
        </div>
      </section>

      {/* Overview */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-[30px] border border-[#e8e2d9] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] lg:col-span-5">
          <div className="absolute -left-10 top-0 h-28 w-28 rounded-full bg-primary/5 blur-3xl" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[24px]">tune</span>
            </div>

            <span className="rounded-full border border-[#ece6de] bg-[#faf8f4] px-3 py-1 text-[10px] font-extrabold tracking-[0.18em] text-[#9a9289]">
              SETTINGS
            </span>
          </div>

          <div className="mt-10">
            <p className="text-4xl font-black leading-none tracking-tight text-[#1f312f]">
              {settings.platformName || "Aoun"}
            </p>
            <p className="mt-3 text-sm font-bold text-[#7b756e]">
              إعدادات تشغيل المنصة والقواعد العامة
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#f4f1eb] px-3 py-1 text-[11px] font-black text-[#6e675f]">
              {settings.maintenanceMode ? "وضع صيانة مفعّل" : "تشغيل طبيعي"}
            </span>
            <span className="rounded-full bg-[#f4f1eb] px-3 py-1 text-[11px] font-black text-[#6e675f]">
              {settings.requireHubForBooking ? "Safe Hub إلزامي" : "Safe Hub اختياري"}
            </span>
          </div>
        </div>

        <div className="lg:col-span-2">
          <StatCard
            icon="inventory_2"
            label="كوتا Level 1"
            value={String(settings.defaultUserQuota)}
            tone="bg-blue-50 text-blue-600"
          />
        </div>

        <div className="lg:col-span-2">
          <StatCard
            icon="military_tech"
            label="كوتا Level 2"
            value={String(settings.level2Quota)}
            tone="bg-cyan-50 text-cyan-600"
          />
        </div>

        <div className="lg:col-span-1">
          <StatCard
            icon="flag"
            label="عتبة البلاغ"
            value={String(settings.autoReportBanThreshold)}
            tone="bg-red-50 text-red-600"
          />
        </div>

        <div className="lg:col-span-2">
          <StatCard
            icon="star"
            label="ثقة/تبرع"
            value={String(settings.trustScorePerDonation)}
            tone="bg-yellow-50 text-yellow-700"
          />
        </div>
      </section>

      {/* Body grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <SectionCard
            icon="build"
            title="إعدادات عامة للمنصة"
            subtitle="التحكم بالهوية العامة، وضع الصيانة، وسياسات التشغيل الأساسية."
            iconTone="bg-[#f6f2eb] text-[#7a6652]"
          >
            <div className="space-y-4">
              <FieldShell>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-[#1f312f]">وضع الصيانة</p>
                    <p className="mt-1 text-xs leading-6 text-[#8f877f]">
                      يمنع المستخدمين من استخدام المنصة مؤقتًا أثناء التحديث أو الصيانة.
                    </p>
                  </div>
                  <Toggle
                    checked={settings.maintenanceMode}
                    onChange={() =>
                      update("maintenanceMode", !settings.maintenanceMode)
                    }
                    activeColor="bg-red-500"
                  />
                </div>
              </FieldShell>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FieldShell>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#5f5953]">
                      اسم المنصة
                    </label>
                    <input
                      value={settings.platformName || ""}
                      onChange={(e) => update("platformName", e.target.value)}
                      className="w-full rounded-2xl border border-[#e7e1d8] bg-white px-4 py-3 text-sm text-[#24302f] outline-none transition-all duration-300 focus:border-primary focus:shadow-[0_0_0_4px_rgba(1,105,111,0.08)]"
                    />
                  </div>
                </FieldShell>

                <FieldShell>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#5f5953]">
                      بريد التواصل والدعم
                    </label>
                    <input
                      type="email"
                      value={settings.contactEmail || ""}
                      onChange={(e) => update("contactEmail", e.target.value)}
                      placeholder="info@aoun.com"
                      className="w-full rounded-2xl border border-[#e7e1d8] bg-white px-4 py-3 text-sm text-[#24302f] outline-none transition-all duration-300 placeholder:text-[#b3aba1] focus:border-primary focus:shadow-[0_0_0_4px_rgba(1,105,111,0.08)]"
                    />
                  </div>
                </FieldShell>
              </div>

              <FieldShell>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-[#1f312f]">
                      إلزامية نقاط الاستلام (Safe Hubs)
                    </p>
                    <p className="mt-1 text-xs leading-6 text-[#8f877f]">
                      إجبار المستخدمين على تنفيذ التبادل عبر نقاط الاستلام المعتمدة.
                    </p>
                  </div>
                  <Toggle
                    checked={settings.requireHubForBooking}
                    onChange={() =>
                      update(
                        "requireHubForBooking",
                        !settings.requireHubForBooking
                      )
                    }
                  />
                </div>
              </FieldShell>
            </div>
          </SectionCard>

          <SectionCard
            icon="inventory_2"
            title="الحصص والحجوزات"
            subtitle="إدارة الكوتا، حدود الحجز، وانتهاء الصلاحية للمستخدمين والمتبرعين."
            iconTone="bg-blue-50 text-blue-600"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <NumberField
                label="كوتا مستوى 1"
                value={settings.defaultUserQuota}
                onChange={(v) => update("defaultUserQuota", v)}
                min={1}
                max={20}
                hint="بريد موثق فقط"
              />
              <NumberField
                label="كوتا مستوى 2"
                value={settings.level2Quota}
                onChange={(v) => update("level2Quota", v)}
                min={1}
                max={20}
                hint="جامعي أو هاتف"
              />
              <NumberField
                label="مكافأة المتبرع"
                value={settings.donorQuotaReward}
                onChange={(v) => update("donorQuotaReward", v)}
                min={0}
                max={5}
                hint="كوتا إضافية بعد التسليم"
              />
              <NumberField
                label="حد التبرعات النشطة (مستوى 1)"
                value={settings.maxActiveDonationsPerUser}
                onChange={(v) => update("maxActiveDonationsPerUser", v)}
                min={1}
                max={20}
                hint="أقصى تبرعات مفتوحة بالتوازي"
              />
              <NumberField
                label="حد التبرعات النشطة (مستوى 2+)"
                value={settings.maxActiveDonationsLevel2Plus}
                onChange={(v) => update("maxActiveDonationsLevel2Plus", v)}
                min={1}
                max={20}
                hint="للمستخدمين الموثقين"
              />
              <NumberField
                label="يوم تصفير الكوتا التلقائي"
                value={settings.quotaResetDayOfMonth}
                onChange={(v) => update("quotaResetDayOfMonth", v)}
                min={1}
                max={28}
                hint="يوم تنفيذ المهمة الشهرية"
              />
              <NumberField
                label="أقصى حجوزات نشطة معلقة"
                value={settings.maxBookingsPerUser}
                onChange={(v) => update("maxBookingsPerUser", v)}
                min={1}
                max={10}
                hint="للمستخدم في نفس الوقت"
              />
              <NumberField
                label="انتهاء الحجز (ساعة)"
                value={settings.bookingExpiryHours}
                onChange={(v) => update("bookingExpiryHours", v)}
                min={1}
                max={336}
                hint="بعدها يُلغى الحجز تلقائيًا"
              />
            </div>
          </SectionCard>

          <SectionCard
            icon="volunteer_activism"
            title="طلبات التبرع والنطاقات التعليمية"
            subtitle="قواعد الطلبات الشهرية، انتهاء صلاحيتها، والنطاقات الجامعية المسموح بها."
            iconTone="bg-green-50 text-green-600"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <NumberField
                  label="الحد الشهري لكل مستخدم"
                  value={settings.maxActiveRequestsPerMonth}
                  onChange={(v) => update("maxActiveRequestsPerMonth", v)}
                  min={1}
                  max={5}
                  hint="عدد الطلبات النشطة"
                />
                <NumberField
                  label="مدة انتهاء الطلب (يوم)"
                  value={settings.requestExpiryDays}
                  onChange={(v) => update("requestExpiryDays", v)}
                  min={7}
                  max={90}
                  hint="تلقائياً من تاريخ النشر"
                />
              </div>

              <FieldShell>
                <TagListEditor
                  label="النطاقات البريدية الجامعية المعتمدة"
                  items={settings.universityEmailDomains}
                  onChange={(v) => update("universityEmailDomains", v)}
                  placeholder="مثال: @ju.edu.jo"
                />
              </FieldShell>
            </div>
          </SectionCard>

          <SectionCard
            icon="flag"
            title="البلاغات والحظر التلقائي"
            subtitle="تحديد العتبات والقوائم التي تتحكم بكيفية إدارة البلاغات والمخالفات."
            iconTone="bg-red-50 text-red-600"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberField
                  label="عتبة الحظر التلقائي"
                  value={settings.autoReportBanThreshold}
                  onChange={(v) => update("autoReportBanThreshold", v)}
                  min={3}
                  max={20}
                  hint="عدد البلاغات المعتمدة قبل الحظر"
                />
              </div>

              <FieldShell>
                <TagListEditor
                  label="أسباب البلاغات"
                  items={settings.reportReasons}
                  onChange={(v) => update("reportReasons", v)}
                  placeholder="مثال: لم يُسلّم الغرض"
                />
              </FieldShell>
            </div>
          </SectionCard>

          <SectionCard
            icon="category"
            title="تصنيفات الأغراض"
            subtitle="الخيارات التي تظهر للمستخدمين عند إنشاء أو تصفح التبرعات."
            iconTone="bg-purple-50 text-purple-600"
          >
            <FieldShell>
              <TagListEditor
                label="التصنيفات المتاحة"
                items={settings.categories}
                onChange={(v) => update("categories", v)}
                placeholder="مثال: كتب وروايات"
              />
            </FieldShell>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            icon="star"
            title="نقاط الثقة والتقييم"
            subtitle="القيم وعتبات التقييم التي تؤثر مباشرة على تراكم الثقة داخل المنصة."
            iconTone="bg-yellow-50 text-yellow-700"
          >
            <div className="space-y-4">
              <NumberField
                label="نقاط الثقة لكل تبرع"
                value={settings.trustScorePerDonation}
                onChange={(v) => update("trustScorePerDonation", v)}
                min={0}
                max={20}
                hint="تُضاف بعد التسليم المؤكد"
              />
              <NumberField
                label="نقاط الثقة لكل طلب"
                value={settings.trustScorePerRequest}
                onChange={(v) => update("trustScorePerRequest", v)}
                min={0}
                max={10}
                hint="تُضاف عند إتمام الطلب"
              />
              
              {/* ✅ حقول حدود التقييم المضافة بعد trustScorePerRequest */}
              <NumberField  
                label="حد تقييم ممتاز (+2 نقطة)"  
                value={settings.ratingThresholdExcellent}  
                onChange={(v) => update("ratingThresholdExcellent", v)}  
                min={1} max={10}  
                hint="درجة ≥ هذه القيمة ← +2 نقطة ثقة"
              />
              <NumberField  
                label="حد تقييم جيد (+1 نقطة)"  
                value={settings.ratingThresholdGood}  
                onChange={(v) => update("ratingThresholdGood", v)}  
                min={1} max={10}  
                hint="درجة ≥ هذه القيمة ← +1 نقطة ثقة"
              />
              <NumberField  
                label="حد تقييم محايد (0)"  
                value={settings.ratingThresholdNeutral}  
                onChange={(v) => update("ratingThresholdNeutral", v)}  
                min={1} max={10}
              />
              <NumberField  
                label="حد تقييم سيئ (-1 نقطة)"  
                value={settings.ratingThresholdBad}  
                onChange={(v) => update("ratingThresholdBad", v)}  
                min={1} max={10}
              />
            </div>
          </SectionCard>

          {/* ✅ قسم جديد مستقل: أهلية العمليات والطلبات لتغطية حقول الأهلية في مصفوفة التعديل */}
          <SectionCard
            icon="gavel"
            title="أهلية العمليات والطلبات"
            subtitle="الحدود الدنيا لمستويات الثقة المطلوبة لإنشاء العروض والطلبات والحد الأقصى للعروض."
            iconTone="bg-orange-50 text-orange-700"
          >
            <div className="space-y-4">
              <NumberField
                label="الحد الأدنى للثقة لطلب غرض"
                value={settings.minTrustLevelForRequests}
                onChange={(v) => update("minTrustLevelForRequests", v)}
                min={0}
                max={5}
                hint="مستوى الثقة المطلوب لفتح طلب"
              />
              <NumberField
                label="الحد الأدنى للثقة للتبرع"
                value={settings.minTrustLevelForDonating}
                onChange={(v) => update("minTrustLevelForDonating", v)}
                min={0}
                max={5}
                hint="مستوى الثقة المطلوب لإضافة عرض تبرع"
              />
              <NumberField
                label="أقصى عروض معلقة لكل متبرع"
                value={settings.maxPendingOffersPerDonor}
                onChange={(v) => update("maxPendingOffersPerDonor", v)}
                min={1}
                max={50}
                hint="الحد الأقصى للعروض التي لم تُحسم بعد"
              />
            </div>
          </SectionCard>

          <SectionCard
            icon="rule"
            title="ملخص سريع"
            subtitle="نظرة تشغيلية سريعة على القواعد الحالية دون النزول لكل قسم."
            iconTone="bg-[#eef6f5] text-primary"
          >
            <div className="space-y-3">
              {[
                {
                  label: "اسم المنصة",
                  value: settings.platformName || "—",
                },
                {
                  label: "بريد الدعم",
                  value: settings.contactEmail || "—",
                },
                {
                  label: "الكوتا الشهرية Level 1 / Level 2",
                  value: `${settings.defaultUserQuota} / ${settings.level2Quota}`,
                },
                {
                  label: "حد الطلبات الشهرية",
                  value: `${settings.maxActiveRequestsPerMonth}`,
                },
                {
                  label: "عتبة الحظر التلقائي",
                  value: `${settings.autoReportBanThreshold}`,
                },
                {
                  label: "Safe Hubs",
                  value: settings.requireHubForBooking ? "إلزامي" : "اختياري",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-[#eee8e0] bg-[#fcfaf7] px-4 py-3"
                >
                  <span className="text-xs font-black text-[#7f776e]">
                    {item.label}
                  </span>
                  <span className="text-xs font-bold text-[#223433]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-5 left-1/2 z-40 w-[calc(100%-24px)] max-w-3xl -translate-x-1/2">
        <div className="flex items-center justify-between gap-3 rounded-[24px] border border-[#e7e1d8] bg-white/95 px-4 py-3 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="min-w-0">
            <p className="text-sm font-black text-[#1f312f]">
              {dirty ? "هناك تغييرات بانتظار الحفظ" : "لا توجد تغييرات جديدة"}
            </p>
            <p className="mt-0.5 text-xs text-[#8c857d]">
              احفظ التغييرات لتطبيق القواعد الحالية على المنصة.
            </p>
          </div>

          <button
            onClick={save}
            disabled={saving || !dirty}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white transition-all duration-300 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
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
                حفظ الإعدادات
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}