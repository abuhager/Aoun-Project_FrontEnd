"use client";

import PageIntro from "@/components/ui/PageIntro";
import type { EditProfileController } from "../hooks/useEditProfile";

type Props = Pick<
  EditProfileController,
  | "user"
  | "mounted"
  | "avatarPreview"
  | "avatarFile"
  | "fileInputRef"
  | "maxAvatarMB"
  | "handleAvatarChange"
>;

export function EditProfileHeader(props: Props) {
  const {
    user,
    mounted,
    avatarPreview,
    avatarFile,
    fileInputRef,
    maxAvatarMB,
    handleAvatarChange,
  } = props;

  return (
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
            <button type="button" aria-label="اختيار صورة شخصية" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex items-end justify-end bg-black/0 p-1.5 text-white hover:bg-black/20">
              <span className="material-symbols-outlined rounded-lg bg-black/45 p-1 text-[15px]">photo_camera</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
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
  );
}
