"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { mutate } from "swr";
import { useAuth } from "@/context/AuthContext";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import { PUBLIC_SETTINGS_CACHE_KEY } from "@/lib/api/publicSettingsApi";
import { getAdminSettings, updateAdminSettings } from "@/lib/api/settingsApi";
import type { SystemSettings, UpdateSettingsPayload } from "@/types/settings.types";

const EDITABLE_FIELDS: (keyof SystemSettings)[] = [
  "defaultUserQuota",
  "studentQuota",
  "studentDefaultTrustLevel",
  "level2Quota",
  "maxBookingsPerUser",
  "maxActiveRequestsPerMonth",
  "requestExpiryDays",
  "maxActiveDonationsPerUser",
  "maxActiveDonationsLevel2Plus",
  "maxWaitlistPerItem",
  "donorQuotaReward",
  "bookingExpiryHours",
  "trustScorePerDonation",
  "trustScorePerRequest",
  "ratingThresholdExcellent",
  "ratingThresholdGood",
  "ratingThresholdNeutral",
  "ratingThresholdBad",
  "adminPageSize",
  "adminReportsPageSize",
  "minTrustLevelForRequests",
  "minTrustLevelForDonating",
  "maxPendingOffersPerDonor",
  "categories",
  "locations",
  "reportReasons",
  "autoReportBanThreshold",
  "appealWindowHours",
  "universityEmailDomains",
  "requireHubForBooking",
  "maintenanceMode",
  "platformName",
  "contactEmail",
  "quotaResetDayOfMonth",
  "otpExpiryMinutes",
  "maxOtpAttempts",
  "resetPasswordExpiryMinutes",
  "maxAvatarSizeMb",
  "avatarWidth",
  "avatarHeight",
  "maxPageSize",
  "profilePageSize",
];

const valuesEqual = (left: unknown, right: unknown) =>
  JSON.stringify(left) === JSON.stringify(right);

const validateSettingsDraft = (settings: SystemSettings): string | null => {
  if (!(
    settings.ratingThresholdExcellent > settings.ratingThresholdGood &&
    settings.ratingThresholdGood > settings.ratingThresholdNeutral &&
    settings.ratingThresholdNeutral > settings.ratingThresholdBad
  )) {
    return "يجب ترتيب حدود التقييم: ممتاز > جيد > محايد > سيئ";
  }
  if (settings.maxActiveDonationsLevel2Plus < settings.maxActiveDonationsPerUser) {
    return "حد تبرعات Level 2 لا يمكن أن يقل عن حد Level 1";
  }
  if (settings.categories.length === 0) return "يجب إضافة تصنيف واحد على الأقل";
  if (settings.locations.length === 0) return "يجب إضافة منطقة واحدة على الأقل";
  if (settings.reportReasons.length === 0) return "يجب إضافة سبب بلاغ واحد على الأقل";
  return null;
};

type ShowToast = (message: string, ok: boolean) => void;

export type UpdateSetting = <Key extends keyof SystemSettings>(
  key: Key,
  value: SystemSettings[Key]
) => void;

export function useAdminSettings(showToast: ShowToast) {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [savedSettings, setSavedSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { applyPublicSettings } = useSiteConfig();
  const canEdit = user?.role === "super_admin";

  const changedFields = useMemo(
    () => (!settings || !savedSettings
      ? []
      : EDITABLE_FIELDS.filter(
          (key) => !valuesEqual(settings[key], savedSettings[key])
        )),
    [savedSettings, settings]
  );
  const dirty = changedFields.length > 0;

  const fetchSettings = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await getAdminSettings(signal);
      if (!signal?.aborted) {
        setSettings(data);
        setSavedSettings(data);
      }
    } catch {
      if (!signal?.aborted) showToast("تعذر تحميل الإعدادات الحالية", false);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchSettings(controller.signal);
    return () => controller.abort();
  }, [fetchSettings]);

  const update: UpdateSetting = (key, value) => {
    if (!canEdit) return;
    setSettings((current) => current ? { ...current, [key]: value } : current);
  };

  const save = async () => {
    if (!settings || !savedSettings || !dirty || !canEdit) return;

    const validationError = validateSettingsDraft(settings);
    if (validationError) {
      showToast(validationError, false);
      return;
    }

    if (
      changedFields.includes("maintenanceMode") &&
      settings.maintenanceMode &&
      !savedSettings.maintenanceMode &&
      !window.confirm(
        "تفعيل وضع الصيانة سيوقف استخدام المنصة للمستخدمين. هل تريد المتابعة؟"
      )
    ) return;

    setSaving(true);
    try {
      const payload = Object.fromEntries(
        changedFields.map((key) => [key, settings[key]])
      ) as UpdateSettingsPayload;
      const result = await updateAdminSettings(payload);
      setSettings(result.settings);
      setSavedSettings(result.settings);
      applyPublicSettings(result.publicSettings);
      await mutate(PUBLIC_SETTINGS_CACHE_KEY, result.publicSettings, {
        revalidate: false,
      });
      showToast("✅ تم حفظ الإعدادات بنجاح", true);
    } catch (error: unknown) {
      showToast(extractErrorMsg(error, "حدث خطأ أثناء حفظ الإعدادات"), false);
    } finally {
      setSaving(false);
    }
  };

  return {
    canEdit,
    changedFields,
    dirty,
    loading,
    save,
    saving,
    settings,
    update,
  };
}
