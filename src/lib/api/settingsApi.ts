// src/lib/api/settingsApi.ts
// ✅ DC-07 FIX: updateSettings يقبل UpdateSettingsPayload فقط
//              وليس Partial<SystemSettings> التي تشمل _id, createdAt, updatedAt
// ✅ DC-10 FIX: page.tsx يجب أن يستخدم هذا الملف مباشرةً — لا تكرار للـ axiosInstance

import axiosInstance from "@/lib/api/axiosInstance";
import { siteConfig } from "@/config/site.config";

import type {
  PublicSettings,
  SystemSettings,
  UpdateSettingsPayload,        // ← النوع الصحيح المُعرَّف في settings.types.ts
} from "@/types/settings.types";

// ── قراءة الإعدادات العامة (بدون Auth) ──────────────────────────────────────

export async function getPublicSettings() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/settings/public`,
      { next: { revalidate: 3600 } } // ← يُجدد كل ساعة تلقائياً
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null; // ← يرجع null → يستخدم الـ fallback
  }
}

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