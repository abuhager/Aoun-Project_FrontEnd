import axiosInstance from '@/lib/api/axiosInstance';
import type {
  CreateDonationRequestPayload,
  CreateDonationRequestResponse,
  DonationRequest,
  DonationRequestsListResponse,
  DonationOffer,
  GetDonationRequestsParams,
  MyDonationRequestsResponse,
} from '@/types/donationRequest.types';

export async function getDonationRequests(params?: GetDonationRequestsParams) {
  const { data } = await axiosInstance.get<DonationRequestsListResponse>(
    '/api/donation-requests',
    { params }
  );
  return data;
}

export async function getMyDonationRequests() {
  const { data } = await axiosInstance.get<MyDonationRequestsResponse>(
    '/api/donation-requests/me'
  );
  return data;
}

export async function createDonationRequest(payload: CreateDonationRequestPayload) {
  const { data } = await axiosInstance.post<CreateDonationRequestResponse>(
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

export async function getDonationRequestById(requestId: string) {
  const { data } = await axiosInstance.get<{ request: DonationRequest }>(
    `/api/donation-requests/${requestId}`
  );
  return data;
}

export async function getOffersByRequest(requestId: string) {
  const { data } = await axiosInstance.get<{ offers: DonationOffer[] }>(
    `/api/donation-requests/${requestId}/offers`
  );
  return data;
}

export async function acceptOffer(requestId: string, offerId: string) {
  const { data } = await axiosInstance.post<{ msg: string; itemId: string }>(
    `/api/donation-requests/${requestId}/offers/${offerId}/accept`
  );
  return data;
}

export async function rejectOffer(requestId: string, offerId: string) {
  const { data } = await axiosInstance.patch<{ msg: string }>(
    `/api/donation-requests/${requestId}/offers/${offerId}/reject`
  );
  return data;
}

export async function withdrawOffer(requestId: string, offerId: string) {
  const { data } = await axiosInstance.patch<{ msg: string }>(
    `/api/donation-requests/${requestId}/offers/${offerId}/withdraw`
  );
  return data;
}

export type RespondPayload = {
  condition:    'جديد' | 'مستعمل ممتاز' | 'مستعمل جيد';
  safeHub?:     string;
  description?: string;
  imageFile?:   File;
};

export type SubmitOfferResponse = {
  msg:     string;
  offerId: string;
  status:  'pending';
};

export async function respondToDonationRequest(
  requestId: string,
  payload:   RespondPayload
): Promise<SubmitOfferResponse> {
  const formData = new FormData();
  formData.append('condition', payload.condition);
  if (payload.safeHub) formData.append('safeHub', payload.safeHub);
  if (payload.description?.trim())
    formData.append('description', payload.description.trim());
  if (payload.imageFile)
    formData.append('image', payload.imageFile);

  const { data } = await axiosInstance.post<SubmitOfferResponse>(
    `/api/donation-requests/${requestId}/offer`,
    formData
  );
  return data;
}
