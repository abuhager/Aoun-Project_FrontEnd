import axiosInstance from "@/lib/api/axiosInstance";
import type { SystemSettings } from "@/types/settings.types";

export const getPublicSettings = async (): Promise<SystemSettings> => {
  const { data } = await axiosInstance.get<SystemSettings>("/api/settings");
  return data;
};