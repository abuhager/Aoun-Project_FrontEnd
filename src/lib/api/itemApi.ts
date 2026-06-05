// src/lib/api/itemApi.ts

import axiosInstance from './axiosInstance';
import type {
  GetItemsResponse,
  Item,
  MyItemsResponse,
  BookItemResponse,
  CreateItemPayload,
  ConfirmationType, // ✅ مستوردة مباشرة من مكانها الصحيح
} from '@/types/item.types';
import type { PaginationQuery } from '@/types/api.types';

// ----------------------------------------
// 1. استعراض وجلب العناصر (Items)
// ----------------------------------------

export async function getItems(params?: PaginationQuery): Promise<GetItemsResponse> {
  const { data } = await axiosInstance.get<GetItemsResponse>('/api/items', { params });
  return data;
}

export async function getItemById(id: string): Promise<Item> {
  const { data } = await axiosInstance.get<Item>(`/api/items/${id}`);
  return data;
}

export async function getMyItems(): Promise<MyItemsResponse> {
  const { data } = await axiosInstance.get<MyItemsResponse>('/api/items/me');
  return data;
}

// ----------------------------------------
// 2. إدارة العناصر (إنشاء، تعديل، حذف)
// ----------------------------------------

export async function createItem(payload: CreateItemPayload): Promise<{ msg: string; item: Item }> {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, val]) => {
    if (val !== undefined && val !== null) formData.append(key, val as string | Blob);
  });
  const { data } = await axiosInstance.post<{ msg: string; item: Item }>('/api/items', formData);
  return data;
}

export async function updateItem(
  id: string,
  payload: Partial<CreateItemPayload>
): Promise<{ msg: string; item: Item }> {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, val]) => {
    if (val !== undefined && val !== null) formData.append(key, val as string | Blob);
  });
  const { data } = await axiosInstance.put<{ msg: string; item: Item }>(
    `/api/items/${id}`,
    formData
  );
  return data;
}

export async function deleteItem(id: string): Promise<{ msg: string }> {
  const { data } = await axiosInstance.delete<{ msg: string }>(`/api/items/${id}`);
  return data;
}

// ----------------------------------------
// 3. الحجز والإلغاء (Booking)
// ----------------------------------------

export async function bookItem(id: string): Promise<BookItemResponse> {
  const { data } = await axiosInstance.put<BookItemResponse>(`/api/items/book/${id}`);
  return data;
}

export async function cancelBooking(id: string): Promise<{ msg: string }> {
  const { data } = await axiosInstance.put<{ msg: string }>(`/api/items/cancel/${id}`);
  return data;
}

// ----------------------------------------
// 4. نظام التأكيد الثنائي (Double Confirmation) والتقييم
// ----------------------------------------

// ✅ الدالة الأساسية الموحدة لتأكيد التسليم
export async function completeDelivery(
  id: string,
  confirmationType: ConfirmationType
): Promise<{ msg: string; status: string }> {
  const { data } = await axiosInstance.put<{ msg: string; status: string }>(
    `/api/items/complete/${id}`,
    { confirmationType }
  );
  return data;
}

// ✅ الـ Wrappers البسيطة والنظيفة لاستدعائها في الـ UI والـ Hooks مباشرة
export const confirmReceipt  = (id: string) => completeDelivery(id, 'recipient_confirm');
export const confirmDelivery = (id: string) => completeDelivery(id, 'donor_confirm');

export async function rateItem(id: string, rating: number): Promise<{ msg: string; trustScore: number }> {
  const { data } = await axiosInstance.post<{ msg: string; trustScore: number }>(
    `/api/items/rate/${id}`,
    { rating }
  );
  return data;
}