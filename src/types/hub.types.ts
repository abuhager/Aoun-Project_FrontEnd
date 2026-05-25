// src/types/hub.types.ts

export interface SafeHub {
  _id:          string;
  name:         string;
  address:      string;
  city:         string;
  coordinates?: { lat: number; lng: number };
  workingHours: string;
  isActive:     boolean;
  createdAt:    string;
}

// للـ Dropdown عند نشر الغرض
export interface HubSelectOption {
  value:    string; // _id
  label:    string; // name + city
  isActive: boolean;
}