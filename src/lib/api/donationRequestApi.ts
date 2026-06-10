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

export async function respondToDonationRequest(
  requestId: string,
  data: {
    condition: 'جديد' | 'مستعمل ممتاز' | 'مستعمل جيد';
    safeHub:   string;
    description?: string;
    location?:    string;
  },
  imageFile?: File
): Promise<{ msg: string; item: { _id: string; title: string; safeHub: { name: string; city: string } } }> {
  const formData = new FormData();
  formData.append('condition',   data.condition);
  formData.append('safeHub',     data.safeHub);
  if (data.description) formData.append('description', data.description);
  if (data.location)    formData.append('location',    data.location);
  if (imageFile)        formData.append('image',       imageFile);

  const res = await axiosInstance.post(
    `/api/donation-requests/${requestId}/respond`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return res.data;
}