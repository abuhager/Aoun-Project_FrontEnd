// src/lib/api/itemApi.ts — ✅ PATCHED [FRONT-01]: كل response له نوع صريح
import axiosInstance from './axiosInstance';
import type {
  Item,
  ItemsListResponse,
  MyItemsResponse,
  BookingResponse,
  DeliveryResponse,
  ItemFilters,
  CreateItemPayload,
  UpdateItemPayload,
} from "@/types/item.types";

// ── جلب الأغراض المتاحة ─────────────────────────────────────────────────────
export const getItems = async (
  filters: ItemFilters = {}
): Promise<ItemsListResponse> => {
  const { data } = await axiosInstance.get<ItemsListResponse>("/api/items", {
    params: filters,
  });
  return data;
};

// ── جلب أغراضي ──────────────────────────────────────────────────────────────
export const getMyItems = async (): Promise<MyItemsResponse> => {
  const { data } = await axiosInstance.get<MyItemsResponse>("/api/items/me");
  return data;
};

// ── جلب غرض بالـ ID ──────────────────────────────────────────────────────────
export const getItemById = async (id: string): Promise<Item> => {
  const { data } = await axiosInstance.get<Item>(`/api/items/${id}`);
  return data;
};

// ── إنشاء غرض ────────────────────────────────────────────────────────────────
export const createItem = async (
  payload: CreateItemPayload
): Promise<{ success: boolean; item: Item }> => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      formData.append(key, val as string | Blob);
    }
  });
  const { data } = await axiosInstance.post<{ success: boolean; item: Item }>(
    "/api/items",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
};

// ── حجز غرض ──────────────────────────────────────────────────────────────────
export const bookItem = async (id: string): Promise<BookingResponse> => {
  const { data } = await axiosInstance.put<BookingResponse>(
    `/api/items/book/${id}`
  );
  return data;
};

// ── إلغاء الحجز ──────────────────────────────────────────────────────────────
export const cancelBooking = async (
  id: string
): Promise<{ msg: string }> => {
  const { data } = await axiosInstance.put<{ msg: string }>(
    `/api/items/cancel/${id}`
  );
  return data;
};

// ── مغادرة Waitlist ───────────────────────────────────────────────────────────
export const leaveWaitlist = async (
  id: string
): Promise<{ msg: string }> => {
  const { data } = await axiosInstance.put<{ msg: string }>(
    `/api/items/leave-waitlist/${id}`
  );
  return data;
};

// ── تأكيد الاستلام (المستلم) ─────────────────────────────────────────────────
export const confirmReceipt = async (
  id: string
): Promise<DeliveryResponse> => {
  // ✅ FRONT-01: POST /:id/confirm-receipt — لا body مطلوب (injectRecipientConfirm في الـ route)
  const { data } = await axiosInstance.post<DeliveryResponse>(
    `/api/items/${id}/confirm-receipt`
  );
  return data;
};

// ── تأكيد التسليم (المتبرع) ───────────────────────────────────────────────────
export const confirmDelivery = async (
  id: string
): Promise<DeliveryResponse> => {
  const { data } = await axiosInstance.put<DeliveryResponse>(
    `/api/items/complete/${id}`,
    { confirmationType: "donor_confirm" }
  );
  return data;
};

// ── تعديل غرض ────────────────────────────────────────────────────────────────
export const updateItem = async (
  id: string,
  payload: UpdateItemPayload
): Promise<{ msg: string; item: Item }> => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, val]) => {
    if (val !== undefined && val !== null)
      formData.append(key, val as string | Blob);
  });
  const { data } = await axiosInstance.put<{ msg: string; item: Item }>(
    `/api/items/${id}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
};

// ── حذف غرض ──────────────────────────────────────────────────────────────────
export const deleteItem = async (id: string): Promise<{ msg: string }> => {
  const { data } = await axiosInstance.delete<{ msg: string }>(
    `/api/items/${id}`
  );
  return data;
};