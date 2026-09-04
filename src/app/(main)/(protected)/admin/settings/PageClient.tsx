"use client";

import { useToast } from "@/hooks/useToast";
import { SettingsForm } from "./components/SettingsForm";
import { SettingsOverview } from "./components/SettingsOverview";
import { SettingsSaveBar } from "./components/SettingsSaveBar";
import { useAdminSettings } from "./hooks/useAdminSettings";

export default function AdminSettingsClient() {
  const { show: showToast, ToastComponent } = useToast();
  const {
    canEdit,
    changedFields,
    dirty,
    loading,
    save,
    saving,
    settings,
    update,
  } = useAdminSettings(showToast);

  if (loading) {
    return (
      <div className="flex justify-center py-24" role="status" aria-label="جاري تحميل الإعدادات">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
      <SettingsOverview settings={settings} dirty={dirty} canEdit={canEdit} />
      <SettingsForm
        settings={settings}
        update={update}
        canEdit={canEdit}
        saving={saving}
      />
      <SettingsSaveBar
        canEdit={canEdit}
        changedCount={changedFields.length}
        dirty={dirty}
        saving={saving}
        onSave={save}
      />
    </div>
  );
}
