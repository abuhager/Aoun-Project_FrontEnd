// src/types/donationRequest.types.ts
// ✅ DC-15 FIX: DonationOfferStatus في Frontend يشمل 'cancelled_by_requester'
//    لكن DonationOffer Model في Backend لا يملك هذه القيمة في الـ enum!
//    التزامن مطلوب: إما إضافة القيمة للـ Backend Model، أو حذفها من Frontend

export type DonationRequestStatus  = 'active' | 'fulfilled' | 'expired' | 'cancelled';

// ✅ DC-15: مزامنة مع DonationOffer Model في Backend
// Backend enum: ['pending', 'accepted', 'rejected']
// ← إضافة 'cancelled_by_requester' للـ Backend Model مطلوبة (انظر التعليقات أدناه)
export type DonationOfferStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled_by_requester'; // ← يجب إضافته لـ Backend Model أيضاً

export interface DonationRequestUser {
  _id:         string;
  name:        string;
  avatar?:     string;
  trustScore?: number;
  trustLevel?: number;
}

export interface DonationOffer {
  _id:     string;
  request: string;
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
  condition:    string;
  description?: string;
  imageUrl?:    string;
  status:       DonationOfferStatus;
  createdAt:    string;
}

export interface DonationRequest {
  _id:          string;
  title:        string;
  category:     string;
  urgency:      'low' | 'medium' | 'high';
  description?: string;
  location:     string;
  status:       DonationRequestStatus;
  requester:    DonationRequestUser;
  fulfilledByItem?: {
    _id:                string;
    status:             string;
    condition:          string;
    recipientConfirmed: boolean;
    donorConfirmed:     boolean;
    safeHub: { name: string; city: string; address: string };
    donor:   { _id: string; name: string };
  } | null;
  month?:     string;
  expiresAt?: string;
  createdAt:  string;
  updatedAt:  string;
}

export interface QuotaInfo {
  used:      number;
  max:       number;
  remaining: number;
}

export interface DonationRequestsListResponse {
  requests: DonationRequest[];
  total:    number;
  page:     number;
  pages:    number;
}

export interface MyDonationRequestsResponse {
  requests: DonationRequest[];
  quota:    QuotaInfo;
}

export interface GetDonationRequestsParams {
  page?:     number;
  limit?:    number;
  category?: string;
  location?: string;
  urgency?:  string;
  mine?:     boolean;
}

export interface CreateDonationRequestPayload {
  title:        string;
  category:     string;
  urgency?:     'low' | 'medium' | 'high';
  description?: string;
  location:     string;
}