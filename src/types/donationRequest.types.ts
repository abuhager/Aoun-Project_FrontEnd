// src/types/donationRequest.types.ts ✅ PATCHED & FIXED FOR TYPESCRIPT COMPILER

export type DonationRequestStatus  = 'active' | 'fulfilled' | 'expired' | 'cancelled';
export type DonationOfferStatus    =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled_by_requester'; // ✅ FRONT-01: نوع جديد متوافق مع الـ Backend

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
  _id:             string;
  title:           string;
  category:        string;
  urgency:         'low' | 'medium' | 'high';
  description?:    string;
  location:        string;
  status:          DonationRequestStatus;
  requester:       DonationRequestUser;
  // ✅ تحديث الهيكلية هنا لتشمل خصائص الـ Double Confirmation وحالة الغرض ومعرف المتبرع
  fulfilledByItem?: {
    _id:                string;
    status:             string;
    condition:          string;           // 👈 مضاف للـ Build
    recipientConfirmed: boolean;          // 👈 مضاف للـ Build
    donorConfirmed:     boolean;          // 👈 مضاف للـ Build
    safeHub: { 
      name:    string; 
      city:    string; 
      address: string 
    };
    donor: { 
      _id:  string;                       // 👈 مضاف لفحص الـ Chat Authorization
      name: string 
    };
  } | null;
  month?:     string;
  expiresAt?: string;
  createdAt:  string;
  updatedAt:  string;
}

// ✅ FRONT-02: QuotaInfo interface بدل any
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
  quota:    QuotaInfo; // ✅ FRONT-02: كانت any
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