"use client";

import type { SystemSettings } from "@/types/settings.types";
import { StatCard } from "./SettingsControls";

export function SettingsOverview({
  settings,
  dirty,
  canEdit,
}: {
  settings: SystemSettings;
  dirty: boolean;
  canEdit: boolean;
}) {
  return (
    <>
      <section className="admin-page-hero relative overflow-hidden rounded-[32px] border border-[#e7e1d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7f4ee_100%)] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:p-7">
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
              <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-orange-500" />
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

      {!canEdit && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold leading-7 text-amber-800">
          يمكنك مراجعة الإعدادات، لكن تعديلها متاح للمشرف الأعلى فقط.
        </section>
      )}

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
    </>
  );
}
