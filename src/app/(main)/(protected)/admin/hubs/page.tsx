// src/app/(main)/(protected)/admin/hubs/page.tsx
// ✅ PATCHED [BUG-02 | SEC-03 | LOGIC-03]
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useToast }        from "@/hooks/useToast";
import type { SafeHub }    from "@/types/hub.types";
// ✅ BUG-02: استيراد من طبقة hubApi بدل axiosInstance مباشرةً
import {
  getAllHubsAdmin,
  createHub,
  updateHub,
  deactivateHub,
  reactivateHub,
} from "@/lib/api/hubApi";

// ✅ SEC-03: حُذف JORDAN_CITIES الـ hardcoded — المدن تُستخرج من البيانات الفعلية

// ── helper لاستخراج رسالة الخطأ من Axios ────────────────────────────────────
function extractErrorMsg(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const e = err as { response?: { data?: { msg?: string; message?: string } } };
    return e.response?.data?.msg || e.response?.data?.message || fallback;
  }
  return fallback;
}

const EMPTY_FORM = {
  name: "", address: "", city: "", workingHours: "9:00 ص — 5:00 م",
  lat: "", lng: "",
};

export default function AdminHubsPage() {
  const [hubs,    setHubs]    = useState<SafeHub[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy,    setBusy]    = useState<Record<string, boolean>>({});
  const [filter,  setFilter]  = useState<"all" | "active" | "inactive">("all");
  const [search,  setSearch]  = useState("");

  const [modal,       setModal]      = useState<"closed" | "add" | "edit">("closed");
  const [editTarget,  setEditTarget] = useState<SafeHub | null>(null);
  const [form,        setForm]       = useState(EMPTY_FORM);
  const [formBusy,    setFormBusy]   = useState(false);
  const [formErrors,  setFormErrors] = useState<string[]>([]);

  const { show: showToast, ToastComponent } = useToast();

  // ── تحميل البيانات ──────────────────────────────────────────────────────────
  const loadHubs = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      // ✅ BUG-02: بدل axiosInstance.get("/api/hubs/admin/all")
      const data = await getAllHubsAdmin();
      setHubs(data);
    } catch {
      showToast("تعذر تحميل مراكز التسليم", false);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadHubs(); }, [loadHubs]);

  // ✅ SEC-03: المدن مستخرجة ديناميكياً من البيانات — لا JORDAN_CITIES hardcoded
  const availableCities = useMemo(
    () => [...new Set(hubs.map((h) => h.city))].sort(),
    [hubs]
  );

  // ── فلترة العرض ─────────────────────────────────────────────────────────────
  const visible = hubs.filter((h) => {
    const matchFilter =
      filter === "all"      ? true :
      filter === "active"   ? h.isActive : !h.isActive;
    const matchSearch =
      h.name.includes(search) ||
      h.city.includes(search) ||
      h.address.includes(search);
    return matchFilter && matchSearch;
  });

  // ── فتح Modal الإضافة ────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormErrors([]);
    setEditTarget(null);
    setModal("add");
  };

  // ── فتح Modal التعديل ────────────────────────────────────────────────────────
  const openEdit = (hub: SafeHub) => {
    setForm({
      name:         hub.name,
      address:      hub.address,
      city:         hub.city,
      workingHours: hub.workingHours,
      lat:          hub.coordinates?.lat?.toString() ?? "",
      lng:          hub.coordinates?.lng?.toString() ?? "",
    });
    setFormErrors([]);
    setEditTarget(hub);
    setModal("edit");
  };

  // ── حفظ النموذج (إضافة أو تعديل) ───────────────────────────────────────────
  const saveForm = async () => {
    // Validation محلي سريع
    const errors: string[] = [];
    if (!form.name.trim())    errors.push("اسم المركز مطلوب");
    if (!form.address.trim()) errors.push("العنوان مطلوب");
    if (!form.city.trim())    errors.push("المدينة مطلوبة");
    if (errors.length) { setFormErrors(errors); return; }

    setFormBusy(true);
    setFormErrors([]);

    const payload = {
      name:         form.name.trim(),
      address:      form.address.trim(),
      city:         form.city.trim(),
      workingHours: form.workingHours.trim(),
      ...(form.lat && form.lng
        ? { coordinates: { lat: parseFloat(form.lat), lng: parseFloat(form.lng) } }
        : {}),
    };

    try {
      if (modal === "add") {
        // ✅ BUG-02: بدل axiosInstance.post("/api/hubs", payload)
        await createHub(payload as Parameters<typeof createHub>[0]);
        showToast("✅ تم إضافة المركز بنجاح", true);
      } else {
        // ✅ BUG-02: بدل axiosInstance.patch(`/api/hubs/${editTarget!._id}`, payload)
        await updateHub(editTarget!._id, payload);
        showToast("✅ تم تحديث المركز بنجاح", true);
      }
      setModal("closed");
      await loadHubs(false);
    } catch (err) {
      showToast(extractErrorMsg(err, "حدث خطأ أثناء حفظ البيانات"), false);
    } finally {
      setFormBusy(false);
    }
  };

  // ── تبديل حالة المركز (تعطيل / تفعيل) ─────────────────────────────────────
  const toggleActive = async (hub: SafeHub) => {
    if (busy[hub._id]) return;
    setBusy((p) => ({ ...p, [hub._id]: true }));
    try {
      if (hub.isActive) {
        // ✅ BUG-02: بدل axiosInstance.delete(...)
        await deactivateHub(hub._id);
        showToast("⏸ تم تعطيل المركز بنجاح", true);
      } else {
        // ✅ BUG-02: بدل axiosInstance.patch(..., { isActive: true })
        // يستخدم الآن PATCH /:id/reactivate الصحيح
        await reactivateHub(hub._id);
        showToast("✅ تم تفعيل المركز بنجاح", true);
      }
      await loadHubs(false);
    } catch (err) {
      // ✅ LOGIC-01 cascade: نعرض رسالة الـ Backend (مثل: "يوجد 3 عنصر نشط مرتبط به")
      showToast(extractErrorMsg(err, "حدث خطأ أثناء تحديث حالة المركز"), false);
    } finally {
      setBusy((p) => ({ ...p, [hub._id]: false }));
    }
  };

  // ── إحصاءات ─────────────────────────────────────────────────────────────────
  const activeCount   = hubs.filter((h) => h.isActive).length;
  const inactiveCount = hubs.filter((h) => !h.isActive).length;
  const cityCount     = availableCities.length; // ✅ SEC-03: من البيانات الفعلية

  return (
    <div className="space-y-6" dir="rtl">
      {ToastComponent}

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-black flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">warehouse</span>
          مراكز التسليم — Safe Hubs
        </h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5
            rounded-2xl text-sm font-black hover:bg-primary/90 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-base">add_location_alt</span>
          إضافة مركز جديد
        </button>
      </div>

      {/* ── بطاقات الإحصاء ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "نشط",    value: activeCount,   color: "text-green-600 bg-green-50",  icon: "check_circle"  },
          { label: "معطّل",  value: inactiveCount, color: "text-red-500 bg-red-50",      icon: "cancel"        },
          { label: "مدينة",  value: cityCount,     color: "text-blue-600 bg-blue-50",    icon: "location_city" },
        ].map((c) => (
          <div key={c.label} className={`rounded-2xl p-4 text-center space-y-1 ${c.color}`}>
            <span className="material-symbols-outlined text-2xl">{c.icon}</span>
            <p className="text-2xl font-black">{c.value}</p>
            <p className="text-xs font-bold opacity-70">{c.label}</p>
          </div>
        ))}
      </div>

      {/* ── بحث + فلتر ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2
            text-gray-400 text-lg pointer-events-none">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم المركز أو المدينة..."
            className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5
              text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-colors
                ${filter === f
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
            >
              {f === "all" ? "الكل" : f === "active" ? "نشط" : "معطّل"}
            </button>
          ))}
        </div>
      </div>

      {/* ── قائمة المراكز ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <span className="material-symbols-outlined text-4xl text-gray-300 block mb-2">warehouse</span>
          <p className="text-gray-400 text-sm font-bold">لا توجد مراكز تطابق الفلتر</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((hub) => (
            <div
              key={hub._id}
              className={`bg-white rounded-2xl border shadow-sm p-5 transition-all
                ${hub.isActive ? "border-gray-100" : "border-gray-200 bg-gray-50/50 opacity-70"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-gray-900 text-sm">{hub.name}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full
                      ${hub.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-500"
                      }`}>
                      {hub.isActive ? "● نشط" : "● معطّل"}
                    </span>
                    <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">
                      {hub.city}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-gray-400">location_on</span>
                    {hub.address}
                  </p>

                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-gray-400">schedule</span>
                    {hub.workingHours}
                  </p>

                  {hub.coordinates?.lat && (
                    <a
                      href={`https://maps.google.com/?q=${hub.coordinates.lat},${hub.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-primary/70
                        hover:text-primary transition-colors font-bold"
                    >
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                      خرائط Google
                    </a>
                  )}
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(hub)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200
                      text-gray-600 transition-colors"
                    title="تعديل"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>

                  <button
                    onClick={() => toggleActive(hub)}
                    disabled={!!busy[hub._id]}
                    className={`p-2 rounded-xl transition-colors disabled:opacity-50
                      ${hub.isActive
                        ? "bg-red-50 hover:bg-red-100 text-red-500"
                        : "bg-green-50 hover:bg-green-100 text-green-600"
                      }`}
                    title={hub.isActive ? "تعطيل المركز" : "تفعيل المركز"}
                  >
                    {busy[hub._id] ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent
                        rounded-full animate-spin block" />
                    ) : (
                      <span className="material-symbols-outlined text-base">
                        {hub.isActive ? "pause_circle" : "play_circle"}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal الإضافة / التعديل ── */}
      {modal !== "closed" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5"
            dir="rtl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900">
                {modal === "add" ? "➕ إضافة مركز جديد" : "✏️ تعديل المركز"}
              </h2>
              <button
                onClick={() => setModal("closed")}
                className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <span className="material-symbols-outlined text-gray-500">close</span>
              </button>
            </div>

            {/* أخطاء الـ validation */}
            {formErrors.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 space-y-1">
                {formErrors.map((e, i) => (
                  <p key={i} className="text-xs text-red-600 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {e}
                  </p>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {/* الاسم */}
              <div>
                <label className="block text-xs font-black text-gray-700 mb-1.5">
                  اسم المركز <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="مثال: مركز الزرقاء الرئيسي"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                    focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* العنوان */}
              <div>
                <label className="block text-xs font-black text-gray-700 mb-1.5">
                  العنوان <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="مثال: شارع الملكة نور، بناية رقم 5"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                    focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* المدينة */}
              <div>
                <label className="block text-xs font-black text-gray-700 mb-1.5">
                  المدينة <span className="text-red-500">*</span>
                </label>
                {/* ✅ SEC-03: input نصي حر بدل قائمة hardcoded */}
                <input
                  value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  placeholder="مثال: عمان"
                  list="cities-datalist"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                    focus:outline-none focus:border-primary transition-colors"
                />
                {/* ✅ SEC-03: اقتراحات ديناميكية من المدن الموجودة فعلاً */}
                <datalist id="cities-datalist">
                  {availableCities.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              {/* ساعات العمل */}
              <div>
                <label className="block text-xs font-black text-gray-700 mb-1.5">
                  ساعات العمل
                </label>
                <input
                  value={form.workingHours}
                  onChange={(e) => setForm((p) => ({ ...p, workingHours: e.target.value }))}
                  placeholder="9:00 ص — 5:00 م"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                    focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* الإحداثيات (اختياري) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5">
                    خط العرض (Lat)
                  </label>
                  <input
                    type="number"
                    value={form.lat}
                    onChange={(e) => setForm((p) => ({ ...p, lat: e.target.value }))}
                    placeholder="31.9539"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                      focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5">
                    خط الطول (Lng)
                  </label>
                  <input
                    type="number"
                    value={form.lng}
                    onChange={(e) => setForm((p) => ({ ...p, lng: e.target.value }))}
                    placeholder="35.9106"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                      focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* أزرار الحفظ / الإلغاء */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setModal("closed")}
                className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-sm
                  font-black text-gray-600 hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={saveForm}
                disabled={formBusy}
                className="flex-1 py-2.5 rounded-2xl bg-primary text-white text-sm
                  font-black hover:bg-primary/90 transition-colors disabled:opacity-60
                  flex items-center justify-center gap-2"
              >
                {formBusy ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent
                      rounded-full animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  modal === "add" ? "إضافة المركز" : "حفظ التعديلات"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}