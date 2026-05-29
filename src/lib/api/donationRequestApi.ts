// src/lib/api/donationRequestApi.ts
import axiosInstance from '@/lib/api/axiosInstance';

export interface DonationRequestPayload {
  title:       string;
  description?: string;
  category:    string;
  location:    string;
  urgency?:    'low' | 'medium' | 'high';
}

export interface DonationRequestItem {
  _id:         string;
  title:       string;
  description?: string;
  category:    string;
  location:    string;
  urgency:     'low' | 'medium' | 'high';
  status:      'active' | 'fulfilled' | 'cancelled' | 'expired';
  month:       string;
  expiresAt:   string;
  createdAt:   string;
  requester: {
    _id:        string;
    name:       string;
    avatar?:    string;
    trustLevel: number;
  };
}

export interface MyRequestsResponse {
  requests: DonationRequestItem[];
  quota: {
    used:      number;
    max:       number;
    remaining: number;
  };
}

export interface GetRequestsResponse {
  requests: DonationRequestItem[];
  total:    number;
  page:     number;
  pages:    number;
}

// جلب الطلبات النشطة
export const getDonationRequests = (params?: {
  category?: string;
  page?:     number;
  limit?:    number;
}) =>
  axiosInstance
    .get<GetRequestsResponse>('/api/donation-requests', { params })
    .then((r) => r.data);

// طلباتي
export const getMyDonationRequests = () =>
  axiosInstance
    .get<MyRequestsResponse>('/api/donation-requests/me')
    .then((r) => r.data);

// نشر طلب جديد
export const createDonationRequest = (payload: DonationRequestPayload) =>
  axiosInstance
    .post<{ msg: string; request: DonationRequestItem }>('/api/donation-requests', payload)
    .then((r) => r.data);

// إلغاء طلب
export const cancelDonationRequest = (requestId: string) =>
  axiosInstance
    .patch<{ msg: string }>(`/api/donation-requests/${requestId}/cancel`)
    .then((r) => r.data);
