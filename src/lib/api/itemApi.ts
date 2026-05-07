import axiosInstance from './axiosInstance';
import type { Item, ItemsResponse, MyItemsResponse } from '@/types/item.types';

export interface BookItemResponse {
  status:  'booked' | 'waitlist';
  message: string;
  msg?:    string;
  item?:   Item;
}

export const itemApi = {

  // ─── جلب كل الأغراض ───────────────────────────────────────
  getAllItems: async (): Promise<ItemsResponse> => {
    const res = await axiosInstance.get('/api/items');
    return res.data;
  },

  // ─── جلب تفاصيل غرض ───────────────────────────────────────
  getItemById: async (id: string): Promise<Item> => {
    const res = await axiosInstance.get(`/api/items/${id}`);
    return res.data;
  },

  // ─── جلب أغراضي الشخصية ───────────────────────────────────
  getMyItems: async (): Promise<MyItemsResponse> => {
    const res = await axiosInstance.get('/api/items/me');
    return res.data;
  },

  // ─── حجز غرض ──────────────────────────────────────────────
  bookItem: async (id: string): Promise<BookItemResponse> => {
    const res = await axiosInstance.put(`/api/items/book/${id}`);
    return res.data;
  },

  // ─── إلغاء الحجز ──────────────────────────────────────────
  cancelBooking: async (id: string): Promise<{ msg: string }> => {
    const res = await axiosInstance.put(`/api/items/cancel/${id}`);
    return res.data;
  },

  // ─── تأكيد التسليم ✅ صح: complete وليس deliver ────────────
  completeDelivery: async (id: string, otp: string): Promise<{ msg: string }> => {
    const res = await axiosInstance.put(`/api/items/complete/${id}`, { otp });
    return res.data;
  },

  // ─── تقييم المتبرع ────────────────────────────────────────
  rateItem: async (id: string, rating: number): Promise<{ msg: string }> => {
    const res = await axiosInstance.put(`/api/items/rate/${id}`, { rating });
    return res.data;
  },

  // ─── حذف غرض ✅ صح: delete/:id وليس /:id ──────────────────
  deleteItem: async (id: string): Promise<{ msg: string }> => {
    const res = await axiosInstance.delete(`/api/items/delete/${id}`);
    return res.data;
  },

  // ─── الإبلاغ عن مستخدم ✅ صح: report-user + body ──────────
reportUser: async (userId: string): Promise<{ msg: string }> => {
  const res = await axiosInstance.post('/api/items/report-user', {
    reportedUserId: userId,
  });
  return res.data;
},
};