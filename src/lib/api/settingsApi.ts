// src/lib/api/settingsApi.ts
import axiosInstance from "@/lib/api/axiosInstance";
import type { SystemSettings } from "@/types/settings.types";

export const getPublicSettings = async (): Promise<SystemSettings> => {
  const { data } = await axiosInstance.get<SystemSettings>("/api/settings");
  return data;
};

export const updateSettings = async (payload: Partial<SystemSettings>): Promise<SystemSettings> => {
  const { data } = await axiosInstance.put<SystemSettings>("/api/admin/settings", payload);
  return data;
};