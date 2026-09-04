"use client";

import type { SystemSettings } from "@/types/settings.types";
import type { UpdateSetting } from "../hooks/useAdminSettings";
import {
  FieldShell,
  NumberField,
  SectionCard,
  TagListEditor,
  Toggle,
} from "./SettingsControls";

type NumericSettingKey = {
  [Key in keyof SystemSettings]: SystemSettings[Key] extends number ? Key : never;
}[keyof SystemSettings];

type NumberFieldDefinition = {
  key: NumericSettingKey;
  label: string;
  min: number;
  max: number;
  hint?: string;
};

const QUOTA_FIELDS: readonly NumberFieldDefinition[] = [
  { key: "defaultUserQuota", label: "كوتا مستوى 1", min: 1, max: 20, hint: "بريد موثق فقط" },
  { key: "level2Quota", label: "كوتا مستوى 2", min: 1, max: 20, hint: "جامعي أو هاتف" },
  { key: "studentQuota", label: "كوتا الطالب الجامعي", min: 1, max: 20, hint: "تُمنح عند التحقق من النطاق الجامعي" },
  { key: "studentDefaultTrustLevel", label: "مستوى الثقة الافتراضي للطلاب", min: 1, max: 2, hint: "1 = بريد فقط، 2 = موثق" },
  { key: "donorQuotaReward", label: "مكافأة المتبرع", min: 0, max: 5, hint: "كوتا إضافية بعد التسليم" },
  { key: "maxActiveDonationsPerUser", label: "حد التبرعات النشطة (مستوى 1)", min: 1, max: 20, hint: "أقصى تبرعات مفتوحة بالتوازي" },
  { key: "maxActiveDonationsLevel2Plus", label: "حد التبرعات النشطة (مستوى 2+)", min: 1, max: 20, hint: "للمستخدمين الموثقين" },
  { key: "quotaResetDayOfMonth", label: "يوم تصفير الكوتا التلقائي", min: 1, max: 28, hint: "يوم تنفيذ المهمة الشهرية" },
  { key: "maxBookingsPerUser", label: "أقصى حجوزات نشطة معلقة", min: 1, max: 10, hint: "للمستخدم في نفس الوقت" },
  { key: "bookingExpiryHours", label: "انتهاء الحجز (ساعة)", min: 1, max: 336, hint: "بعدها يُلغى الحجز تلقائيًا" },
  { key: "maxWaitlistPerItem", label: "أقصى حجم لقائمة الانتظار", min: 1, max: 50, hint: "عدد المنتظرين لكل غرض" },
];

const REQUEST_FIELDS: readonly NumberFieldDefinition[] = [
  { key: "maxActiveRequestsPerMonth", label: "الحد الشهري لكل مستخدم", min: 1, max: 5, hint: "عدد الطلبات النشطة" },
  { key: "requestExpiryDays", label: "مدة انتهاء الطلب (يوم)", min: 1, max: 180, hint: "تلقائياً من تاريخ النشر" },
];

const REPORT_FIELDS: readonly NumberFieldDefinition[] = [
  { key: "autoReportBanThreshold", label: "عتبة الحظر التلقائي", min: 1, max: 20, hint: "عدد البلاغات المعتمدة قبل الحظر" },
  { key: "appealWindowHours", label: "مهلة الاعتراض (ساعة)", min: 1, max: 336, hint: "المدة المتاحة للمستخدم لتقديم اعتراض" },
];

const TRUST_FIELDS: readonly NumberFieldDefinition[] = [
  { key: "trustScorePerDonation", label: "نقاط الثقة لكل تبرع", min: 0, max: 20, hint: "تُضاف بعد التسليم المؤكد" },
  { key: "trustScorePerRequest", label: "نقاط الثقة لكل طلب", min: 0, max: 10, hint: "تُضاف عند إتمام الطلب" },
  { key: "ratingThresholdExcellent", label: "حد تقييم ممتاز (+2 نقطة)", min: 1, max: 10, hint: "درجة ≥ هذه القيمة ← +2 نقطة ثقة" },
  { key: "ratingThresholdGood", label: "حد تقييم جيد (+1 نقطة)", min: 1, max: 10, hint: "درجة ≥ هذه القيمة ← +1 نقطة ثقة" },
  { key: "ratingThresholdNeutral", label: "حد تقييم محايد (0)", min: 1, max: 10 },
  { key: "ratingThresholdBad", label: "حد تقييم سيئ (-1 نقطة)", min: 1, max: 10 },
];

const ELIGIBILITY_FIELDS: readonly NumberFieldDefinition[] = [
  { key: "minTrustLevelForRequests", label: "الحد الأدنى للثقة لطلب غرض", min: 1, max: 2, hint: "مستوى الثقة المطلوب لفتح طلب" },
  { key: "minTrustLevelForDonating", label: "الحد الأدنى للثقة للتبرع", min: 1, max: 2, hint: "مستوى الثقة المطلوب لإضافة عرض تبرع" },
  { key: "maxPendingOffersPerDonor", label: "أقصى عروض معلقة لكل متبرع", min: 1, max: 20, hint: "الحد الأقصى للعروض التي لم تُحسم بعد" },
];

const SECURITY_FIELDS: readonly NumberFieldDefinition[] = [
  { key: "otpExpiryMinutes", label: "صلاحية OTP (دقيقة)", min: 1, max: 60 },
  { key: "maxOtpAttempts", label: "أقصى محاولات OTP", min: 3, max: 10 },
  { key: "resetPasswordExpiryMinutes", label: "صلاحية استعادة كلمة المرور (دقيقة)", min: 5, max: 60 },
  { key: "maxAvatarSizeMb", label: "أقصى حجم للصورة (MB)", min: 1, max: 20 },
  { key: "avatarWidth", label: "عرض الصورة الشخصية", min: 100, max: 1000 },
  { key: "avatarHeight", label: "ارتفاع الصورة الشخصية", min: 100, max: 1000 },
  { key: "maxPageSize", label: "أقصى حجم صفحة API", min: 5, max: 100 },
  { key: "profilePageSize", label: "حجم صفحة الملف الشخصي", min: 5, max: 50 },
  { key: "adminPageSize", label: "حجم صفحات الإدارة", min: 5, max: 100 },
  { key: "adminReportsPageSize", label: "حجم صفحة البلاغات", min: 5, max: 50 },
];

function NumberSettingsGrid({
  definitions,
  settings,
  update,
  className,
}: {
  definitions: readonly NumberFieldDefinition[];
  settings: SystemSettings;
  update: UpdateSetting;
  className: string;
}) {
  return (
    <div className={className}>
      {definitions.map((field) => (
        <NumberField
          key={`${field.key}-${settings[field.key]}`}
          label={field.label}
          value={settings[field.key]}
          onChange={(value) => update(field.key, value)}
          min={field.min}
          max={field.max}
          hint={field.hint}
        />
      ))}
    </div>
  );
}

function GeneralSettings({
  settings,
  update,
}: {
  settings: SystemSettings;
  update: UpdateSetting;
}) {
  return (
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
              onChange={() => update("maintenanceMode", !settings.maintenanceMode)}
              activeColor="bg-red-500"
            />
          </div>
        </FieldShell>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FieldShell>
            <div className="space-y-2">
              <label className="text-xs font-black text-[#5f5953]" htmlFor="platform-name">
                اسم المنصة
              </label>
              <input
                id="platform-name"
                value={settings.platformName || ""}
                onChange={(event) => update("platformName", event.target.value)}
                className="w-full rounded-2xl border border-[#e7e1d8] bg-white px-4 py-3 text-sm text-[#24302f] outline-none transition-all focus:border-primary focus:shadow-[0_0_0_4px_rgba(1,105,111,0.08)]"
              />
            </div>
          </FieldShell>

          <FieldShell>
            <div className="space-y-2">
              <label className="text-xs font-black text-[#5f5953]" htmlFor="contact-email">
                بريد التواصل والدعم
              </label>
              <input
                id="contact-email"
                type="email"
                value={settings.contactEmail || ""}
                onChange={(event) => update("contactEmail", event.target.value)}
                placeholder="info@aoun.com"
                className="w-full rounded-2xl border border-[#e7e1d8] bg-white px-4 py-3 text-sm text-[#24302f] outline-none transition-all placeholder:text-[#b3aba1] focus:border-primary focus:shadow-[0_0_0_4px_rgba(1,105,111,0.08)]"
              />
            </div>
          </FieldShell>
        </div>

        <FieldShell>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-[#1f312f]">إلزامية نقاط الاستلام (Safe Hubs)</p>
              <p className="mt-1 text-xs leading-6 text-[#8f877f]">
                إجبار المستخدمين على تنفيذ التبادل عبر نقاط الاستلام المعتمدة.
              </p>
            </div>
            <Toggle
              checked={settings.requireHubForBooking}
              onChange={() => update("requireHubForBooking", !settings.requireHubForBooking)}
            />
          </div>
        </FieldShell>
      </div>
    </SectionCard>
  );
}

function QuickSummary({ settings }: { settings: SystemSettings }) {
  const rows = [
    { label: "اسم المنصة", value: settings.platformName || "—" },
    { label: "بريد الدعم", value: settings.contactEmail || "—" },
    { label: "الكوتا الشهرية Level 1 / Level 2", value: `${settings.defaultUserQuota} / ${settings.level2Quota}` },
    { label: "حد الطلبات الشهرية", value: String(settings.maxActiveRequestsPerMonth) },
    { label: "عتبة الحظر التلقائي", value: String(settings.autoReportBanThreshold) },
    { label: "Safe Hubs", value: settings.requireHubForBooking ? "إلزامي" : "اختياري" },
  ];

  return (
    <SectionCard
      icon="rule"
      title="ملخص سريع"
      subtitle="نظرة تشغيلية سريعة على القواعد الحالية دون النزول لكل قسم."
    >
      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-2xl border border-[#eee8e0] bg-[#fcfaf7] px-4 py-3"
          >
            <span className="text-xs font-black text-[#7f776e]">{row.label}</span>
            <span className="text-xs font-bold text-[#223433]">{row.value}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export function SettingsForm({
  settings,
  update,
  canEdit,
  saving,
}: {
  settings: SystemSettings;
  update: UpdateSetting;
  canEdit: boolean;
  saving: boolean;
}) {
  return (
    <fieldset
      disabled={!canEdit || saving}
      className="grid min-w-0 grid-cols-1 gap-6 border-0 p-0 disabled:opacity-90 xl:grid-cols-[1.15fr_0.85fr]"
    >
      <div className="space-y-6">
        <GeneralSettings settings={settings} update={update} />

        <SectionCard
          icon="inventory_2"
          title="الحصص والحجوزات"
          subtitle="إدارة الكوتا، حدود الحجز، وانتهاء الصلاحية للمستخدمين والمتبرعين."
          iconTone="bg-blue-50 text-blue-600"
        >
          <NumberSettingsGrid
            definitions={QUOTA_FIELDS}
            settings={settings}
            update={update}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          />
        </SectionCard>

        <SectionCard
          icon="volunteer_activism"
          title="طلبات التبرع والنطاقات التعليمية"
          subtitle="قواعد الطلبات الشهرية، انتهاء صلاحيتها، والنطاقات الجامعية المسموح بها."
          iconTone="bg-green-50 text-green-600"
        >
          <div className="space-y-4">
            <NumberSettingsGrid
              definitions={REQUEST_FIELDS}
              settings={settings}
              update={update}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            />
            <FieldShell>
              <TagListEditor
                label="المناطق المعتمدة"
                items={settings.locations}
                onChange={(value) => update("locations", value)}
                placeholder="مثال: عمان"
              />
            </FieldShell>
            <FieldShell>
              <TagListEditor
                label="النطاقات البريدية الجامعية المعتمدة"
                items={settings.universityEmailDomains}
                onChange={(value) => update("universityEmailDomains", value)}
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
            <NumberSettingsGrid
              definitions={REPORT_FIELDS}
              settings={settings}
              update={update}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            />
            <FieldShell>
              <TagListEditor
                label="أسباب البلاغات"
                items={settings.reportReasons}
                onChange={(value) => update("reportReasons", value)}
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
              onChange={(value) => update("categories", value)}
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
          <NumberSettingsGrid
            definitions={TRUST_FIELDS}
            settings={settings}
            update={update}
            className="space-y-4"
          />
        </SectionCard>

        <SectionCard
          icon="gavel"
          title="أهلية العمليات والطلبات"
          subtitle="الحدود الدنيا لمستويات الثقة المطلوبة لإنشاء العروض والطلبات والحد الأقصى للعروض."
          iconTone="bg-orange-50 text-orange-700"
        >
          <NumberSettingsGrid
            definitions={ELIGIBILITY_FIELDS}
            settings={settings}
            update={update}
            className="space-y-4"
          />
        </SectionCard>

        <SectionCard
          icon="shield_lock"
          title="الأمان والصور وأحجام الصفحات"
          subtitle="حدود OTP واستعادة كلمة المرور والصور وأحجام نتائج API ولوحة الإدارة."
          iconTone="bg-indigo-50 text-indigo-700"
        >
          <NumberSettingsGrid
            definitions={SECURITY_FIELDS}
            settings={settings}
            update={update}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          />
        </SectionCard>

        <QuickSummary settings={settings} />
      </div>
    </fieldset>
  );
}
