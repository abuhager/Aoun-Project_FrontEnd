export interface SafeHub {
  _id:          string;
  name:         string;
  location:     string;
  address:      string;
  coords?:      { lat: number; lng: number };
  isActive:     boolean;
  workingHours: string;
  createdAt:    string;
}