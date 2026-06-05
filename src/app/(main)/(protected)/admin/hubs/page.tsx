// src/app/(main)/(protected)/admin/hubs/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import axiosInstance from "@/lib/api/axiosInstance";
import { useToast } from "@/hooks/useToast";

interface SafeHub {
  _id:         string;
  name:        string;
  address:     string;
  city:        string;
  workingHours:string;
  isActive:    boolean;
  coordinates?:{ lat: number; lng: number };
  createdAt:   string;
}

const EMPTY_FORM = {
  name: "", address: "", city: "", workingHours: "9:00 ص — 5:00 م",
  lat: "", lng: "",
};

const JORDAN_CITIES = [
  "عمان","الزرقاء","إربد","العقبة","السلط","مادبا","جرش","الكرك",
  "المفرق","عجلون","الطفيلة","معان","رام الله","نابلس",
];

export default function AdminHubsPage() {
  const [hubs,    setHubs]    = useState<SafeHub[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy,    setBusy]    = useState<Record<string,boolean>>({});
  const [filter,  setFilter]  = useState<"all"|"active"|"inactive">("all");
  const [search,  setSearch]  = useState("");

  const [modal,      setModal]     = useState<"closed"|"add"|"edit">("closed");
  const [editTarget, setEditTarget]= useState<SafeHub|null>(null);
  const [form,       setForm]      = useState(EMPTY_FORM);
  const [formBusy,   setFormBusy]  = useState(false);
  const [formErrors, setFormErrors]= useState<string[]>([]);

  const { show: showToast, ToastComponent } = useToast();

  const loadHubs = useCallback(async (loader=true) => {
    if (loader) setLoading(true);
    try {
      const r = await axiosInstance.get("/api/hubs/admin/all");
      setHubs(Array.isArray(r.data) ? r.data : (r.data.hubs ?? []));
    } catch {
      showToast("تعذر تحميل مراكز التسليم", false);
    } finally { // ✅ تم إصلاح الإملاء هنا
      if (loader) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadHubs();
  }, [loadHubs]);

  const visible = hubs.filter(h => {
    const matchFilter =
      filter === "all" ? true :
      filter === "active" ? h.isActive : !h.isActive;
    const matchSearch =
      h.name.includes(search) || h.city.includes(search) || h.address.includes(search);
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

  const saveForm = async () => {
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
        await axiosInstance.post("/api/hubs", payload);
        showToast("✅ تم إضافة المركز بنجاح", true);
      } else {
        await axiosInstance.patch(`/api/hubs/${editTarget!._id}`, payload);
        showToast("✅ تم تحديث المركز بنجاح", true);
      }
      setModal("closed");
      await loadHubs(false);
    } catch (err) {
      let msg = "حدث خطأ أثناء حفظ البيانات";
      if (err && typeof err === "object" && "isAxiosError" in err) {
        const axiosError = err as { response?: { data?: { msg?: string } } };
        msg = axiosError.response?.data?.msg || msg;
      }
      showToast(msg, false);
    } finally { // ✅ تم إصلاح الإملاء هنا
      setFormBusy(false);
    }
  };

  const toggleActive = async (hub: SafeHub) => {
    if (busy[hub._id]) return;
    setBusy(p => ({ ...p, [hub._id]: true }));
    try {
      if (hub.isActive) {
        await axiosInstance.delete(`/api/hubs/${hub._id}`);
        showToast("⏸ تم تعطيل المركز بنجاح", true);
      } else {
        await axiosInstance.patch(`/api/hubs/${hub._id}`, { isActive: true });
        showToast("✅ تم تفعيل المركز بنجاح", true);
      }
      await loadHubs(false);
    } catch {
      showToast("حدث خطأ أثناء تحديث حالة المركز", false);
    } finally { // ✅ تم إصلاح الإملاء هنا
      setBusy(p => ({ ...p, [hub._id]: false }));
    }
  };

  const activeCount   = hubs.filter(h => h.isActive).length;
  const inactiveCount = hubs.filter(h => !h.isActive).length;
  const cities        = [...new Set(hubs.map(h => h.city))].length;

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
          إضافة micro-hub جديد
        </button>
      </div>

      {/* ── بطاقات الإحصاء ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:"نشط",    value: activeCount,   color:"text-green-600 bg-green-50",  icon:"check_circle" },
          { label:"معطّل",  value: inactiveCount, color:"text-red-500 bg-red-50",      icon:"cancel"       },
          { label:"مدينة",  value: cities,         color:"text-blue-600 bg-blue-50",    icon:"location_city"},
        ].map(c => (
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
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث باسم المركز أو المدينة..."
            className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5
              text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {(["all","active","inactive"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-colors
                ${filter === f ? "bg-primary text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
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
          {visible.map(hub => (
            <div key={hub._id}
              className={`bg-white rounded-2xl border shadow-sm p-5 transition-all
                ${hub.isActive ? "border-gray-100" : "border-gray-200 bg-gray-50/50 opacity-70"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-gray-900 text-sm">{hub.name}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full
                      ${hub.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
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
                      className="text-[10px] text-primary font-bold flex items-center gap-0.5 hover:underline w-fit"
                    >
                      <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                      عرض على الخريطة
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(hub)}
                    className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    title="تعديل"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>

                  <button
                    onClick={() => toggleActive(hub)}
                    disabled={!!busy[hub._id]}
                    className={`p-2 rounded-xl transition-colors disabled:opacity-50
                      ${hub.isActive ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                    title={hub.isActive ? "تعطيل" : "تفعيل"}
                  >
                    <span className="material-symbols-outlined text-base">
                      {busy[hub._id] ? "progress_activity" : hub.isActive ? "pause_circle" : "play_circle"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {modal !== "closed" && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModal("closed")}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
              <h2 className="font-black text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">
                  {modal === "add" ? "add_location_alt" : "edit_location_alt"}
                </span>
                {modal === "add" ? "إضافة مركز جديد" : "تعديل المركز"}
              </h2>
              <button onClick={() => setModal("closed")} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined text-gray-400">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              {formErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
                  {formErrors.map((e, i) => (
                    <p key={i} className="text-xs text-red-600 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>{e}
                    </p>
                  ))}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-700">اسم المركز *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="مثال: مركز الزرقاء الرئيسي"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-700">المدينة *</label>
                <select
                  value={form.city}
                  onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
                >
                  <option value="">اختر المدينة</option>
                  {JORDAN_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-700">العنوان التفصيلي *</label>
                <input
                  value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="مثال: شارع الملك طلال، مقابل البريد"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-700">ساعات العمل</label>
                <input
                  value={form.workingHours}
                  onChange={e => setForm(p => ({ ...p, workingHours: e.target.value }))}
                  placeholder="مثال: 9:00 ص — 5:00 م"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-gray-400">my_location</span>
                  الإحداثيات (اختياري)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    value={form.lat}
                    onChange={e => setForm(p => ({ ...p, lat: e.target.value }))}
                    placeholder="خط العرض"
                    className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <input
                    type="number"
                    step="any"
                    value={form.lng}
                    onChange={e => setForm(p => ({ ...p, lng: e.target.value }))}
                    placeholder="خط الطول"
                    className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 flex gap-3">
              <button
                onClick={() => setModal("closed")}
                disabled={formBusy}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-500 text-sm font-black hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={saveForm}
                disabled={formBusy}
                className="flex-1 py-3 bg-primary text-white rounded-2xl text-sm font-black hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {formBusy ? (
                  <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> جاري الحفظ...</>
                ) : (
                  <><span className="material-symbols-outlined text-sm">save</span> {modal === "add" ? "إضافة" : "حفظ التعديلات"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}