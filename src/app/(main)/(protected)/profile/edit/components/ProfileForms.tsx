"use client";

import type { EditProfileController } from "../hooks/useEditProfile";

type Props = Pick<
  EditProfileController,
  | "user"
  | "mounted"
  | "form"
  | "loading"
  | "success"
  | "error"
  | "activeTab"
  | "handleChange"
  | "handlePhoneChange"
  | "handleSaveInfo"
  | "handleChangePassword"
>;

const INPUT_CLASS =
  "w-full rounded-xl border-2 border-transparent bg-surface-container-highest py-3.5 pr-12 pl-4 text-sm outline-none transition-all focus:border-primary/30 focus:bg-white";

export function ProfileForms(props: Props) {
  return (
    <div className="min-w-0">
      <ProfileStatus error={props.error} success={props.success} />
      <div className="content-panel overflow-hidden">
        {props.activeTab === "info" ? <InfoForm {...props} /> : <PasswordForm {...props} />}
      </div>
      <DangerZone />
    </div>
  );
}

function ProfileStatus({ error, success }: { error: string; success: string }) {
  if (!error && !success) return null;
  const isError = Boolean(error);
  return (
    <div className={`mb-4 flex items-start gap-2 rounded-xl border p-3.5 ${isError ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`} role={isError ? "alert" : "status"}>
      <span className={`material-symbols-outlined mt-0.5 text-[18px] ${isError ? "text-red-500" : "text-green-600"}`}>
        {isError ? "error" : "check_circle"}
      </span>
      <p className={`text-sm font-bold ${isError ? "text-red-600" : "text-green-700"}`}>{error || success}</p>
    </div>
  );
}

function InfoForm(props: Props) {
  return (
    <form onSubmit={props.handleSaveInfo} className="space-y-5 p-6">
      <Field label="الاسم الكامل" icon="badge">
        <input name="name" type="text" required value={props.form.name} onChange={props.handleChange} placeholder="الاسم الثلاثي" className={`${INPUT_CLASS} font-bold`} />
      </Field>

      <Field
        label={
          <>
            البريد الإلكتروني
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-400">غير قابل للتعديل</span>
          </>
        }
        icon="mail"
      >
        <input type="email" value={props.mounted ? (props.user?.email ?? "") : ""} disabled dir="ltr" suppressHydrationWarning className="w-full cursor-not-allowed rounded-xl border-2 border-transparent bg-gray-50 py-3.5 pr-12 pl-4 text-left text-sm font-bold text-gray-400" />
      </Field>

      <Field label="رقم الهاتف (اختياري)" icon="call">
        <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 select-none">
          <span className="text-xs">🇯🇴</span>
          <span className="text-xs font-black text-gray-500" dir="ltr">+962</span>
        </div>
        <input name="phone" type="tel" dir="ltr" inputMode="numeric" maxLength={9} value={props.form.phone} onChange={props.handlePhoneChange} placeholder="7XXXXXXXX" className={`${INPUT_CLASS} pl-[72px] text-left font-bold tracking-wide`} />
      </Field>

      <SubmitButton loading={props.loading} loadingLabel="جاري الحفظ..." icon="save" label="حفظ التغييرات" />
    </form>
  );
}

function PasswordForm(props: Props) {
  const passwordsMatch =
    Boolean(props.form.confirmPassword) &&
    props.form.newPassword === props.form.confirmPassword;

  return (
    <form onSubmit={props.handleChangePassword} className="space-y-5 p-6">
      <Field label="كلمة المرور الحالية" icon="lock">
        <input name="currentPassword" type="password" required dir="ltr" value={props.form.currentPassword} onChange={props.handleChange} placeholder="••••••••" className={`${INPUT_CLASS} text-left`} />
      </Field>

      <Field
        label={
          <>
            كلمة المرور الجديدة
            <span className="mr-2 text-[10px] font-medium text-on-surface-variant/60">(8 أحرف+ • كبير وصغير • رقم)</span>
          </>
        }
        icon="lock_reset"
      >
        <input name="newPassword" type="password" required dir="ltr" value={props.form.newPassword} onChange={props.handleChange} placeholder="••••••••" className={`${INPUT_CLASS} text-left`} />
        {props.form.newPassword && <PasswordStrength password={props.form.newPassword} />}
      </Field>

      <Field label="تأكيد كلمة المرور الجديدة" icon="verified">
        <input
          name="confirmPassword"
          type="password"
          required
          dir="ltr"
          value={props.form.confirmPassword}
          onChange={props.handleChange}
          placeholder="••••••••"
          className={`${INPUT_CLASS} text-left ${props.form.confirmPassword ? (passwordsMatch ? "border-green-400" : "border-red-300 focus:border-red-400") : ""}`}
        />
        {props.form.confirmPassword && (
          <p className={`flex items-center gap-1 text-[11px] font-bold ${passwordsMatch ? "text-green-500" : "text-red-500"}`}>
            <span className="material-symbols-outlined text-[12px]">{passwordsMatch ? "check_circle" : "error"}</span>
            {passwordsMatch ? "كلمتا المرور متطابقتان" : "كلمتا المرور غير متطابقتين"}
          </p>
        )}
      </Field>

      <SubmitButton loading={props.loading} loadingLabel="جاري التغيير..." icon="key" label="تغيير كلمة المرور" />
    </form>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: React.ReactNode;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-xs font-black text-on-surface-variant">{label}</label>
      <div className="relative">
        <span className="material-symbols-outlined absolute right-4 top-[1.15rem] text-[20px] text-outline">{icon}</span>
        {children}
      </div>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const score = [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /\d/.test(password)].filter(Boolean).length;
  const labels = ["", "ضعيفة", "متوسطة", "جيدة", "قوية"];
  const colors = ["", "bg-red-400", "bg-orange-400", "bg-blue-400", "bg-green-500"];
  return (
    <div className="mt-1 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((number) => (
          <div key={number} className={`h-1 flex-1 rounded-full transition-colors ${number <= score ? colors[score] : "bg-gray-200"}`} />
        ))}
        <span className="mr-1 text-[10px] font-bold text-on-surface-variant">{labels[score]}</span>
      </div>
    </div>
  );
}

function SubmitButton({ loading, loadingLabel, icon, label }: { loading: boolean; loadingLabel: string; icon: string; label: string }) {
  return (
    <button type="submit" disabled={loading} className="btn-primary w-full rounded-xl py-3.5 text-sm active:scale-[0.99]">
      <span className={`material-symbols-outlined text-[18px] ${loading ? "animate-spin" : ""}`}>{loading ? "progress_activity" : icon}</span>
      {loading ? loadingLabel : label}
    </button>
  );
}

function DangerZone() {
  return (
    <div className="mt-5 rounded-[16px] border border-red-100 bg-red-50 p-4">
      <p className="mb-1 flex items-center gap-1.5 text-xs font-black text-red-600">
        <span className="material-symbols-outlined text-[16px]">warning</span>
        منطقة الخطر
      </p>
      <p className="mb-3 text-xs text-red-400">حذف الحساب سيؤدي إلى فقدان جميع بياناتك بشكل دائم.</p>
      <button type="button" className="text-xs font-bold text-red-500 underline underline-offset-2 transition-colors hover:text-red-700" onClick={() => alert("تواصل مع الدعم لحذف الحساب")}>
        طلب حذف الحساب
      </button>
    </div>
  );
}
