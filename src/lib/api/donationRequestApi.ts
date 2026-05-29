// src/lib/api/donationRequestApi.ts
import axiosInstance from '@/lib/api/axiosInstance';
import type {
  DonationRequest,
  CreateDonationRequestPayload,
  DonationRequestsListResponse,
} from '@/types/donationRequest.types';

export async function getDonationRequests(params?: { page?: number; category?: string; mine?: boolean }) {
  const { data } = await axiosInstance.get<DonationRequestsListResponse>('/api/donation-requests', {
    params,
  });
  return data;
}

export async function createDonationRequest(payload: CreateDonationRequestPayload) {
  const { data } = await axiosInstance.post<{ msg: string; request: DonationRequest }>(
    '/api/donation-requests',
    payload,
  );
  return data;
}

export async function cancelDonationRequest(requestId: string) {
  const { data } = await axiosInstance.patch<{ msg: string }>(
    `/api/donation-requests/${requestId}/cancel`,
  );
  return data;
}
