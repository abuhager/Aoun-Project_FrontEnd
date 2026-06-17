import axiosInstance from "@/lib/api/axiosInstance";
import type { PublicSettings, SystemSettings } from "@/types/settings.types";

export const getPublicSettings = async (): Promise<PublicSettings> => {
  const { data } = await axiosInstance.get<PublicSettings>("/api/settings/public");
  return data;
};

export const getAdminSettings = async (): Promise<SystemSettings> => {
  const { data } = await axiosInstance.get<SystemSettings>("/api/settings");
  return data;
};

export const updateSettings = async (
  payload: Partial<SystemSettings>
): Promise<SystemSettings> => {
  const { data } = await axiosInstance.patch<SystemSettings>("/api/settings", payload);
  return data;
};