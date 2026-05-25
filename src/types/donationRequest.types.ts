// src/types/donationRequest.types.ts
// Phase 5 — طلبات التبرع

export type DonationRequestStatus = 'active' | 'fulfilled' | 'expired' | 'cancelled';

export interface DonationRequest {
  _id:         string;
  requester:   { _id: string; name: string; avatar?: string; trustScore: number };
  title:       string;
  description: string;
  category:    string;
  location:    string;
  status:      DonationRequestStatus;
  fulfilledBy?: string; // userId
  createdAt:   string;
  expiresAt:   string; // 30 يوم من الإنشاء
}

export interface CreateDonationRequestPayload {
  title:       string;
  description: string;
  category:    string;
  location:    string;
}