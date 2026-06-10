// src/types/settings.types.ts

export interface SystemSettings {
  defaultQuota:               number;
  level2Quota:                number;
  maxActiveRequestsPerMonth:  number;
  requestExpiryDays:          number;
  bookingExpiryHours:         number;
  maxActiveItems:             number;
  minTrustLevelForRequests:   number;
  maxPageSize:                number;
  donorQuotaReward:           number;
  trustScorePerDonation:      number;
  categories:                 string[];
  locations:                  string[];
  reportReasons:              string[];
  autoReportBanThreshold:     number;
  maintenanceMode:            boolean;
  platformName:               string;
}
