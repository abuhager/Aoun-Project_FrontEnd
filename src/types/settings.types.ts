export interface SystemSettings {
  defaultQuota:              number;
  level2Quota:               number;
  maxActiveRequestsPerMonth: number;
  requestExpiryDays:         number;
  categories:                string[];
  reportReasons:             string[];
  autoReportBanThreshold:    number;   // ✅ مُضاف
  maintenanceMode:           boolean;
  platformName:              string;
}