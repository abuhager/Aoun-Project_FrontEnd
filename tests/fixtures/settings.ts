import type { SystemSettings } from '../../src/types/settings.types';

export const settingsFixture: SystemSettings = {
  _id: 'global', version: 1, defaultUserQuota: 2, studentQuota: 5,
  studentDefaultTrustLevel: 2, level2Quota: 4, maxBookingsPerUser: 3,
  maxActiveRequestsPerMonth: 1, maxActiveDonationsPerUser: 2,
  maxActiveDonationsLevel2Plus: 4, maxWaitlistPerItem: 10,
  bookingExpiryHours: 72, requestExpiryDays: 30, donorQuotaReward: 1,
  trustScorePerDonation: 5, trustScorePerRequest: 2,
  ratingThresholdExcellent: 9, ratingThresholdGood: 7, ratingThresholdNeutral: 5,
  ratingThresholdBad: 3, categories: ['كتب'], locations: ['عمان'], reportReasons: ['عدم الحضور'],
  autoReportBanThreshold: 3, appealWindowHours: 48, otpExpiryMinutes: 10,
  maxOtpAttempts: 5, resetPasswordExpiryMinutes: 30, maxAvatarSizeMb: 5,
  avatarWidth: 300, avatarHeight: 300, maxPageSize: 50, profilePageSize: 10,
  adminPageSize: 20, adminReportsPageSize: 20, minTrustLevelForRequests: 2,
  minTrustLevelForDonating: 1, maxPendingOffersPerDonor: 5,
  universityEmailDomains: ['@student.aoun.invalid'], quotaResetDayOfMonth: 1,
  requireHubForBooking: false, donationRequestsEnabled: true, maintenanceMode: false,
  platformName: 'عون', contactEmail: 'support@aoun.invalid',
  createdAt: '2026-10-09T00:00:00Z', updatedAt: '2026-10-09T00:00:00Z',
};
