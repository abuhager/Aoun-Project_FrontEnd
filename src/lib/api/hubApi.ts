// src/lib/api/hubApi.ts
// ✅ الكود الأصلي محفوظ بالكامل
// ✅ FIX [HUB-02]: إضافة reactivateHub + دوال Admin الناقصة

import axiosInstance from '@/lib/api/axiosInstance';
import type { SafeHub, HubSelectOption } from '@/types/hub.types';

// ─── دالة 1: جلب الـ Hubs النشطة (Public) ──────────────────
export const getHubs = async (): Promise<SafeHub[]> => {
  const res = await axiosInstance.get<SafeHub[]>('/api/hubs');
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
export const getAllHubsAdmin = async (): Promise<SafeHub[]> => {
  const res = await axiosInstance.get<SafeHub[]>('/api/hubs/admin/all');
  return res.data;
};

// ─── دالة 4: Admin — إنشاء Hub جديد ────────────────────────
export const createHub = async (
  payload: Omit<SafeHub, '_id' | 'isActive' | 'createdAt' | 'updatedAt'>
): Promise<SafeHub> => {
  const res = await axiosInstance.post<SafeHub>('/api/hubs', payload);
  return res.data;
};

// ─── دالة 5: Admin — تعديل Hub ──────────────────────────────
export const updateHub = async (
  id: string,
  payload: Partial<Omit<SafeHub, '_id'>>
): Promise<SafeHub> => {
  const res = await axiosInstance.patch<SafeHub>(`/api/hubs/${id}`, payload);
  return res.data;
};

// ─── دالة 6: Admin — تعطيل Hub ──────────────────────────────
export const deactivateHub = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/hubs/${id}`);
};

// ─── دالة 7: Admin — ✅ FIX [HUB-02]: إعادة تفعيل Hub ──────
export const reactivateHub = async (id: string): Promise<SafeHub> => {
  const res = await axiosInstance.patch<SafeHub>(`/api/hubs/${id}/reactivate`);
  return res.data;
};