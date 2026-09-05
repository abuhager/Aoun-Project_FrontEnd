// src/types/hub.ts
// ✅ FIX [HUB-01]: address (وليس location) — مطابق للـ Backend Schema

export interface HubCoordinates {
  lat: number;
  lng: number;
}

export interface SafeHub {
  _id:          string;
  name:         string;
  address:      string;   // ✅ كان يُكتب location في بعض Components
  city:         string;
  coordinates?: HubCoordinates | null;
  workingHours: string;
  isActive:     boolean;
  createdBy?:   string;   // Admin فقط
  createdAt?:   string;
  updatedAt?:   string;
}

export interface CreateHubPayload {
  name:          string;
  address:       string;  // ✅ address وليس location
  city:          string;
  workingHours?: string;
  coordinates?:  HubCoordinates;
}

export interface UpdateHubPayload {
  name?:         string;
  address?:      string;
  city?:         string;
  workingHours?: string;
  coordinates?:  HubCoordinates | null;
}

export interface HubMutationResponse {
  msg: string;
  hub: SafeHub;
}
