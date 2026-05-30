// src/app/(main)/(protected)/profile/edit/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/api/axiosInstance";

type EditForm = {
  name:            string;
  phone:           string;
  currentPassword: string;
  newPassword:     string;
  confirmPassword: string;
};

export default function EditProfilePage() {
  const { user, setUser } = useAuth();

  // ── mounted guard — prevents hydration mismatch ──
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [form, setForm] = useState<EditForm>({
    name:            "",
    phone:           "",
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });

  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState("");
  const [error, setError]         = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");

  const fileInputRef                      = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);

  // sync user data after mount (client-only)
  useEffect(() => {
    if (!user) return;
    if (user.name)   setForm(prev => ({ ...prev, name: user.name }));
    if (user.avatar) setAvatarPreview(user.avatar);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(""); setSuccess("");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("حجم الصورة يجب أن يكون أقل من 5MB"); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── حفظ المعلومات ──
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("الاسم مطلوب"); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      if (form.phone.trim()) fd.append("phone", form.phone.trim());
      if (avatarFile) fd.append("avatar", avatarFile);
      const { data } = await axiosInstance.put("/api/auth/me", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setUser(data.user ?? data);
      setSuccess("تم تحديث المعلومات بنجاح ✓");
      setAvatarFile(null);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any)?.response?.data?.message ?? "حدث خطأ، حاول مجدداً");
    } finally {
      setLoading(false);
    }
  };

  // ── تغيير كلمة المرور ──
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.currentPassword) { setError("أدخل كلمة المرور الحالية"); return; }
    if (form.newPassword.length < 6) { setError("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل"); return; }
    if (form.newPassword !== form.confirmPassword) { setError("كلمتا المرور غير متطابقتين"); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      await axiosInstance.put("/api/auth/me/password",
        { currentPassword: form.currentPassword, newPassword: form.newPassword },
        { withCredentials: true }
      );
      setSuccess("تم تغيير كلمة المرور بنجاح ✓");
      setForm(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any)?.response?.data?.message ?? "كلمة المرور الحالية غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-20 md:pt-24 pb-12 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors mb-6 group"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
            arrow_forward
          </span>
          العودة للوحة التحكم
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/15 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    account_circle
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1.5 -left-1.5 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">photo_camera</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div>
            <h1 className="text-2xl font-black text-[#191c1d]">تعديل الملف الشخصي</h1>
            {/* suppressHydrationWarning: email is client-only (from AuthContext) */}
            <p className="text-sm text-on-surface-variant mt-0.5" suppressHydrationWarning>
              {mounted ? (user?.email ?? "") : ""}
            </p>
            {avatarFile && (
              <span className="text-xs text-primary font-bold mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                صورة جديدة جاهزة للرفع
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-surface-container-highest rounded-2xl p-1 mb-6">
          {([
            { key: "info",     label: "المعلومات الشخصية", icon: "person" },
            { key: "password", label: "كلمة المرور",        icon: "lock"   },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setError(""); setSuccess(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? "bg-white text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: activeTab === tab.key ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5">error</span>
            <p className="text-sm font-bold text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2">
            <span className="material-symbols-outlined text-green-600 text-[18px] mt-0.5">check_circle</span>
            <p className="text-sm font-bold text-green-700">{success}</p>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#edeeef] overflow-hidden">

          {/* ── Tab: المعلومات ── */}
          {activeTab === "info" && (
            <form onSubmit={handleSaveInfo} className="p-6 space-y-5">

              {/* الاسم */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-on-surface-variant">الاسم الكامل</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-outline">badge</span>
                  <input
                    name="name" type="text" required
                    value={form.name} onChange={handleChange}
                    placeholder="الاسم الثلاثي"
                    className="w-full pr-12 pl-4 py-3.5 bg-surface-container-highest rounded-xl border-2 border-transparent outline-none focus:border-primary/30 focus:bg-white transition-all text-sm font-bold"
                  />
                </div>
              </div>

              {/* الإيميل — للعرض فقط */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-on-surface-variant flex items-center gap-2">
                  البريد الإلكتروني
                  <span className="text-[10px] text-orange-400 font-bold bg-orange-50 px-2 py-0.5 rounded-full">غير قابل للتعديل</span>
                </label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-outline">mail</span>
                  <input
                    type="email"
                    value={mounted ? (user?.email ?? "") : ""}
                    disabled dir="ltr"
                    suppressHydrationWarning
                    className="w-full pr-12 pl-4 py-3.5 bg-gray-50 rounded-xl border-2 border-transparent text-sm font-bold text-gray-400 cursor-not-allowed text-left"
                  />
                </div>
              </div>

              {/* رقم الهاتف */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-on-surface-variant">رقم الهاتف (اختياري)</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-outline">call</span>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg pointer-events-none select-none">
                    <span className="text-xs">🇯🇴</span>
                    <span className="text-xs font-black text-gray-500" dir="ltr">+962</span>
                  </div>
                  <input
                    name="phone" type="tel" dir="ltr" inputMode="numeric" maxLength={9}
                    value={form.phone}
                    onChange={e => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                      setForm(prev => ({ ...prev, phone: digits }));
                    }}
                    placeholder="7XXXXXXXX"
                    className="w-full pr-12 pl-[72px] py-3.5 bg-surface-container-highest rounded-xl border-2 border-transparent outline-none focus:border-primary/30 focus:bg-white transition-all text-sm font-bold text-left tracking-wide"
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3.5 bg-primary text-white rounded-full font-bold text-sm shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>جاري الحفظ...</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">save</span>حفظ التغييرات</>
                )}
              </button>
            </form>
          )}

          {/* ── Tab: كلمة المرور ── */}
          {activeTab === "password" && (
            <form onSubmit={handleChangePassword} className="p-6 space-y-5">

              {/* كلمة المرور الحالية */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-on-surface-variant">كلمة المرور الحالية</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-outline">lock</span>
                  <input
                    name="currentPassword" type="password" required dir="ltr"
                    value={form.currentPassword} onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pr-12 pl-4 py-3.5 bg-surface-container-highest rounded-xl border-2 border-transparent outline-none focus:border-primary/30 focus:bg-white transition-all text-sm text-left"
                  />
                </div>
              </div>

              {/* كلمة المرور الجديدة */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-on-surface-variant">كلمة المرور الجديدة</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-outline">lock_reset</span>
                  <input
                    name="newPassword" type="password" required dir="ltr" minLength={6}
                    value={form.newPassword} onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pr-12 pl-4 py-3.5 bg-surface-container-highest rounded-xl border-2 border-transparent outline-none focus:border-primary/30 focus:bg-white transition-all text-sm text-left"
                  />
                </div>
                {/* مؤشر القوة */}
                {form.newPassword && (
                  <div className="flex items-center gap-1.5 mt-1">
                    {[4, 6, 8, 10].map(n => (
                      <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${form.newPassword.length >= n ? "bg-primary" : "bg-gray-200"}`} />
                    ))}
                    <span className="text-[10px] font-bold text-on-surface-variant mr-1">
                      {form.newPassword.length < 6 ? "ضعيفة" : form.newPassword.length < 8 ? "متوسطة" : "قوية"}
                    </span>
                  </div>
                )}
              </div>

              {/* تأكيد كلمة المرور */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-on-surface-variant">تأكيد كلمة المرور الجديدة</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-outline">verified</span>
                  <input
                    name="confirmPassword" type="password" required dir="ltr" minLength={6}
                    value={form.confirmPassword} onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pr-12 pl-4 py-3.5 bg-surface-container-highest rounded-xl border-2 outline-none transition-all text-sm text-left ${
                      form.confirmPassword && form.newPassword !== form.confirmPassword
                        ? "border-red-300 focus:border-red-400"
                        : form.confirmPassword && form.newPassword === form.confirmPassword
                        ? "border-green-400"
                        : "border-transparent focus:border-primary/30 focus:bg-white"
                    }`}
                  />
                </div>
                {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                  <p className="text-[11px] text-red-500 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">error</span>كلمتا المرور غير متطابقتين
                  </p>
                )}
                {form.confirmPassword && form.newPassword === form.confirmPassword && (
                  <p className="text-[11px] text-green-500 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>كلمتا المرور متطابقتان
                  </p>
                )}
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3.5 bg-primary text-white rounded-full font-bold text-sm shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>جاري التغيير...</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">key</span>تغيير كلمة المرور</>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Danger Zone */}
        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
          <p className="text-xs font-black text-red-600 mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">warning</span>منطقة الخطر
          </p>
          <p className="text-xs text-red-400 mb-3">حذف الحساب سيؤدي إلى فقدان جميع بياناتك بشكل دائم.</p>
          <button
            type="button"
            className="text-xs font-bold text-red-500 hover:text-red-700 underline underline-offset-2 transition-colors"
            onClick={() => alert("تواصل مع الدعم لحذف الحساب")}
          >
            طلب حذف الحساب
          </button>
        </div>

      </div>
    </div>
  );
}