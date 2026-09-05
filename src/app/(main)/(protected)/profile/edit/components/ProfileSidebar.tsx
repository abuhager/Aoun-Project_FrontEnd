"use client";

import type { EditProfileController, EditProfileTab } from "../hooks/useEditProfile";

type Props = Pick<EditProfileController, "activeTab" | "selectTab">;

const TABS: ReadonlyArray<{ key: EditProfileTab; label: string; icon: string }> = [
  { key: "info", label: "المعلومات الشخصية", icon: "person" },
  { key: "password", label: "كلمة المرور", icon: "lock" },
];

export function ProfileSidebar({ activeTab, selectTab }: Props) {
  return (
    <aside className="content-panel p-2 lg:sticky lg:top-24">
      <p className="px-3 pb-2 pt-2 text-[10px] font-black tracking-[0.12em] text-on-surface-soft">أقسام الحساب</p>
      <div className="flex gap-1 lg:flex-col">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => selectTab(tab.key)}
            className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-all lg:justify-start ${activeTab === tab.key ? "bg-primary text-white shadow-[0_8px_20px_rgba(0,117,107,0.2)]" : "text-on-surface-variant hover:bg-primary-softer hover:text-primary"}`}
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: activeTab === tab.key ? "'FILL' 1" : "'FILL' 0" }}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-2 hidden rounded-xl bg-surface-container-low p-3 text-[11px] leading-6 text-on-surface-soft lg:block">
        <span className="material-symbols-outlined mb-2 block text-[19px] text-primary">shield_lock</span>
        لا نعرض رقم هاتفك أو بريدك ضمن الملف العام.
      </div>
    </aside>
  );
}
