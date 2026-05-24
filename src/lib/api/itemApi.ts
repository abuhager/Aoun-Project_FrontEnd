// src/lib/api/itemApi.ts
// ✅ Phase 1 Fix:
//    Bug #1 — reportUser: URL مُصلَح + userId في الـ path param

import axiosInstance from './axiosInstance';
import type {
  GetItemsResponse,
  Item,
  MyItemsResponse,
  BookItemResponse,
  CreateItemPayload,
} from '@/types/item.types';
import type { PaginationQuery } from '@/types/api.types';

// ── جلب الأغراض (مع فلتر وpagination) ────────────────────────
export async function getItems(params?: PaginationQuery): Promise<GetItemsResponse> {
  const { data } = await axiosInstance.get<GetItemsResponse>('/api/items', { params });
  return data;
}

// ── تفاصيل غرض واحد ──────────────────────────────────────────
export async function getItemById(id: string): Promise<Item> {
  const { data } = await axiosInstance.get<Item>(`/api/items/${id}`);
  return data;
}

// ── أغراضي ───────────────────────────────────────────────────
export async function getMyItems(): Promise<MyItemsResponse> {
  const { data } = await axiosInstance.get<MyItemsResponse>('/api/items/me');
  return data;
}

// ── إنشاء غرض ────────────────────────────────────────────────
export async function createItem(payload: CreateItemPayload): Promise<{ msg: string; item: Item }> {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, val]) => {
    if (val !== undefined && val !== null) formData.append(key, val as string | Blob);
  });
  const { data } = await axiosInstance.post<{ msg: string; item: Item }>('/api/items', formData);
  return data;
}

// ── حجز غرض ──────────────────────────────────────────────────
export async function bookItem(id: string): Promise<BookItemResponse> {
  const { data } = await axiosInstance.put<BookItemResponse>(`/api/items/book/${id}`);
  return data;
}

// ── إلغاء الحجز ───────────────────────────────────────────────
export async function cancelBooking(id: string): Promise<{ msg: string }> {
  const { data } = await axiosInstance.put<{ msg: string }>(`/api/items/cancel/${id}`);
  return data;
}

// ── إتمام التسليم ─────────────────────────────────────────────
export async function completeDelivery(id: string, otp: string): Promise<{ msg: string; item: Item }> {
  const { data } = await axiosInstance.put<{ msg: string; item: Item }>(
    `/api/items/complete/${id}`,
    { otp }
  );
  return data;
}

// ── تقييم غرض ────────────────────────────────────────────────
export async function rateItem(id: string, rating: number): Promise<{ msg: string; trustScore: number }> {
  const { data } = await axiosInstance.post<{ msg: string; trustScore: number }>(
    `/api/items/rate/${id}`,
    { rating }
  );
  return data;
}

// ✅ Fix Bug #1 — URL مُصلَح: /report/:userId (param) بدل /report-user (body)
// Backend يقرأ: req.params.userId + req.body.reason
export async function reportUser(
  userId: string,
  reason: string
): Promise<{ msg: string }> {
  const { data } = await axiosInstance.post<{ msg: string }>(
    `/api/items/report/${userId}`, // ✅ userId في الـ URL path
    { reason }                     // ✅ reason في الـ body فقط
  );
  return data;
}

// ── تقييم معلق ───────────────────────────────────────────────
export async function getPendingRating(): Promise<{ pendingRating: Item | null }> {
  const { data } = await axiosInstance.get<{ pendingRating: Item | null }>(
    '/api/items/pending-rating'
  );
  return data;
}

// ── تعديل غرض ────────────────────────────────────────────────
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

// ── حذف غرض ──────────────────────────────────────────────────
export async function deleteItem(id: string): Promise<{ msg: string }> {
  const { data } = await axiosInstance.delete<{ msg: string }>(`/api/items/${id}`);
  return data;
}