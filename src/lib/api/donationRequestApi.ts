import axiosInstance from '@/lib/api/axiosInstance';
import type {
  DonationRequest,
  CreateDonationRequestPayload,
  DonationRequestsListResponse,
  GetDonationRequestsParams,
  MyDonationRequestsResponse,
} from '@/types/donationRequest.types';

export async function getDonationRequests(params?: GetDonationRequestsParams) {
  const queryParams = {
    ...(params?.page ? { page: params.page } : {}),
    ...(params?.limit ? { limit: params.limit } : {}),
    ...(params?.category ? { category: params.category } : {}),
    ...(params?.location ? { location: params.location } : {}),
    ...(typeof params?.mine === 'boolean' ? { mine: params.mine } : {}),
  };

  const { data } = await axiosInstance.get<DonationRequestsListResponse>('/api/donation-requests', {
    params: queryParams,
  });

  return data;
}

export async function getMyDonationRequests() {
  const { data } = await axiosInstance.get<MyDonationRequestsResponse>('/api/donation-requests/me');
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