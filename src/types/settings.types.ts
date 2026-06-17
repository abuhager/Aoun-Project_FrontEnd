// src/types/settings.types.ts
// ✅ مطابقة كاملة لـ SystemSettings Schema في الـ Backend

export interface PublicSettings {
  platformName?: string;
  categories:    string[];
  reportReasons: string[];
  locations?:    string[];
}

export interface SystemSettings {
  _id:                           string;
  defaultQuota:                  number;
  level2Quota:                   number;
  maxBookingsPerUser:            number;
  maxActiveRequestsPerMonth:     number;
  requestExpiryDays:             number;
  donorQuotaReward:              number;
  trustScorePerDonation:         number;
  trustScorePerRequest:          number;
  bookingExpiryHours:            number;
  // ✅ DC-01: الحقلان المستعادان
  maxActiveDonationsPerUser:     number;
  maxActiveDonationsLevel2Plus:  number;
  categories:                    string[];
  reportReasons:                 string[];
  autoReportBanThreshold:        number;
  quotaResetDayOfMonth:          number;
  universityEmailDomains:        string[];
  requireHubForBooking:          boolean;
  maintenanceMode:               boolean;
  platformName:                  string;
  contactEmail:                  string;
  createdAt:                     string;
  updatedAt:                     string;
}

// ✅ DC-07 FIX: النوع الآمن للإرسال — يحذف الحقول المحمية تلقائياً
export type UpdateSettingsPayload = Partial<
  Omit<SystemSettings, '_id' | 'createdAt' | 'updatedAt'>
>;