// src/types/donationRequest.types.ts
export type DonationRequestStatus = 'active' | 'fulfilled' | 'expired' | 'cancelled';

export interface DonationRequestUser {
  _id: string;
  name: string;
  avatar?: string;
  trustScore?: number;
  trustLevel?: number;
}

export interface DonationRequest {
  _id: string;
  requester: DonationRequestUser;
  title: string;
  description: string;
  category: string;
  location: string;
  status: DonationRequestStatus;
  createdAt: string;
  expiresAt: string;
}

export interface CreateDonationRequestPayload {
  title: string;
  description: string;
  category: string;
  location: string;
}

export interface DonationRequestsListResponse {
  requests: DonationRequest[];
  total: number;
  page: number;
  pages: number;
}
