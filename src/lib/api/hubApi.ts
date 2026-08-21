// src/lib/api/hubApi.ts
// ✅ الكود الأصلي محفوظ بالكامل
// ✅ FIX [HUB-02]: إضافة reactivateHub + دوال Admin الناقصة

import axiosInstance from '@/lib/api/axiosInstance';
import type {
  CreateHubPayload,
  HubMutationResponse,
  HubSelectOption,
  SafeHub,
  UpdateHubPayload,
} from '@/types/hub.types';

// ─── دالة 1: جلب الـ Hubs النشطة (Public) ──────────────────
export const getHubs = async (signal?: AbortSignal): Promise<SafeHub[]> => {
  const res = await axiosInstance.get<SafeHub[]>('/api/hubs', { signal });
  return res.data;
};

// ─── دالة 2: تحويلها إلى خيارات Dropdown ───────────────────
export const getHubOptions = async (): Promise<HubSelectOption[]> => {
  const hubs = await getHubs();
  return hubs.map((h) => ({
    value:    h._id,
    label:    `${h.name} — ${h.city}`,
    isActive: h.isActive,
  }));
};

// ─── دالة 3: Admin — كل الـ Hubs (نشطة + معطّلة) ───────────
export const getAllHubsAdmin = async (signal?: AbortSignal): Promise<SafeHub[]> => {
  const res = await axiosInstance.get<SafeHub[]>('/api/hubs/admin/all', { signal });
  return res.data;
};

// ─── دالة 4: Admin — إنشاء Hub جديد ────────────────────────
export const createHub = async (
  payload: CreateHubPayload
): Promise<SafeHub> => {
  const res = await axiosInstance.post<SafeHub>('/api/hubs', payload);
  return res.data;
};

// ─── دالة 5: Admin — تعديل Hub ──────────────────────────────
export const updateHub = async (
  id: string,
  payload: UpdateHubPayload
): Promise<SafeHub> => {
  const res = await axiosInstance.patch<SafeHub>(`/api/hubs/${id}`, payload);
  return res.data;
};

// ─── دالة 6: Admin — تعطيل Hub ──────────────────────────────
export const deactivateHub = async (id: string): Promise<SafeHub> => {
  const res = await axiosInstance.delete<HubMutationResponse>(`/api/hubs/${id}`);
  return res.data.hub;
};

// ─── دالة 7: Admin — ✅ FIX [HUB-02]: إعادة تفعيل Hub ──────
export const reactivateHub = async (id: string): Promise<SafeHub> => {
  const res = await axiosInstance.patch<HubMutationResponse>(`/api/hubs/${id}/reactivate`);
  return res.data.hub;
};
