// src/types/hub.ts
// ✅ FIX [HUB-01]: address (وليس location) — مطابق للـ Backend Schema

export interface SafeHub {
  _id:          string;
  name:         string;
  address:      string;   // ✅ كان يُكتب location في بعض Components
  city:         string;
  coordinates?: { lat: number; lng: number };
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
  coordinates?:  { lat: number; lng: number };
}

export interface UpdateHubPayload {
  name?:         string;
  address?:      string;
  city?:         string;
  isActive?:     boolean;
  workingHours?: string;
  coordinates?:  { lat: number; lng: number };
}

export interface HubSelectOption {
  value:    string;   // _id
  label:    string;   // "اسم المركز — المدينة"
  isActive: boolean;
}