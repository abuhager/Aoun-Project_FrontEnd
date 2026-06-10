// src/lib/api/donationRequestApi.ts
// [FIX-1] getMyDonationRequests مُصدَّرة من /api/donation-requests/me
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
    { params: { page: params?.page, limit: params?.limit, category: params?.category, location: params?.location } }
  );
  return data;
}

// [FIX-1] تُرجع requests + quota { used, max, remaining }
export async function getMyDonationRequests() {
  const { data } = await axiosInstance.get<MyDonationRequestsResponse>('/api/donation-requests/me');
  return data;
}

export async function createDonationRequest(payload: CreateDonationRequestPayload) {
  const { data } = await axiosInstance.post<{ msg: string }>('/api/donation-requests', payload);
  return data;
}

export async function cancelDonationRequest(requestId: string) {
  const { data } = await axiosInstance.patch<{ msg: string }>(`/api/donation-requests/${requestId}/cancel`);
  return data;
}
