// src/lib/api/settingsApi.ts
// ✅ DC-07 FIX: updateSettings يقبل UpdateSettingsPayload فقط
//              وليس Partial<SystemSettings> التي تشمل _id, createdAt, updatedAt
// ✅ DC-10 FIX: page.tsx يجب أن يستخدم هذا الملف مباشرةً — لا تكرار للـ axiosInstance

import axiosInstance from "@/lib/api/axiosInstance";

import type {
  SystemSettings,
  UpdateSettingsPayload,
  UpdateSettingsResponse,
} from "@/types/settings.types";

// ── قراءة الإعدادات الكاملة (Admin فقط) ────────────────────────────────────
export const getAdminSettings = async (signal?: AbortSignal): Promise<SystemSettings> => {
  const { data } = await axiosInstance.get<SystemSettings>("/api/settings", { signal });
  return data;
};

// ✅ DC-07 FIX: النوع UpdateSettingsPayload = Partial<Omit<SystemSettings, '_id'|'createdAt'|'updatedAt'>>
// يمنع إرسال الحقول المحمية للـ Backend
export const updateAdminSettings = async (
  payload: UpdateSettingsPayload
): Promise<UpdateSettingsResponse> => {
  const { data } = await axiosInstance.patch<UpdateSettingsResponse>(
    "/api/settings",
    payload
  );
  return data;
};
