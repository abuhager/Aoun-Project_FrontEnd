type DonationRequestStatus  = 'active' | 'fulfilled' | 'expired' | 'cancelled';

type DonationOfferStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'
  | 'cancelled_by_requester'
  | 'request_expired';

interface DonationRequestUser {
  _id:         string;
  name:        string;
  avatar:      string | null;
  trustScore:  number | null;
  trustLevel:  number | null;
}

export interface DonationOffer {
  _id:     string;
  request: string;
  donor: {
    _id:        string;
    name:       string;
    avatar:     string | null;
    trustLevel: number | null;
    trustScore: number | null;
  } | null;
  safeHub: {
    _id:     string;
    name:    string;
    city:    string;
    address: string;
  } | null;
  condition:    string;
  description:  string | null;
  imageUrl:     string | null;
  status:       DonationOfferStatus;
  createdAt:    string;
}

export interface DonationRequest {
  _id:          string;
  title:        string;
  category:     string;
  urgency:      'low' | 'medium' | 'high';
  description:  string | null;
  location:     string;
  status:       DonationRequestStatus;
  requester:    DonationRequestUser | null;
  viewerOffer?: {
    _id:       string;
    status:    DonationOfferStatus;
    createdAt: string;
  } | null;
  fulfilledByItem?: {
    _id:                string;
    status:             string;
    condition:          string;
    recipientConfirmed: boolean;
    donorConfirmed:     boolean;
    safeHub: { name: string; city: string; address: string } | null;
    donor:   { _id: string; name: string } | null;
  } | null;
  month:      string | null;
  expiresAt:  string | null;
  createdAt:  string;
  updatedAt:  string;
}

interface QuotaInfo {
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

export interface CreateDonationRequestResponse {
  msg:     string;
  request: DonationRequest;
}
