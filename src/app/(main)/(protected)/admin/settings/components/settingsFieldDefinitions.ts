import type { SystemSettings } from "@/types/settings.types";

export type NumericSettingKey = {
  [Key in keyof SystemSettings]: SystemSettings[Key] extends number ? Key : never;
}[keyof SystemSettings];

export type NumberFieldDefinition = {
  key: NumericSettingKey;
  label: string;
  min: number;
  max: number;
  hint?: string;
};

export const QUOTA_FIELDS = [
  { key: "defaultUserQuota", label: "كوتا مستوى 1", min: 1, max: 20, hint: "بريد موثق فقط" },
  { key: "level2Quota", label: "كوتا مستوى 2", min: 1, max: 20, hint: "جامعي أو هاتف" },
  { key: "studentQuota", label: "كوتا الطالب الجامعي", min: 1, max: 20, hint: "تُمنح عند التحقق من النطاق الجامعي" },
  { key: "studentDefaultTrustLevel", label: "مستوى الثقة الافتراضي للطلاب", min: 1, max: 2, hint: "1 = بريد فقط، 2 = موثق" },
  { key: "donorQuotaReward", label: "مكافأة المتبرع", min: 0, max: 5, hint: "كوتا إضافية بعد التسليم" },
  { key: "maxActiveDonationsPerUser", label: "حد التبرعات النشطة (مستوى 1)", min: 1, max: 20, hint: "أقصى تبرعات مفتوحة بالتوازي" },
  { key: "maxActiveDonationsLevel2Plus", label: "حد التبرعات النشطة (مستوى 2+)", min: 1, max: 20, hint: "للمستخدمين الموثقين" },
  { key: "quotaResetDayOfMonth", label: "يوم تصفير الكوتا التلقائي", min: 1, max: 28, hint: "يوم تنفيذ المهمة الشهرية" },
  { key: "maxBookingsPerUser", label: "أقصى حجوزات نشطة معلقة", min: 1, max: 10, hint: "للمستخدم في نفس الوقت" },
  { key: "bookingExpiryHours", label: "انتهاء الحجز (ساعة)", min: 1, max: 336, hint: "بعدها يُلغى الحجز تلقائيًا" },
  { key: "maxWaitlistPerItem", label: "أقصى حجم لقائمة الانتظار", min: 1, max: 50, hint: "عدد المنتظرين لكل غرض" },
] as const satisfies readonly NumberFieldDefinition[];

export const REQUEST_FIELDS = [
  { key: "maxActiveRequestsPerMonth", label: "الحد الشهري لكل مستخدم", min: 1, max: 5, hint: "عدد الطلبات النشطة" },
  { key: "requestExpiryDays", label: "مدة انتهاء الطلب (يوم)", min: 1, max: 180, hint: "تلقائياً من تاريخ النشر" },
] as const satisfies readonly NumberFieldDefinition[];

export const REPORT_FIELDS = [
  { key: "autoReportBanThreshold", label: "عتبة الحظر التلقائي", min: 1, max: 20, hint: "عدد البلاغات المعتمدة قبل الحظر" },
  { key: "appealWindowHours", label: "مهلة الاعتراض (ساعة)", min: 1, max: 336, hint: "المدة المتاحة للمستخدم لتقديم اعتراض" },
] as const satisfies readonly NumberFieldDefinition[];

export const TRUST_FIELDS = [
  { key: "trustScorePerDonation", label: "نقاط الثقة لكل تبرع", min: 0, max: 20, hint: "تُضاف بعد التسليم المؤكد" },
  { key: "trustScorePerRequest", label: "نقاط الثقة لكل طلب", min: 0, max: 10, hint: "تُضاف عند إتمام الطلب" },
  { key: "ratingThresholdExcellent", label: "حد تقييم ممتاز (+2 نقطة)", min: 1, max: 10, hint: "درجة ≥ هذه القيمة ← +2 نقطة ثقة" },
  { key: "ratingThresholdGood", label: "حد تقييم جيد (+1 نقطة)", min: 1, max: 10, hint: "درجة ≥ هذه القيمة ← +1 نقطة ثقة" },
  { key: "ratingThresholdNeutral", label: "حد تقييم محايد (0)", min: 1, max: 10 },
  { key: "ratingThresholdBad", label: "حد تقييم سيئ (-1 نقطة)", min: 1, max: 10 },
] as const satisfies readonly NumberFieldDefinition[];

export const ELIGIBILITY_FIELDS = [
  { key: "minTrustLevelForRequests", label: "الحد الأدنى للثقة لطلب غرض", min: 1, max: 2, hint: "مستوى الثقة المطلوب لفتح طلب" },
  { key: "minTrustLevelForDonating", label: "الحد الأدنى للثقة للتبرع", min: 1, max: 2, hint: "مستوى الثقة المطلوب لإضافة عرض تبرع" },
  { key: "maxPendingOffersPerDonor", label: "أقصى عروض معلقة لكل متبرع", min: 1, max: 20, hint: "الحد الأقصى للعروض التي لم تُحسم بعد" },
] as const satisfies readonly NumberFieldDefinition[];

export const SECURITY_FIELDS = [
  { key: "otpExpiryMinutes", label: "صلاحية OTP (دقيقة)", min: 1, max: 60 },
  { key: "maxOtpAttempts", label: "أقصى محاولات OTP", min: 3, max: 10 },
  { key: "resetPasswordExpiryMinutes", label: "صلاحية استعادة كلمة المرور (دقيقة)", min: 5, max: 60 },
  { key: "maxAvatarSizeMb", label: "أقصى حجم للصورة (MB)", min: 1, max: 20 },
  { key: "avatarWidth", label: "عرض الصورة الشخصية", min: 100, max: 1000 },
  { key: "avatarHeight", label: "ارتفاع الصورة الشخصية", min: 100, max: 1000 },
  { key: "maxPageSize", label: "أقصى حجم صفحة API", min: 5, max: 100 },
  { key: "profilePageSize", label: "حجم صفحة الملف الشخصي", min: 5, max: 50 },
  { key: "adminPageSize", label: "حجم صفحات الإدارة", min: 5, max: 100 },
  { key: "adminReportsPageSize", label: "حجم صفحة البلاغات", min: 5, max: 50 },
] as const satisfies readonly NumberFieldDefinition[];
