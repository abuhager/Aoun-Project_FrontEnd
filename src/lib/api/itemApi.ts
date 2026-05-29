// src/lib/api/itemApi.ts
// ✅ Patched: completeDelivery → Double Confirmation (بدون OTP)

import axiosInstance from './axiosInstance';
import type {
  GetItemsResponse,
  Item,
  MyItemsResponse,
  BookItemResponse,
  CreateItemPayload,
} from '@/types/item.types';
import type { PaginationQuery } from '@/types/api.types';

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

export async function createItem(payload: CreateItemPayload): Promise<{ msg: string; item: Item }> {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, val]) => {
    if (val !== undefined && val !== null) formData.append(key, val as string | Blob);
  });
  const { data } = await axiosInstance.post<{ msg: string; item: Item }>('/api/items', formData);
  return data;
}

export async function bookItem(id: string): Promise<BookItemResponse> {
  const { data } = await axiosInstance.put<BookItemResponse>(`/api/items/book/${id}`);
  return data;
}

export async function cancelBooking(id: string): Promise<{ msg: string }> {
  const { data } = await axiosInstance.put<{ msg: string }>(`/api/items/cancel/${id}`);
  return data;
}

// ✅ Double Confirmation — المستلم يؤكد أولاً (بدون OTP)
export async function confirmReceipt(id: string): Promise<{ msg: string }> {
  const { data } = await axiosInstance.put<{ msg: string }>(
    `/api/items/complete/${id}`,
    { confirmationType: 'recipient_confirm' }
  );
  return data;
}

// ✅ Double Confirmation — المتبرع يؤكد ثانياً (بدون OTP)
export async function confirmDelivery(id: string): Promise<{ msg: string; item: Item }> {
  const { data } = await axiosInstance.put<{ msg: string; item: Item }>(
    `/api/items/complete/${id}`,
    { confirmationType: 'donor_confirm' }
  );
  return data;
}

// ❌ محذوف: completeDelivery(id, otp) — تم استبداله بالدالتين أعلاه

export async function rateItem(id: string, rating: number): Promise<{ msg: string; trustScore: number }> {
  const { data } = await axiosInstance.post<{ msg: string; trustScore: number }>(
    `/api/items/rate/${id}`,
    { rating }
  );
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
