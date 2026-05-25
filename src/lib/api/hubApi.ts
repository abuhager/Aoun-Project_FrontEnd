// src/lib/api/hubApi.ts — الملف الكامل ✅

import axiosInstance from '@/lib/api/axiosInstance';
import { SafeHub, HubSelectOption } from '@/types/hub.types';

// ─── دالة 1: جلب كل الـ Hubs ───
export const getHubs = async (): Promise<SafeHub[]> => {
  const res = await axiosInstance.get<SafeHub[]>('/api/hubs');
  return res.data;
};

// ─── دالة 2: تحويلها إلى خيارات Dropdown ───
export const getHubOptions = async (): Promise<HubSelectOption[]> => {
  const hubs = await getHubs();
  return hubs.map((h) => ({
    value:    h._id,
    label:    `${h.name} — ${h.city}`,
    isActive: h.isActive,
  }));
};