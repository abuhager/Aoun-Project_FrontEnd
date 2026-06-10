// src/types/donationRequest.types.ts
export type DonationRequestStatus = 'active' | 'fulfilled' | 'expired' | 'cancelled';

export interface DonationRequestUser {
  _id: string; name: string; avatar?: string; trustScore?: number; trustLevel?: number;
}

export interface DonationRequest {
  _id: string; requester?: DonationRequestUser;
  title: string; description: string; category: string; location: string;
  status: DonationRequestStatus; createdAt: string; expiresAt: string;
  month?: string;
  urgency?: 'low' | 'medium' | 'high';
}

export interface CreateDonationRequestPayload {
  title: string; description: string; category: string; location: string;
  urgency?: 'low' | 'medium' | 'high';
}

export interface GetDonationRequestsParams {
  page?:     number;
  limit?:    number;
  category?: string;
  location?: string;
  mine?:     boolean;   // ✅ إضافة mine — مستخدم في donation-requests/page.tsx
}

export interface DonationRequestsListResponse {
  requests: DonationRequest[]; total: number; page: number; pages: number;
}

export interface MyDonationRequestsResponse {
  requests: DonationRequest[];
  quota: { used: number; max: number; remaining: number; };
}

export interface RespondToRequestPayload {
  condition:    'جديد' | 'مستعمل ممتاز' | 'مستعمل جيد';
  safeHub:      string;
  description?: string;
  location?:    string;
}