"use client";

import type { SystemSettings } from "@/types/settings.types";
import type { UpdateSetting } from "../hooks/useAdminSettings";
import { FieldShell, SectionCard, Toggle } from "./SettingsControls";

export function GeneralSettings({ settings, update }: { settings: SystemSettings; update: UpdateSetting }) {
  return (
    <SectionCard icon="build" title="إعدادات عامة للمنصة" subtitle="التحكم بالهوية العامة، وضع الصيانة، وسياسات التشغيل الأساسية." iconTone="bg-[#f6f2eb] text-[#7a6652]">
      <div className="space-y-4">
        <ToggleField title="وضع الصيانة" description="يمنع المستخدمين من استخدام المنصة مؤقتًا أثناء التحديث أو الصيانة." checked={settings.maintenanceMode} onChange={() => update("maintenanceMode", !settings.maintenanceMode)} danger />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextField id="platform-name" label="اسم المنصة" value={settings.platformName || ""} onChange={(value) => update("platformName", value)} />
          <TextField id="contact-email" label="بريد التواصل والدعم" value={settings.contactEmail || ""} onChange={(value) => update("contactEmail", value)} type="email" placeholder="info@aoun.com" />
        </div>
        <ToggleField title="إلزامية نقاط الاستلام (Safe Hubs)" description="إجبار المستخدمين على تنفيذ التبادل عبر نقاط الاستلام المعتمدة." checked={settings.requireHubForBooking} onChange={() => update("requireHubForBooking", !settings.requireHubForBooking)} />
      </div>
    </SectionCard>
  );
}

export function QuickSummary({ settings }: { settings: SystemSettings }) {
  const rows = [
    { label: "اسم المنصة", value: settings.platformName || "—" },
    { label: "بريد الدعم", value: settings.contactEmail || "—" },
    { label: "الكوتا الشهرية Level 1 / Level 2", value: `${settings.defaultUserQuota} / ${settings.level2Quota}` },
    { label: "حد الطلبات الشهرية", value: String(settings.maxActiveRequestsPerMonth) },
    { label: "عتبة الحظر التلقائي", value: String(settings.autoReportBanThreshold) },
    { label: "Safe Hubs", value: settings.requireHubForBooking ? "إلزامي" : "اختياري" },
  ];
  return (
    <SectionCard icon="rule" title="ملخص سريع" subtitle="نظرة تشغيلية سريعة على القواعد الحالية دون النزول لكل قسم.">
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between rounded-2xl border border-[#eee8e0] bg-[#fcfaf7] px-4 py-3">
            <span className="text-xs font-black text-[#7f776e]">{row.label}</span>
            <span className="text-xs font-bold text-[#223433]">{row.value}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function ToggleField({ title, description, checked, onChange, danger = false }: { title: string; description: string; checked: boolean; onChange: () => void; danger?: boolean }) {
  return (
    <FieldShell>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black text-[#1f312f]">{title}</p>
          <p className="mt-1 text-xs leading-6 text-[#8f877f]">{description}</p>
        </div>
        <Toggle checked={checked} onChange={onChange} activeColor={danger ? "bg-red-500" : undefined} />
      </div>
    </FieldShell>
  );
}

function TextField({ id, label, value, onChange, type = "text", placeholder }: { id: string; label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return (
    <FieldShell>
      <div className="space-y-2">
        <label className="text-xs font-black text-[#5f5953]" htmlFor={id}>{label}</label>
        <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-[#e7e1d8] bg-white px-4 py-3 text-sm text-[#24302f] outline-none transition-all placeholder:text-[#b3aba1] focus:border-primary focus:shadow-[0_0_0_4px_rgba(1,105,111,0.08)]" />
      </div>
    </FieldShell>
  );
}
