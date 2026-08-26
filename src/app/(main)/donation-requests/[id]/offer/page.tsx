"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSiteConfig } from "@/context/SiteConfigContext";
import {
  getDonationRequestById,
  respondToDonationRequest,
} from "@/lib/api/donationRequestApi";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import { usePublicHubs } from "@/hooks/usePublicHubs";
import type { DonationRequest } from "@/types/donationRequest.types";
import PageIntro from "@/components/ui/PageIntro";

const CONDITIONS = ["جديد", "مستعمل ممتاز", "مستعمل جيد"] as const;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function DonationOfferPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { requireHubForBooking } = useSiteConfig();
  const { hubs, isLoading: hubsLoading } = usePublicHubs();
  const [request, setRequest] = useState<DonationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState<{
    condition: (typeof CONDITIONS)[number];
    safeHub: string;
    description: string;
    imageFile: File | null;
  }>({
    condition: "مستعمل جيد",
    safeHub: "",
    description: "",
    imageFile: null,
  });

  useEffect(() => {
    if (authLoading || !id) return;
    const controller = new AbortController();

    getDonationRequestById(id, controller.signal)
      .then((requestResponse) => {
        setRequest(requestResponse.request);
      })
      .catch((loadError) => {
        if (!controller.signal.aborted) {
          setError(extractErrorMsg(loadError, "تعذر تحميل بيانات العرض"));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [authLoading, id]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const blockedReason = useMemo(() => {
    if (!request) return null;
    if (!user) return "يجب تسجيل الدخول لتقديم عرض تبرع.";
    if (request.status !== "active") return "هذا الطلب لم يعد مفتوحاً للعروض.";
    if (request.requester?._id === user._id) return "لا يمكنك تقديم عرض لطلبك الخاص.";
    if (request.viewerOffer) {
      const labels = {
        pending: "عرضك قيد المراجعة لدى صاحب الطلب.",
        accepted: "تم قبول عرضك وربطه بالغرض.",
        rejected: "لم يتم اختيار عرضك لهذا الطلب.",
        withdrawn: "سبق أن سحبت عرضك لهذا الطلب.",
        cancelled_by_requester: "ألغى صاحب الطلب هذا الطلب.",
        request_expired: "انتهت مدة الطلب قبل اختيار العرض.",
      } as const;
      return labels[request.viewerOffer.status];
    }
    return null;
  }, [request, user]);

  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (preview) URL.revokeObjectURL(preview);

    if (file && !ALLOWED_IMAGE_TYPES.has(file.type)) {
      event.target.value = "";
      setPreview(null);
      setForm((current) => ({ ...current, imageFile: null }));
      setError("الصورة يجب أن تكون JPG أو PNG أو WebP");
      return;
    }
    if (file && file.size > MAX_IMAGE_BYTES) {
      event.target.value = "";
      setPreview(null);
      setForm((current) => ({ ...current, imageFile: null }));
      setError("حجم الصورة يجب ألا يتجاوز 5MB");
      return;
    }

    setError(null);
    setForm((current) => ({ ...current, imageFile: file }));
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id || (requireHubForBooking && !form.safeHub) || blockedReason) return;

    setSubmitting(true);
    setError(null);
    try {
      await respondToDonationRequest(id, {
        condition: form.condition,
        safeHub: form.safeHub || undefined,
        description: form.description.trim() || undefined,
        imageFile: form.imageFile ?? undefined,
      });
      router.replace(`/donation-requests/${id}?offer=submitted`);
    } catch (submitError) {
      setError(extractErrorMsg(submitError, "تعذر إرسال العرض"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading || hubsLoading) {
    return (
      <div className="mx-auto min-h-dvh max-w-2xl px-4 pt-24" dir="rtl">
        <div className="h-80 animate-pulse rounded-[30px] bg-white shadow-sm" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4" dir="rtl">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="font-black text-red-600">{error ?? "الطلب غير موجود"}</p>
          <Link href="/donation-requests" className="mt-4 inline-block text-sm font-bold text-primary">
            العودة إلى الطلبات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell pb-24 pt-20" dir="rtl">
      <div className="site-container space-y-6 md:pt-4">
        <Link
          href={`/donation-requests/${id}`}
          className="inline-flex items-center gap-1 text-xs font-black text-on-surface-variant hover:text-primary"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          العودة إلى الطلب
        </Link>

        <PageIntro
          eyebrow="استجابة لطلب تبرع"
          title={request.title}
          description="أرسل تفاصيل الغرض الذي تستطيع تقديمه. لن يتحول إلى تبرع محجوز إلا بعد مراجعة صاحب الطلب وقبوله."
          icon="volunteer_activism"
          tone="warm"
          meta={
            <>
              <span className="data-chip">{request.category}</span>
              <span className="data-chip">
                <span className="material-symbols-outlined text-[15px]">location_on</span>
                {request.location}
              </span>
              <span className="data-chip">
                <span className="material-symbols-outlined text-[15px]">privacy_tip</span>
                لا تُشارك بيانات التواصل هنا
              </span>
            </>
          }
        />

        {blockedReason ? (
          <section className="content-panel border-amber-200 bg-amber-50 p-8 text-center">
            <p className="font-black text-amber-800">{blockedReason}</p>
            {request.viewerOffer?.status === "accepted" && request.fulfilledByItem?._id && (
              <Link
                href={`/items/${request.fulfilledByItem._id}`}
                className="mt-4 inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white"
              >
                متابعة الغرض
              </Link>
            )}
          </section>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <form onSubmit={submit} className="content-panel overflow-hidden">
            <div className="border-b border-black/[0.06] px-6 py-5">
              <span className="section-kicker">DONATION OFFER</span>
              <h2 className="mt-1 text-lg font-black">تفاصيل العرض</h2>
              <p className="mt-1 text-xs leading-6 text-on-surface-soft">الحقول المعلّمة مطلوبة لإرسال عرض واضح وقابل للمراجعة.</p>
            </div>
            <div className="space-y-5 p-6">
            {error && (
              <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            <label className="block space-y-1.5">
              <span className="text-xs font-black text-gray-700">حالة الغرض</span>
              <select
                value={form.condition}
                onChange={(event) => setForm((current) => ({
                  ...current,
                  condition: event.target.value as (typeof CONDITIONS)[number],
                }))}
                className="field-control px-4 py-3 text-sm"
              >
                {CONDITIONS.map((condition) => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-black text-gray-700">
                نقطة التسليم الآمنة {requireHubForBooking ? "*" : "(اختيارية)"}
              </span>
              <select
                value={form.safeHub}
                onChange={(event) => setForm((current) => ({ ...current, safeHub: event.target.value }))}
                required={requireHubForBooking}
                className="field-control px-4 py-3 text-sm"
              >
                <option value="">اختر نقطة التسليم</option>
                {hubs.map((hub) => (
                  <option key={hub._id} value={hub._id}>{hub.name} — {hub.city}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-black text-gray-700">وصف الغرض (اختياري)</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                maxLength={500}
                rows={5}
                className="field-control min-h-32 resize-none px-4 py-3 text-sm"
              />
              <span className="block text-left text-[10px] text-gray-400">{form.description.length}/500</span>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-black text-gray-700">صورة الغرض (اختيارية)</span>
              <span className="relative flex h-48 cursor-pointer items-center justify-center overflow-hidden rounded-[16px] border-2 border-dashed border-outline-variant bg-surface-container-low transition-colors hover:border-primary/40 hover:bg-primary-softer">
                {preview ? (
                  <Image
                    src={preview}
                    alt="معاينة الغرض"
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 672px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-gray-400">JPG, PNG, WebP — حتى 5MB</span>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={onImageChange}
                />
              </span>
            </label>

            </div>
            <div className="border-t border-black/[0.06] bg-surface-container-low/60 p-6">
            <button
              type="submit"
              disabled={
                submitting
                || (requireHubForBooking && (!form.safeHub || hubs.length === 0))
              }
              className="btn-primary w-full rounded-xl py-3.5 text-sm"
            >
              {submitting ? "جارٍ إرسال العرض..." : "إرسال العرض للمراجعة 🎁"}
            </button>
            </div>
          </form>
          <aside className="content-panel overflow-hidden lg:sticky lg:top-24">
            <div className="bg-primary-container p-5 text-white">
              <span className="material-symbols-outlined text-2xl text-[#f3c36f]">fact_check</span>
              <h2 className="mt-2 text-base font-black text-white">قبل إرسال العرض</h2>
              <p className="mt-1 text-xs leading-6 text-white/60">تأكد أن الغرض مطابق للاحتياج ويمكن تسليمه ضمن المدينة المحددة.</p>
            </div>
            <ol className="space-y-0 p-5">
              {[
                ["01", "صف الحالة بدقة", "اختر الحالة الفعلية وأضف أي ملاحظة مهمة."],
                ["02", "أرفق صورة واضحة", "الصورة اختيارية لكنها تساعد صاحب الطلب على القرار."],
                ["03", "اختر نقطة التسليم", "استخدم مركزًا آمنًا عندما تكون السياسة مفعّلة."],
              ].map(([number, title, text]) => (
                <li key={number} className="flex gap-3 border-b border-black/[0.06] py-4 first:pt-0 last:border-b-0 last:pb-0">
                  <span className="font-headline text-sm font-black text-primary/55">{number}</span>
                  <div>
                    <p className="text-xs font-black">{title}</p>
                    <p className="mt-1 text-[11px] leading-6 text-on-surface-soft">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
          </div>
        )}
      </div>
    </div>
  );
}
