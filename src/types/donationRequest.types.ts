// src/types/donationRequest.types.ts

export type DonationRequestStatus = 'active' | 'fulfilled' | 'expired' | 'cancelled';
export type DonationOfferStatus   = 'pending' | 'accepted' | 'rejected';

export interface DonationRequestUser {
  _id: string; name: string; avatar?: string; trustScore?: number; trustLevel?: number;
}

// ── عرض التبرع (DonationOffer) ──────────────────────────────
export interface DonationOffer {
  _id:         string;
  request:     string;
  donor: {
    _id:        string;
    name:       string;
    avatar?:    string;
    trustLevel: number;
    trustScore: number;
  };
  safeHub: {
    _id:     string;
    name:    string;
    city:    string;
    address: string;
  };
  condition:    'جديد' | 'مستعمل ممتاز' | 'مستعمل جيد';
  description?: string;
  imageUrl?:    string;
  status:       DonationOfferStatus;
  createdAt:    string;
}

export interface GetOffersResponse {
  offers: DonationOffer[];
}

export interface AcceptOfferPayload {
  // لا يحتاج body — requestId و offerId في الـ URL
}

// ── طلب التبرع (DonationRequest) ────────────────────────────
export interface DonationRequest {
  _id:         string;
  title:       string;
  description: string;
  category:    string;
  location:    string;
  urgency:     'low' | 'medium' | 'high';
  status:      DonationRequestStatus;
  requester: {
    _id:  string;
    name: string;
  };
  fulfilledByItem?: {
    _id:                string;
    condition:          string;
    status:             string;
    recipientConfirmed: boolean;
    donorConfirmed:     boolean;
    safeHub?: { name: string; city: string; address: string; };
    donor?:  { _id: string; name: string; };
  } | null;
  expiresAt?: string;
  createdAt:  string;
}

export interface CreateDonationRequestPayload {
  title: string; description: string; category: string; location: string;
  urgency?: 'low' | 'medium' | 'high';
}

export interface GetDonationRequestsParams {
  page?: number; limit?: number; category?: string; location?: string; mine?: boolean;
}

export interface DonationRequestsListResponse {
  requests: DonationRequest[]; total: number; page: number; pages: number;
}

export interface MyDonationRequestsResponse {
  requests: DonationRequest[];
  quota: { used: number; max: number; remaining: number; };
}

export interface SubmitOfferPayload {
  condition:    'جديد' | 'مستعمل ممتاز' | 'مستعمل جيد';
  safeHub:      string;
  description?: string;
  image?:       File;
}