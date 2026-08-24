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
    <div className="min-h-dvh bg-[#f7f6f2] pb-24 text-[#191c1d]" dir="rtl">
      <div className="mx-auto max-w-2xl space-y-5 px-4 pt-20 md:pt-24">
        <Link
          href={`/donation-requests/${id}`}
          className="inline-flex items-center gap-1 text-xs font-black text-gray-500 hover:text-primary"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          العودة إلى الطلب
        </Link>

        <section className="rounded-[30px] border border-black/[0.06] bg-white p-6 shadow-sm">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black text-primary">
            عرض تبرع
          </span>
          <h1 className="mt-4 text-xl font-black md:text-2xl">{request.title}</h1>
          <p className="mt-2 text-sm leading-7 text-gray-500">
            سيُعرض تبرعك على صاحب الطلب، ولن يُنشأ الغرض المحجوز إلا بعد قبوله.
          </p>
        </section>

        {blockedReason ? (
          <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 text-center">
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
          <form onSubmit={submit} className="space-y-4 rounded-[30px] border border-black/[0.06] bg-white p-6 shadow-sm">
            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
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
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
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
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
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
                className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <span className="block text-left text-[10px] text-gray-400">{form.description.length}/500</span>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-black text-gray-700">صورة الغرض (اختيارية)</span>
              <span className="relative flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
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

            <button
              type="submit"
              disabled={
                submitting
                || (requireHubForBooking && (!form.safeHub || hubs.length === 0))
              }
              className="w-full rounded-2xl bg-primary py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "جارٍ إرسال العرض..." : "إرسال العرض للمراجعة 🎁"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
