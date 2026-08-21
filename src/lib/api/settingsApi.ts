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

export async function getPublicSettings(): Promise<PublicSettings | null> {
  try {
    const serverBaseUrl = (process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "")
      .replace(/\/$/, "");
    if (typeof window === "undefined" && !serverBaseUrl) return null;
    const endpoint = typeof window === "undefined"
      ? `${serverBaseUrl}/api/settings/public`
      : "/api/settings/public";

    const res = await fetch(
      endpoint,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      }
    );
    if (!res.ok) return null;
    return res.json() as Promise<PublicSettings>;
  } catch {
    return null;
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
