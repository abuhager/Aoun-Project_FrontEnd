// src/types/settings.types.ts
// ✅ مطابقة كاملة لـ SystemSettings Schema في الـ Backend (بعد الإصلاح)

export interface PublicSettings {
  platformName?: string;
  categories:    string[];
  reportReasons: string[];
  locations?:    string[];
}

export interface SystemSettings {
  _id: string;

  // ─── حصص المستخدمين ──────────────────────────────────────────────────
  // ✅ [NAME-MISMATCH-01]: defaultUserQuota بدل defaultQuota
  defaultUserQuota:         number;
  studentQuota:             number;
  studentDefaultTrustLevel: number;
  level2Quota:              number;

  // ─── حدود الحجز والتبرع ──────────────────────────────────────────────
  maxBookingsPerUser:           number;
  maxActiveRequestsPerMonth:    number;
  maxActiveDonationsPerUser:    number;
  maxActiveDonationsLevel2Plus: number;
  bookingExpiryHours:           number;
  requestExpiryDays:            number;

  // ─── نقاط الثقة والمكافآت ────────────────────────────────────────────
  donorQuotaReward:      number;
  trustScorePerDonation: number;
  trustScorePerRequest:  number;

  // ✅ [HC-RATING-01]: حدود التقييم الديناميكية
  ratingThresholdExcellent: number;
  ratingThresholdGood:      number;
  ratingThresholdNeutral:   number;
  ratingThresholdBad:       number;

  // ─── التصنيفات وأسباب البلاغات ───────────────────────────────────────
  categories:    string[];
  reportReasons: string[];

  // ─── حدود البلاغات والحظر ────────────────────────────────────────────
  autoReportBanThreshold: number;

  // ─── إعدادات OTP ─────────────────────────────────────────────────────
  otpExpiryMinutes:           number;
  maxOtpAttempts:             number;
  resetPasswordExpiryMinutes: number;

  // ─── إعدادات الصور ───────────────────────────────────────────────────
  maxAvatarSizeMb: number;
  avatarWidth:     number;
  avatarHeight:    number;

  // ─── إعدادات Pagination ──────────────────────────────────────────────
  maxPageSize:          number;
  profilePageSize:      number;
  // ✅ [HC-ADMIN-01/02]: حقول pagination الآدمن الجديدة
  adminPageSize:        number;
  adminReportsPageSize: number;

  // ─── إعدادات الطلبات والعروض ──────────────────────────────────────────
  // ✅ [HC-OFFER-01]: حقول الأهلية الجديدة
  minTrustLevelForRequests: number;
  minTrustLevelForDonating: number;
  maxPendingOffersPerDonor: number;

  // ─── إعدادات الجامعات ─────────────────────────────────────────────────
  universityEmailDomains: string[];

  // ─── إعدادات النظام العامة ────────────────────────────────────────────
  quotaResetDayOfMonth: number;
  requireHubForBooking: boolean;
  maintenanceMode:      boolean;
  platformName:         string;
  contactEmail:         string;
  createdAt:            string;
  updatedAt:            string;
}

export type UpdateSettingsPayload = Partial<
  Omit<SystemSettings, '_id' | 'createdAt' | 'updatedAt'>
>;