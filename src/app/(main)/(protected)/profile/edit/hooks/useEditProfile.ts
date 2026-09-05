"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { extractErrorMsg } from "@/lib/api/apiError";
import { changeMyPassword, updateMyProfile } from "@/lib/api/profileApi";
import {
  isStrongPassword,
  PASSWORD_REQUIREMENTS_MESSAGE,
} from "@/lib/validation/auth";
import type { AuthUser } from "@/types/user.types";

type EditForm = {
  name: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type EditProfileTab = "info" | "password";

const EMPTY_FORM: EditForm = {
  name: "",
  phone: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function useEditProfile() {
  const { user, setUser, logout, isFullyLoaded, isLoading } = useAuth();
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<EditForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<EditProfileTab>("info");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarObjectUrlRef = useRef<string | null>(null);
  const maxAvatarMB = settings?.maxAvatarSizeMb ?? 5;

  const revokeAvatarObjectUrl = () => {
    if (!avatarObjectUrlRef.current) return;
    URL.revokeObjectURL(avatarObjectUrlRef.current);
    avatarObjectUrlRef.current = null;
  };

  useEffect(() => setMounted(true), []);

  useEffect(
    () => () => {
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
        avatarObjectUrlRef.current = null;
      }
    },
    []
  );

  useEffect(() => {
    if (!user) return;
    const typedUser = user as AuthUser;
    setForm((previous) => ({
      ...previous,
      name: typedUser.name ?? "",
      phone: typedUser.phone?.replace(/^\+962/, "") ?? "",
    }));
    if (typedUser.avatar) setAvatarPreview(typedUser.avatar);
  }, [user]);

  const clearStatus = () => {
    setError("");
    setSuccess("");
  };

  const selectTab = (tab: EditProfileTab) => {
    setActiveTab(tab);
    clearStatus();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
    clearStatus();
  };

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    const phone = event.target.value.replace(/\D/g, "").slice(0, 9);
    setForm((previous) => ({ ...previous, phone }));
    clearStatus();
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("نوع الصورة غير مدعوم — اختر JPEG أو PNG أو WebP");
      event.target.value = "";
      return;
    }
    if (file.size > maxAvatarMB * 1024 * 1024) {
      setError(`حجم الصورة يجب أن يكون أقل من ${maxAvatarMB}MB`);
      event.target.value = "";
      return;
    }
    revokeAvatarObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    avatarObjectUrlRef.current = objectUrl;
    setAvatarFile(file);
    setAvatarPreview(objectUrl);
    clearStatus();
  };

  const handleSaveInfo = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("الاسم مطلوب");
      return;
    }
    setLoading(true);
    clearStatus();
    try {
      const payload = new FormData();
      payload.append("name", form.name.trim());
      if (form.phone.trim()) payload.append("phone", form.phone.trim());
      if (avatarFile) payload.append("avatar", avatarFile);
      const updatedUser = await updateMyProfile(payload);
      setUser(updatedUser);
      setSuccess("تم تحديث المعلومات بنجاح ✓");
      setAvatarFile(null);
      revokeAvatarObjectUrl();
      setAvatarPreview(updatedUser.avatar ?? "");
    } catch (caughtError: unknown) {
      setError(extractErrorMsg(caughtError, "حدث خطأ، حاول مجدداً"));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.currentPassword) {
      setError("أدخل كلمة المرور الحالية");
      return;
    }
    if (!isStrongPassword(form.newPassword)) {
      setError(PASSWORD_REQUIREMENTS_MESSAGE);
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    setLoading(true);
    clearStatus();
    try {
      await changeMyPassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess("تم تغيير كلمة المرور بنجاح ✓ — سيتم تحويلك لتسجيل الدخول");
      setForm((previous) => ({
        ...previous,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      window.setTimeout(() => void logout(), 900);
    } catch (caughtError: unknown) {
      setError(extractErrorMsg(caughtError, "كلمة المرور الحالية غير صحيحة"));
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    mounted,
    isReady: mounted && !isLoading && (isFullyLoaded || Boolean(user)),
    form,
    loading,
    success,
    error,
    activeTab,
    avatarPreview,
    avatarFile,
    fileInputRef,
    maxAvatarMB,
    selectTab,
    handleChange,
    handlePhoneChange,
    handleAvatarChange,
    handleSaveInfo,
    handleChangePassword,
  };
}
