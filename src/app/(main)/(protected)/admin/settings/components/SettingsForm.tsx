"use client";

import type { SystemSettings } from "@/types/settings.types";
import type { UpdateSetting } from "../hooks/useAdminSettings";
import { FieldShell, NumberField, SectionCard, TagListEditor } from "./SettingsControls";
import { GeneralSettings, QuickSummary } from "./SettingsGeneralSections";
import {
  ELIGIBILITY_FIELDS,
  QUOTA_FIELDS,
  REPORT_FIELDS,
  REQUEST_FIELDS,
  SECURITY_FIELDS,
  TRUST_FIELDS,
  type NumberFieldDefinition,
} from "./settingsFieldDefinitions";

type SettingsFormProps = {
  settings: SystemSettings;
  update: UpdateSetting;
  canEdit: boolean;
  saving: boolean;
};

export function SettingsForm({ settings, update, canEdit, saving }: SettingsFormProps) {
  return (
    <fieldset disabled={!canEdit || saving} className="grid min-w-0 grid-cols-1 gap-6 border-0 p-0 disabled:opacity-90 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <GeneralSettings settings={settings} update={update} />
        <NumericSection icon="inventory_2" title="الحصص والحجوزات" subtitle="إدارة الكوتا، حدود الحجز، وانتهاء الصلاحية للمستخدمين والمتبرعين." tone="bg-blue-50 text-blue-600" definitions={QUOTA_FIELDS} settings={settings} update={update} gridClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" />

        <SectionCard icon="volunteer_activism" title="طلبات التبرع والنطاقات التعليمية" subtitle="قواعد الطلبات الشهرية، انتهاء صلاحيتها، والنطاقات الجامعية المسموح بها." iconTone="bg-green-50 text-green-600">
          <div className="space-y-4">
            <NumberSettingsGrid definitions={REQUEST_FIELDS} settings={settings} update={update} className="grid grid-cols-1 gap-4 sm:grid-cols-2" />
            <ListField label="المناطق المعتمدة" items={settings.locations} onChange={(value) => update("locations", value)} placeholder="مثال: عمان" />
            <ListField label="النطاقات البريدية الجامعية المعتمدة" items={settings.universityEmailDomains} onChange={(value) => update("universityEmailDomains", value)} placeholder="مثال: @ju.edu.jo" />
          </div>
        </SectionCard>

        <SectionCard icon="flag" title="البلاغات والحظر التلقائي" subtitle="تحديد العتبات والقوائم التي تتحكم بكيفية إدارة البلاغات والمخالفات." iconTone="bg-red-50 text-red-600">
          <div className="space-y-4">
            <NumberSettingsGrid definitions={REPORT_FIELDS} settings={settings} update={update} className="grid grid-cols-1 gap-4 sm:grid-cols-2" />
            <ListField label="أسباب البلاغات" items={settings.reportReasons} onChange={(value) => update("reportReasons", value)} placeholder="مثال: لم يُسلّم الغرض" />
          </div>
        </SectionCard>

        <SectionCard icon="category" title="تصنيفات الأغراض" subtitle="الخيارات التي تظهر للمستخدمين عند إنشاء أو تصفح التبرعات." iconTone="bg-purple-50 text-purple-600">
          <ListField label="التصنيفات المتاحة" items={settings.categories} onChange={(value) => update("categories", value)} placeholder="مثال: كتب وروايات" />
        </SectionCard>
      </div>

      <div className="space-y-6">
        <NumericSection icon="star" title="نقاط الثقة والتقييم" subtitle="القيم وعتبات التقييم التي تؤثر مباشرة على تراكم الثقة داخل المنصة." tone="bg-yellow-50 text-yellow-700" definitions={TRUST_FIELDS} settings={settings} update={update} gridClassName="space-y-4" />
        <NumericSection icon="gavel" title="أهلية العمليات والطلبات" subtitle="الحدود الدنيا لمستويات الثقة المطلوبة لإنشاء العروض والطلبات والحد الأقصى للعروض." tone="bg-orange-50 text-orange-700" definitions={ELIGIBILITY_FIELDS} settings={settings} update={update} gridClassName="space-y-4" />
        <NumericSection icon="shield_lock" title="الأمان والصور وأحجام الصفحات" subtitle="حدود OTP واستعادة كلمة المرور والصور وأحجام نتائج API ولوحة الإدارة." tone="bg-indigo-50 text-indigo-700" definitions={SECURITY_FIELDS} settings={settings} update={update} gridClassName="grid grid-cols-1 gap-4 sm:grid-cols-2" />
        <QuickSummary settings={settings} />
      </div>
    </fieldset>
  );
}

function NumericSection({ icon, title, subtitle, tone, definitions, settings, update, gridClassName }: { icon: string; title: string; subtitle: string; tone: string; definitions: readonly NumberFieldDefinition[]; settings: SystemSettings; update: UpdateSetting; gridClassName: string }) {
  return (
    <SectionCard icon={icon} title={title} subtitle={subtitle} iconTone={tone}>
      <NumberSettingsGrid definitions={definitions} settings={settings} update={update} className={gridClassName} />
    </SectionCard>
  );
}

function NumberSettingsGrid({ definitions, settings, update, className }: { definitions: readonly NumberFieldDefinition[]; settings: SystemSettings; update: UpdateSetting; className: string }) {
  return (
    <div className={className}>
      {definitions.map((field) => (
        <NumberField key={`${field.key}-${settings[field.key]}`} label={field.label} value={settings[field.key]} onChange={(value) => update(field.key, value)} min={field.min} max={field.max} hint={field.hint} />
      ))}
    </div>
  );
}

function ListField({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (items: string[]) => void; placeholder: string }) {
  return (
    <FieldShell>
      <TagListEditor label={label} items={items} onChange={onChange} placeholder={placeholder} />
    </FieldShell>
  );
}
