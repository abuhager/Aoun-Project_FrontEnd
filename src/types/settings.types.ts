export interface SystemSettings {
  categories: string[];
  reportReasons: string[];
  defaultQuota: number;
  level2Quota: number;
  maxActiveRequestsPerMonth: number;
  requestExpiryDays: number;
  platformName: string;
  maintenanceMode: boolean;
}