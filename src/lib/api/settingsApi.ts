// src/lib/api/settingsApi.ts
import axiosInstance from "@/lib/api/axiosInstance";
import type { SystemSettings } from "@/types/settings.types";

// هذا المسار يجب أن يكون متاحاً للجميع (Public)
export const getPublicSettings = async (): Promise<SystemSettings> => {
  const { data } = await axiosInstance.get<SystemSettings>("/api/settings/public");
  return data;
};

// هذا المسار يبقى للأدمن فقط
export const updateSettings = async (payload: Partial<SystemSettings>): Promise<SystemSettings> => {
  const { data } = await axiosInstance.put<SystemSettings>("/api/admin/settings", payload);
  return data;
};