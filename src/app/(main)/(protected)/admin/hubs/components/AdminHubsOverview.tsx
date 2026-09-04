"use client";

import type { HubFilter } from "../hooks/useAdminHubs";

type AdminHubsOverviewProps = {
  counts: { total: number; active: number; inactive: number; cities: number };
  filter: HubFilter;
  search: string;
  onFilterChange: (filter: HubFilter) => void;
  onSearchChange: (search: string) => void;
  onAdd: () => void;
};

const FILTERS: { value: HubFilter; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "active", label: "نشط" },
  { value: "inactive", label: "معطّل" },
];

export default function AdminHubsOverview({
  counts,
  filter,
  search,
  onFilterChange,
  onSearchChange,
  onAdd,
}: AdminHubsOverviewProps) {
  const stats = [
    {
      label: "نشط",
      value: counts.active,
      icon: "check_circle",
      tone: "bg-green-50 text-green-700",
      span: "lg:col-span-3",
    },
    {
      label: "معطّل",
      value: counts.inactive,
      icon: "pause_circle",
      tone: "bg-red-50 text-red-600",
      span: "lg:col-span-4",
    },
    {
      label: "مدينة",
      value: counts.cities,
      icon: "location_city",
      tone: "bg-blue-50 text-blue-600",
      span: "lg:col-span-3",
    },
  ];

  return (
    <>
      <section className="admin-page-hero rounded-[32px] border border-[#e7e1d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7f4ee_100%)] p-6 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-[11px] font-extrabold text-primary">
              <span className="material-symbols-outlined text-[15px]">warehouse</span>
              Safe Hubs Workspace
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#1f312f]">
              مراكز التسليم
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#7a746d]">
              إدارة مراكز التسليم، مع فلترة سريعة وإبراز الحالة والموقع وساعات
              العمل.
            </p>
          </div>

          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-[0_10px_22px_rgba(1,105,111,0.18)] transition-all hover:-translate-y-0.5 hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-base">add_location_alt</span>
            إضافة مركز جديد
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-[30px] border border-[#e8e2d9] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] lg:col-span-5">
          <div className="absolute -left-10 top-0 h-28 w-28 rounded-full bg-primary/5 blur-3xl" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[24px]">hub</span>
            </div>
            <span className="rounded-full border border-[#ece6de] bg-[#faf8f4] px-3 py-1 text-[10px] font-extrabold tracking-[0.18em] text-[#9a9289]">
              NETWORK
            </span>
          </div>

          <div className="mt-10">
            <p className="text-5xl font-black leading-none tracking-tight text-[#1f312f]">
              {counts.total}
            </p>
            <p className="mt-3 text-sm font-bold text-[#7b756e]">
              إجمالي مراكز التسليم في الشبكة
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#f4f1eb] px-3 py-1 text-[11px] font-black text-[#6e675f]">
              {counts.active} نشط
            </span>
            <span className="rounded-full bg-[#f4f1eb] px-3 py-1 text-[11px] font-black text-[#6e675f]">
              {counts.inactive} معطّل
            </span>
            <span className="rounded-full bg-[#f4f1eb] px-3 py-1 text-[11px] font-black text-[#6e675f]">
              {counts.cities} مدينة
            </span>
          </div>
        </div>

        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-[28px] border border-[#e8e2d9] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] ${stat.span}`}
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.tone}`}>
              <span className="material-symbols-outlined text-[22px]">{stat.icon}</span>
            </div>
            <div className="mt-7">
              <p className="text-3xl font-black leading-none text-[#1f312f]">{stat.value}</p>
              <p className="mt-2 text-sm font-bold text-[#7a746d]">{stat.label}</p>
            </div>
          </div>
        ))}

        <div className="rounded-[30px] border border-[#e8e2d9] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] lg:col-span-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[#9b948b]">search</span>
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="بحث باسم المركز أو المدينة أو العنوان..."
                className="w-full rounded-2xl border border-[#e5dfd6] bg-[#fcfaf7] py-3 pl-4 pr-10 text-sm text-[#24302f] outline-none transition-all placeholder:text-[#b3aba1] focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((item) => (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => onFilterChange(item.value)}
                  className={`rounded-2xl px-4 py-2.5 text-xs font-black transition-all ${
                    filter === item.value
                      ? "bg-primary text-white shadow-[0_8px_18px_rgba(1,105,111,0.16)]"
                      : "bg-[#f5f1eb] text-[#746e67] hover:bg-[#ece6de]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
