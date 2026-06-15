// src/lib/api/donationRequestApi.ts
// ✅ FIX: حذف getPublicSettings المكررة التي كانت تستدعي /api/settings (Admin only)
//         وإعادة تصديرها من settingsApi.ts الصحيح (/api/settings/public)

import axiosInstance from '@/lib/api/axiosInstance';
import type {
  CreateDonationRequestPayload,
  DonationRequestsListResponse,
  GetDonationRequestsParams,
  MyDonationRequestsResponse,
} from '@/types/donationRequest.types';

// ✅ re-export من المصدر الصحيح — لا تغيير مطلوب في donation-requests/page.tsx
export { getPublicSettings } from '@/lib/api/settingsApi';

// ─────────────────────────────────────────────────────────────
// جلب قائمة الطلبات
// ─────────────────────────────────────────────────────────────
export async function getDonationRequests(params?: GetDonationRequestsParams) {
  const { data } = await axiosInstance.get<DonationRequestsListResponse>(
    '/api/donation-requests',
    { params }
  );
  return data;
}

// ─────────────────────────────────────────────────────────────
// طلباتي مع الـ Quota
// ─────────────────────────────────────────────────────────────
export async function getMyDonationRequests() {
  const { data } = await axiosInstance.get<MyDonationRequestsResponse>(
    '/api/donation-requests/me'
  );
  return data;
}

// ─────────────────────────────────────────────────────────────
// إنشاء طلب جديد
// ─────────────────────────────────────────────────────────────
export async function createDonationRequest(payload: CreateDonationRequestPayload) {
  const { data } = await axiosInstance.post<{ msg: string }>(
    '/api/donation-requests',
    payload
  );
  return data;
}

// ─────────────────────────────────────────────────────────────
// إلغاء طلب
// ─────────────────────────────────────────────────────────────
export async function cancelDonationRequest(requestId: string) {
  const { data } = await axiosInstance.patch<{ msg: string }>(
    `/api/donation-requests/${requestId}/cancel`
  );
  return data;
}

// ─────────────────────────────────────────────────────────────
// الاستجابة لطلب — مع صورة اختيارية ووصف
// ─────────────────────────────────────────────────────────────
export type RespondPayload = {
  condition:    'جديد' | 'مستعمل ممتاز' | 'مستعمل جيد';
  safeHub:      string;
  description?: string;
  imageFile?:   File;
};

export type RespondResponse = {
  msg:  string;
  item: {
    _id:      string;
    title:    string;
    category: string;
    status:   string;
    safeHub:  { name: string; city: string };
  };
};

export async function respondToDonationRequest(
  requestId: string,
  payload:   RespondPayload
): Promise<RespondResponse> {
  const formData = new FormData();
  formData.append('condition', payload.condition);
  formData.append('safeHub',   payload.safeHub);

  if (payload.description?.trim()) {
    formData.append('description', payload.description.trim());
  }
  if (payload.imageFile) {
    formData.append('image', payload.imageFile);
  }

  const { data } = await axiosInstance.post<RespondResponse>(
    `/api/donation-requests/${requestId}/offer`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
}