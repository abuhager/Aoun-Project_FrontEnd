// src/lib/api/settingsApi.ts
// ✅ FIX E1: المسار الصحيح هو @/lib/api/axiosInstance (وليس @/config/axiosInstance)
// ✅ FIX E2: الدالة مُسمّاة getPublicSettings (يطابق useSettings.ts الموجود فعلاً)
// ✅ FIX E3: النوع مستورد من settings.types (يطابق اصطلاح المشروع)
// ✅ FIX [HUB-04]: getPublicSettings تستخدم /api/settings/public الآمن (بدون auth)
//                  updateSettings تستخدم /api/settings (Admin فقط)

import axiosInstance from "@/lib/api/axiosInstance";
import type { SystemSettings } from "@/types/settings.types";

// ── Public — بدون auth — يرجع categories + reportReasons فقط ──
// ✅ FIX [HUB-04]: كانت تستدعي /api/settings كاملاً
//                  الآن تستدعي /api/settings/public (آمن للجميع)
export const getPublicSettings = async (): Promise<Pick<SystemSettings, "categories" | "reportReasons">> => {
  const { data } = await axiosInstance.get<Pick<SystemSettings, "categories" | "reportReasons">>(
    "/api/settings/public"
  );
  return data;
};

// ── Admin فقط — يحتاج Bearer token ──────────────────────────
export const getAdminSettings = async (): Promise<SystemSettings> => {
  const { data } = await axiosInstance.get<SystemSettings>("/api/settings");
  return data;
};

// ── Admin فقط — تحديث الإعدادات ──────────────────────────────
export const updateSettings = async (
  payload: Partial<SystemSettings>
): Promise<SystemSettings> => {
  const { data } = await axiosInstance.patch<SystemSettings>("/api/settings", payload);
  return data;
};