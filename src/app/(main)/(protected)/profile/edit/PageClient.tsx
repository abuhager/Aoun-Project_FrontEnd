// src/app/(main)/(protected)/profile/edit/page.tsx
// ✅ FIX [SEC-PROF-01]  : PASSWORD_REGEX مطابق لـ strongPassword في authDto.js
// ✅ FIX [SEC-PROF-02]  : استخدام msg وليس message — مطابق لـ Backend
// ✅ FIX [DUP-PROF-02]  : عرض phone الحالي من user context عند فتح الصفحة
// ✅ FIX [HC-PROF-01]   : maxAvatarMB ديناميكي من /api/settings/public
// ✅ FIX [ARCH-PROF-01] : فحص isFullyLoaded قبل عرض البيانات
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { changeMyPassword, updateMyProfile } from "@/lib/api/profileApi";
import { extractErrorMsg } from "@/lib/api/apiError";
import { useSettings } from "@/hooks/useSettings";
import {
  isStrongPassword,
  PASSWORD_REQUIREMENTS_MESSAGE,
} from "@/lib/validation/auth";
import type { AuthUser } from "@/types/user.types";
import PageIntro from "@/components/ui/PageIntro";

type EditForm = {
  name:            string;
  phone:           string;
  currentPassword: string;
  newPassword:     string;
  confirmPassword: string;
};

export default function EditProfileClient() {
  // ✅ FIX [ARCH-PROF-01]: استخدام isFullyLoaded
  const { user, setUser, logout, isFullyLoaded, isLoading } = useAuth();
  const { settings } = useSettings();

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

  // ✅ FIX [HC-PROF-01]: حجم الصورة الأقصى ديناميكي
  const maxAvatarMB = settings?.maxAvatarSizeMb ?? 5;

  const fileInputRef                      = useRef<HTMLInputElement>(null);
  const avatarObjectUrlRef                = useRef<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);

  const revokeAvatarObjectUrl = () => {
    if (!avatarObjectUrlRef.current) return;
    URL.revokeObjectURL(avatarObjectUrlRef.current);
    avatarObjectUrlRef.current = null;
  };

  useEffect(() => () => {
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
      avatarObjectUrlRef.current = null;
    }
  }, []);

  // ✅ FIX [DUP-PROF-02]: عرض phone الحالي من user context
  useEffect(() => {
    if (!user) return;
    const typedUser = user as AuthUser;
    if (typedUser.name)   setForm(prev => ({ ...prev, name: typedUser.name }));
    if (typedUser.phone)  {
      // حذف +962 للعرض في حقل الإدخال (المستخدم يدخل الأرقام فقط)
      const cleanPhone = typedUser.phone.replace(/^\+962/, "");
      setForm(prev => ({ ...prev, phone: cleanPhone }));
    }
    if (typedUser.avatar) setAvatarPreview(typedUser.avatar);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(""); setSuccess("");
  };

  // ✅ FIX [HC-PROF-01]: استخدام maxAvatarMB الديناميكي
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("نوع الصورة غير مدعوم — اختر JPEG أو PNG أو WebP");
      e.target.value = "";
      return;
    }
    if (file.size > maxAvatarMB * 1024 * 1024) {
      setError(`حجم الصورة يجب أن يكون أقل من ${maxAvatarMB}MB`);
      e.target.value = "";
      return;
    }
    revokeAvatarObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    avatarObjectUrlRef.current = objectUrl;
    setAvatarFile(file);
    setAvatarPreview(objectUrl);
    setError("");
    setSuccess("");
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
      if (avatarFile)        fd.append("avatar", avatarFile);

      const updatedUser = await updateMyProfile(fd);
      setUser(updatedUser);
      setSuccess("تم تحديث المعلومات بنجاح ✓");
      setAvatarFile(null);
      revokeAvatarObjectUrl();
      setAvatarPreview(updatedUser.avatar ?? "");
    } catch (err: unknown) {
      // ✅ FIX [SEC-PROF-02]: extractMsg يبحث عن msg أولاً
      setError(extractErrorMsg(err, "حدث خطأ، حاول مجدداً"));
    } finally {
      setLoading(false);
    }
  };

  // ── تغيير كلمة المرور ──
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.currentPassword) { setError("أدخل كلمة المرور الحالية"); return; }

    // ✅ FIX [SEC-PROF-01]: فحص strongPassword مطابق للـ Backend
    if (!isStrongPassword(form.newPassword)) {
      setError(PASSWORD_REQUIREMENTS_MESSAGE);
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    setLoading(true); setError(""); setSuccess("");
    try {
      await changeMyPassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess("تم تغيير كلمة المرور بنجاح ✓ — سيتم تحويلك لتسجيل الدخول");
      setForm(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      window.setTimeout(() => void logout(), 900);
    } catch (err: unknown) {
      // ✅ FIX [SEC-PROF-02]
      setError(extractErrorMsg(err, "كلمة المرور الحالية غير صحيحة"));
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX [ARCH-PROF-01]: انتظر اكتمال تحميل بيانات المستخدم
  if (isLoading || !mounted) {
    return (
      <div className="flex justify-center items-center min-h-dvh">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  if (!isFullyLoaded && !user) {
    return (
      <div className="flex justify-center items-center min-h-dvh">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="page-shell pb-16 pt-20" dir="rtl">
      <div className="site-container space-y-6 md:pt-4">

        {/* Back */}
        <Link
          href="/dashboard"
          className="group inline-flex items-center gap-1.5 text-sm font-bold text-on-surface-variant transition-colors hover:text-primary"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
            arrow_forward
          </span>
          العودة للوحة التحكم
        </Link>

        <PageIntro
          eyebrow="إعدادات الحساب"
          title="تعديل الملف الشخصي"
          description="حدّث بيانات التواصل وصورتك، أو غيّر كلمة المرور من مساحة واحدة واضحة وآمنة."
          icon="manage_accounts"
          tone="ink"
          actions={
            <div className="flex items-center gap-3 rounded-[18px] border border-white/12 bg-white/[0.08] p-2.5 pl-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-[14px] border border-white/15 bg-white/10">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="معاينة الصورة الشخصية" className="h-full w-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined flex h-full w-full items-center justify-center text-4xl text-white/75" style={{ fontVariationSettings: "'FILL' 1" }}>
                    account_circle
                  </span>
                )}
                <button
                  type="button"
                  aria-label="اختيار صورة شخصية"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-end justify-end bg-black/0 p-1.5 text-white hover:bg-black/20"
                >
                  <span className="material-symbols-outlined rounded-lg bg-black/45 p-1 text-[15px]">photo_camera</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="min-w-0">
                <p className="max-w-48 truncate text-xs font-black text-white" suppressHydrationWarning>
                  {mounted ? (user?.email ?? "") : ""}
                </p>
                <p className="mt-1 text-[10px] font-bold text-white/55">
                  {avatarFile ? "صورة جديدة جاهزة للحفظ" : `JPEG أو PNG أو WebP · حتى ${maxAvatarMB}MB`}
                </p>
              </div>
            </div>
          }
        />

        <div className="grid items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="content-panel p-2 lg:sticky lg:top-24">
            <p className="px-3 pb-2 pt-2 text-[10px] font-black tracking-[0.12em] text-on-surface-soft">
              أقسام الحساب
            </p>

        {/* Tabs */}
        <div className="flex gap-1 lg:flex-col">
          {([
            { key: "info",     label: "المعلومات الشخصية", icon: "person" },
            { key: "password", label: "كلمة المرور",        icon: "lock"   },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setError(""); setSuccess(""); }}
              className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-all lg:justify-start ${
                activeTab === tab.key
                  ? "bg-primary text-white shadow-[0_8px_20px_rgba(0,117,107,0.2)]"
                  : "text-on-surface-variant hover:bg-primary-softer hover:text-primary"
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
            <div className="mt-2 hidden rounded-xl bg-surface-container-low p-3 text-[11px] leading-6 text-on-surface-soft lg:block">
              <span className="material-symbols-outlined mb-2 block text-[19px] text-primary">shield_lock</span>
              لا نعرض رقم هاتفك أو بريدك ضمن الملف العام.
            </div>
          </aside>

          <div className="min-w-0">

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
        <div className="content-panel overflow-hidden">

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
                className="btn-primary w-full rounded-xl py-3.5 text-sm active:scale-[0.99]"
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
                <label className="text-xs font-black text-on-surface-variant">
                  كلمة المرور الجديدة
                  <span className="text-[10px] text-on-surface-variant/60 font-medium mr-2">
                    (8 أحرف+ • كبير وصغير • رقم)
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-outline">lock_reset</span>
                  <input
                    name="newPassword" type="password" required dir="ltr"
                    value={form.newPassword} onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pr-12 pl-4 py-3.5 bg-surface-container-highest rounded-xl border-2 border-transparent outline-none focus:border-primary/30 focus:bg-white transition-all text-sm text-left"
                  />
                </div>
                {/* مؤشر القوة مطابق لقواعد الخادم المشتركة */}
                {form.newPassword && (() => {
                  const checks = {
                    length:  form.newPassword.length >= 8,
                    upper:   /[A-Z]/.test(form.newPassword),
                    lower:   /[a-z]/.test(form.newPassword),
                    digit:   /\d/.test(form.newPassword),
                  };
                  const score = Object.values(checks).filter(Boolean).length;
                  const labels = ["", "ضعيفة", "متوسطة", "جيدة", "قوية"];
                  const colors = ["", "bg-red-400", "bg-orange-400", "bg-blue-400", "bg-green-500"];
                  return (
                    <div className="space-y-1 mt-1">
                      <div className="flex gap-1">
                        {[1,2,3,4].map(n => (
                          <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${n <= score ? colors[score] : "bg-gray-200"}`} />
                        ))}
                        <span className="text-[10px] font-bold text-on-surface-variant mr-1">{labels[score]}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* تأكيد كلمة المرور */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-on-surface-variant">تأكيد كلمة المرور الجديدة</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-outline">verified</span>
                  <input
                    name="confirmPassword" type="password" required dir="ltr"
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
                className="btn-primary w-full rounded-xl py-3.5 text-sm active:scale-[0.99]"
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
        <div className="mt-5 rounded-[16px] border border-red-100 bg-red-50 p-4">
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
      </div>
    </div>
  );
}
