// src/lib/api/donationRequestApi.ts
import axiosInstance from '@/lib/api/axiosInstance';
import type {
  CreateDonationRequestPayload,
  DonationRequestsListResponse,
  GetDonationRequestsParams,
  MyDonationRequestsResponse,
} from '@/types/donationRequest.types';

export async function getDonationRequests(params?: GetDonationRequestsParams) {
  const { data } = await axiosInstance.get<DonationRequestsListResponse>(
    '/api/donation-requests',
    {
      // ✅ إصلاح: تمرير params كاملاً بدل بنائه يدوياً — mine كانت مفقودة تماماً
      //    axios يتجاهل تلقائياً أي قيمة undefined فلا داعي لتصفية يدوية
      params,
    }
  );
  return data;
}

// طلباتي مع الـ Quota
export async function getMyDonationRequests() {
  const { data } = await axiosInstance.get<MyDonationRequestsResponse>(
    '/api/donation-requests/me'
  );
  return data;
}

export async function createDonationRequest(payload: CreateDonationRequestPayload) {
  const { data } = await axiosInstance.post<{ msg: string }>(
    '/api/donation-requests',
    payload
  );
  return data;
}

export async function cancelDonationRequest(requestId: string) {
  const { data } = await axiosInstance.patch<{ msg: string }>(
    `/api/donation-requests/${requestId}/cancel`
  );
  return data;
}
