// src/lib/api/settingsApi.ts
// ✅ DC-07 FIX: updateSettings يقبل UpdateSettingsPayload فقط
//              وليس Partial<SystemSettings> التي تشمل _id, createdAt, updatedAt
// ✅ DC-10 FIX: page.tsx يجب أن يستخدم هذا الملف مباشرةً — لا تكرار للـ axiosInstance

import axiosInstance from "@/lib/api/axiosInstance";
import type {
  PublicSettings,
  SystemSettings,
  UpdateSettingsPayload,        // ← النوع الصحيح المُعرَّف في settings.types.ts
} from "@/types/settings.types";

// ── قراءة الإعدادات العامة (بدون Auth) ──────────────────────────────────────
export const getPublicSettings = async (): Promise<PublicSettings> => {
  const { data } = await axiosInstance.get<PublicSettings>("/api/settings/public");
  return data;
};

// ── قراءة الإعدادات الكاملة (Admin فقط) ────────────────────────────────────
export const getAdminSettings = async (): Promise<SystemSettings> => {
  const { data } = await axiosInstance.get<SystemSettings>("/api/settings");
  return data;
};

// ✅ DC-07 FIX: النوع UpdateSettingsPayload = Partial<Omit<SystemSettings, '_id'|'createdAt'|'updatedAt'>>
// يمنع إرسال الحقول المحمية للـ Backend
export const updateAdminSettings = async (
  payload: UpdateSettingsPayload
): Promise<{ msg: string; settings: SystemSettings }> => {
  const { data } = await axiosInstance.patch<{ msg: string; settings: SystemSettings }>(
    "/api/settings",
    payload
  );
  return data;
};