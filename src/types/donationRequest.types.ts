import type { ItemCategory } from './item.types';

export type RequestStatus = 'active' | 'fulfilled' | 'expired' | 'cancelled';

export interface DonationRequest {
  _id:         string;
  requester:   { _id: string; name: string; avatar: string; trustLevel: 1 | 2 };
  title:       string;
  category:    ItemCategory;
  description: string;
  location:    string;
  status:      RequestStatus;
  month:       string;
  expiresAt:   string;
  createdAt:   string;
}

export interface CreateDonationRequestPayload {
  title:       string;
  category:    ItemCategory;
  description: string;
  location:    string;
}