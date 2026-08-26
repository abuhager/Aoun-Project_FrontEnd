// src/app/(main)/(protected)/admin/hubs/page.tsx
// ✅ PATCHED [BUG-02 | SEC-03 | LOGIC-03]
"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useToast } from "@/hooks/useToast";
import type { CreateHubPayload, SafeHub, UpdateHubPayload } from "@/types/hub.types";
import {
  buildHubPayload,
  DEFAULT_HUB_WORKING_HOURS,
} from "@/lib/validation/hub";
import {
  getAllHubsAdmin,
  createHub,
  updateHub,
  deactivateHub,
  reactivateHub,
} from "@/lib/api/hubApi";
import { extractErrorMsg } from "@/lib/api/apiError";
import AccessibleDialog from "@/components/ui/AccessibleDialog";

const EMPTY_FORM = {
  name: "",
  address: "",
  city: "",
  workingHours: DEFAULT_HUB_WORKING_HOURS,
  lat: "",
  lng: "",
};

export default function AdminHubsPage() {
  const [hubs, setHubs] = useState<SafeHub[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");

  const [modal, setModal] = useState<"closed" | "add" | "edit">("closed");
  const [editTarget, setEditTarget] = useState<SafeHub | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formBusy, setFormBusy] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const loadControllerRef = useRef<AbortController | null>(null);

  const { show: showToast, ToastComponent } = useToast();

  const loadHubs = useCallback(async () => {
    loadControllerRef.current?.abort();
    const controller = new AbortController();
    loadControllerRef.current = controller;
    setLoading(true);
    setLoadError("");
    try {
      const data = await getAllHubsAdmin(controller.signal);
      if (!controller.signal.aborted) setHubs(data);
    } catch {
      if (!controller.signal.aborted) {
        setLoadError("تعذر تحميل مراكز التسليم");
        showToast("تعذر تحميل مراكز التسليم", false);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadHubs();
    return () => loadControllerRef.current?.abort();
  }, [loadHubs]);

  const availableCities = useMemo(
    () => [...new Set(hubs.map((h) => h.city))].sort(),
    [hubs]
  );

  const visible = hubs.filter((h) => {
    const matchFilter =
      filter === "all" ? true : filter === "active" ? h.isActive : !h.isActive;
    const matchSearch =
      h.name.includes(search) ||
      h.city.includes(search) ||
      h.address.includes(search);
    return matchFilter && matchSearch;
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormErrors([]);
    setEditTarget(null);
    setModal("add");
  };

  const openEdit = (hub: SafeHub) => {
    setForm({
      name: hub.name,
      address: hub.address,
      city: hub.city,
      workingHours: hub.workingHours,
      lat: hub.coordinates?.lat?.toString() ?? "",
      lng: hub.coordinates?.lng?.toString() ?? "",
    });
    setFormErrors([]);
    setEditTarget(hub);
    setModal("edit");
  };

  const saveForm = async () => {
    const { errors, payload } = buildHubPayload(form, {
      clearExistingCoordinates:
        modal === "edit" && Boolean(editTarget?.coordinates),
    });
    if (errors.length || !payload) {
      setFormErrors(errors);
      return;
    }

    setFormBusy(true);
    setFormErrors([]);

    try {
      if (modal === "add") {
        const created = await createHub(payload as CreateHubPayload);
        setHubs((current) => [created, ...current]);
        showToast("✅ تم إضافة المركز بنجاح", true);
      } else {
        const updated = await updateHub(editTarget!._id, payload as UpdateHubPayload);
        setHubs((current) =>
          current.map((hub) => (hub._id === updated._id ? updated : hub))
        );
        showToast("✅ تم تحديث المركز بنجاح", true);
      }
      setModal("closed");
    } catch (err) {
      showToast(extractErrorMsg(err, "حدث خطأ أثناء حفظ البيانات"), false);
    } finally {
      setFormBusy(false);
    }
  };

  const toggleActive = async (hub: SafeHub) => {
    if (busy[hub._id]) return;
    setBusy((p) => ({ ...p, [hub._id]: true }));
    try {
      const updated = hub.isActive
        ? await deactivateHub(hub._id)
        : await reactivateHub(hub._id);

      setHubs((current) =>
        current.map((item) => (item._id === updated._id ? updated : item))
      );

      if (hub.isActive) {
        showToast("⏸ تم تعطيل المركز بنجاح", true);
      } else {
        showToast("✅ تم تفعيل المركز بنجاح", true);
      }
    } catch (err) {
      showToast(extractErrorMsg(err, "حدث خطأ أثناء تحديث حالة المركز"), false);
    } finally {
      setBusy((p) => ({ ...p, [hub._id]: false }));
    }
  };

  const activeCount = hubs.filter((h) => h.isActive).length;
  const inactiveCount = hubs.filter((h) => !h.isActive).length;
  const cityCount = availableCities.length;

  return (
    <div className="space-y-6" dir="rtl">
      {ToastComponent}

      {/* Header */}
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
              إدارة مراكز التسليم من واجهة أوضح بصريًا، مع فلترة أسرع وإبراز للحالة
              والموقع وساعات العمل داخل بطاقات أكثر تنظيمًا.
            </p>
          </div>

          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-[0_10px_22px_rgba(1,105,111,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-base">add_location_alt</span>
            إضافة مركز جديد
          </button>
        </div>
      </section>

      {/* Bento Top */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Main insight card */}
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
              {hubs.length}
            </p>
            <p className="mt-3 text-sm font-bold text-[#7b756e]">
              إجمالي مراكز التسليم في الشبكة
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#f4f1eb] px-3 py-1 text-[11px] font-black text-[#6e675f]">
              {activeCount} نشط
            </span>
            <span className="rounded-full bg-[#f4f1eb] px-3 py-1 text-[11px] font-black text-[#6e675f]">
              {inactiveCount} معطّل
            </span>
            <span className="rounded-full bg-[#f4f1eb] px-3 py-1 text-[11px] font-black text-[#6e675f]">
              {cityCount} مدينة
            </span>
          </div>
        </div>

        {/* Stats */}
        {[
          {
            label: "نشط",
            value: activeCount,
            icon: "check_circle",
            wrap: "bg-green-50 text-green-700",
          },
          {
            label: "معطّل",
            value: inactiveCount,
            icon: "pause_circle",
            wrap: "bg-red-50 text-red-600",
          },
          {
            label: "مدينة",
            value: cityCount,
            icon: "location_city",
            wrap: "bg-blue-50 text-blue-600",
          },
        ].map((c, i) => (
          <div
            key={c.label}
            className={`rounded-[28px] border border-[#e8e2d9] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] ${
              i === 0 ? "lg:col-span-3" : i === 1 ? "lg:col-span-4" : "lg:col-span-3"
            }`}
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${c.wrap}`}>
              <span className="material-symbols-outlined text-[22px]">{c.icon}</span>
            </div>

            <div className="mt-7">
              <p className="text-3xl font-black leading-none tracking-tight text-[#1f312f]">
                {c.value}
              </p>
              <p className="mt-2 text-sm font-bold text-[#7a746d]">{c.label}</p>
            </div>
          </div>
        ))}

        {/* Search + filters */}
        <div className="rounded-[30px] border border-[#e8e2d9] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] lg:col-span-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[#9b948b]">
                search
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث باسم المركز أو المدينة أو العنوان..."
                className="w-full rounded-2xl border border-[#e5dfd6] bg-[#fcfaf7] py-3 pl-4 pr-10 text-sm text-[#24302f] outline-none transition-all duration-300 placeholder:text-[#b3aba1] focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(["all", "active", "inactive"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-2xl px-4 py-2.5 text-xs font-black transition-all duration-300 ${
                    filter === f
                      ? "bg-primary text-white shadow-[0_8px_18px_rgba(1,105,111,0.16)]"
                      : "bg-[#f5f1eb] text-[#746e67] hover:bg-[#ece6de]"
                  }`}
                >
                  {f === "all" ? "الكل" : f === "active" ? "نشط" : "معطّل"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[190px] animate-pulse rounded-[28px] border border-[#ece7df] bg-white"
            />
          ))}
        </div>
      ) : loadError ? (
        <div className="rounded-[28px] border border-red-100 bg-white py-16 text-center shadow-sm">
          <span className="material-symbols-outlined text-[32px] text-red-400">cloud_off</span>
          <p className="mt-4 text-sm font-black text-[#5d5750]">{loadError}</p>
          <button
            type="button"
            onClick={() => void loadHubs()}
            className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-xs font-black text-white"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-[28px] border border-[#e8e2d9] bg-white py-20 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f4f1eb] text-[#a89f95]">
            <span className="material-symbols-outlined text-[30px]">warehouse</span>
          </div>
          <p className="mt-5 text-base font-black text-[#5d5750]">
            لا توجد مراكز تطابق الفلتر
          </p>
          <p className="mt-1 text-sm text-[#9f978e]">
            جرّب تغيير حالة الفلترة أو تعديل كلمات البحث
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {visible.map((hub) => (
            <article
              key={hub._id}
              className={`group rounded-[28px] border p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.07)] ${
                hub.isActive
                  ? "border-[#e8e2d9] bg-white"
                  : "border-[#e4dfd7] bg-[#fcfaf7]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black text-[#1f312f]">
                      {hub.name}
                    </h3>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                        hub.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {hub.isActive ? "● نشط" : "● معطّل"}
                    </span>

                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-600">
                      {hub.city}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#faf8f4] px-4 py-3">
                      <p className="mb-1 text-[11px] font-extrabold text-[#9b948c]">
                        العنوان
                      </p>
                      <p className="flex items-start gap-2 text-sm leading-6 text-[#5f5a54]">
                        <span className="material-symbols-outlined mt-0.5 text-[16px] text-[#9b948c]">
                          location_on
                        </span>
                        {hub.address}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#faf8f4] px-4 py-3">
                      <p className="mb-1 text-[11px] font-extrabold text-[#9b948c]">
                        ساعات العمل
                      </p>
                      <p className="flex items-start gap-2 text-sm leading-6 text-[#5f5a54]">
                        <span className="material-symbols-outlined mt-0.5 text-[16px] text-[#9b948c]">
                          schedule
                        </span>
                        {hub.workingHours}
                      </p>
                    </div>
                  </div>

                  {hub.coordinates && (
                    <a
                      href={`https://maps.google.com/?q=${hub.coordinates.lat},${hub.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-[11px] font-black text-primary transition-all duration-300 hover:bg-primary/10"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        open_in_new
                      </span>
                      فتح على خرائط Google
                    </a>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => openEdit(hub)}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3f0ea] text-[#68635d] transition-all duration-300 hover:bg-[#e9e3db]"
                    title="تعديل"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>

                  <button
                    onClick={() => toggleActive(hub)}
                    disabled={!!busy[hub._id]}
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 disabled:opacity-50 ${
                      hub.isActive
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                    title={hub.isActive ? "تعطيل المركز" : "تفعيل المركز"}
                  >
                    {busy[hub._id] ? (
                      <span className="block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">
                        {hub.isActive ? "pause_circle" : "play_circle"}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal !== "closed" && (
        <AccessibleDialog
          ariaLabel={modal === "add" ? "إضافة مركز جديد" : "تعديل المركز"}
          onClose={() => setModal("closed")}
          closeDisabled={formBusy}
          ariaBusy={formBusy}
          overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          panelClassName="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-[32px] border border-white/20 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]"
        >
            <div className="flex items-center justify-between border-b border-[#f0ebe4] px-6 py-5">
              <div>
                <h2 id="hub-form-title" className="text-lg font-black text-[#1f312f]">
                  {modal === "add" ? "إضافة مركز جديد" : "تعديل المركز"}
                </h2>
                <p className="mt-1 text-xs text-[#938b82]">
                  أدخل بيانات المركز بدقة لتسهيل إدارته وربطه بالموقع
                </p>
              </div>

              <button
                type="button"
                aria-label="إغلاق نافذة المركز"
                onClick={() => setModal("closed")}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f1eb] text-[#6e6860] transition-colors hover:bg-[#ece6de]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              {formErrors.length > 0 && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                  <div className="space-y-2">
                    {formErrors.map((e, i) => (
                      <p
                        key={i}
                        className="flex items-center gap-2 text-xs font-bold text-red-600"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          error
                        </span>
                        {e}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label htmlFor="hub-name" className="mb-1.5 block text-xs font-black text-[#6c665f]">
                    اسم المركز <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="hub-name"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="مثال: مركز الزرقاء الرئيسي"
                    className="w-full rounded-2xl border border-[#e5dfd6] bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-[#b3aba1] focus:border-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="hub-address" className="mb-1.5 block text-xs font-black text-[#6c665f]">
                    العنوان <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="hub-address"
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="مثال: شارع الملكة نور، بناية رقم 5"
                    className="w-full rounded-2xl border border-[#e5dfd6] bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-[#b3aba1] focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor="hub-city" className="mb-1.5 block text-xs font-black text-[#6c665f]">
                    المدينة <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="hub-city"
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    placeholder="مثال: عمان"
                    list="cities-datalist"
                    className="w-full rounded-2xl border border-[#e5dfd6] bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-[#b3aba1] focus:border-primary"
                  />
                  <datalist id="cities-datalist">
                    {availableCities.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label htmlFor="hub-hours" className="mb-1.5 block text-xs font-black text-[#6c665f]">
                    ساعات العمل
                  </label>
                  <input
                    id="hub-hours"
                    value={form.workingHours}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, workingHours: e.target.value }))
                    }
                    placeholder="9:00 ص — 5:00 م"
                    className="w-full rounded-2xl border border-[#e5dfd6] bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-[#b3aba1] focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor="hub-lat" className="mb-1.5 block text-xs font-black text-[#6c665f]">
                    خط العرض (Lat)
                  </label>
                  <input
                    id="hub-lat"
                    type="number"
                    min="-90"
                    max="90"
                    step="any"
                    value={form.lat}
                    onChange={(e) => setForm((p) => ({ ...p, lat: e.target.value }))}
                    placeholder="31.9539"
                    className="w-full rounded-2xl border border-[#e5dfd6] bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-[#b3aba1] focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor="hub-lng" className="mb-1.5 block text-xs font-black text-[#6c665f]">
                    خط الطول (Lng)
                  </label>
                  <input
                    id="hub-lng"
                    type="number"
                    min="-180"
                    max="180"
                    step="any"
                    value={form.lng}
                    onChange={(e) => setForm((p) => ({ ...p, lng: e.target.value }))}
                    placeholder="35.9106"
                    className="w-full rounded-2xl border border-[#e5dfd6] bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-[#b3aba1] focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setModal("closed")}
                  type="button"
                  className="flex-1 rounded-2xl border border-[#e2ddd5] py-3 text-sm font-black text-[#66615b] transition-all duration-300 hover:bg-[#faf8f4]"
                >
                  إلغاء
                </button>

                <button
                  onClick={saveForm}
                  type="button"
                  disabled={formBusy}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-black text-white transition-all duration-300 hover:bg-primary/90 disabled:opacity-60"
                >
                  {formBusy ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      جاري الحفظ...
                    </>
                  ) : modal === "add" ? (
                    "إضافة المركز"
                  ) : (
                    "حفظ التعديلات"
                  )}
                </button>
              </div>
            </div>
        </AccessibleDialog>
      )}
    </div>
  );
}
