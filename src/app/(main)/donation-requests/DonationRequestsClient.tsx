"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import type { DonationRequest } from "@/types/donationRequest.types";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import { useAuth } from "@/context/AuthContext";
import { useSiteConfig } from "@/context/SiteConfigContext";

import {
  getDonationRequests,
  cancelDonationRequest,
  respondToDonationRequest,
} from "@/lib/api/donationRequestApi";
import { useSettings } from "@/hooks/useSettings";
import { usePublicHubs } from "@/hooks/usePublicHubs";
import AccessibleDialog from "@/components/ui/AccessibleDialog";

const DEFAULT_CATEGORIES = ["كتب", "إلكترونيات", "أثاث", "ملابس", "أخرى"];
const DEFAULT_LOCATIONS = ["عمان", "الزرقاء", "إربد", "العقبة", "السلط", "مادبا"];
const CONDITIONS = ["جديد", "مستعمل ممتاز", "مستعمل جيد"] as const;
const OFFER_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_OFFER_IMAGE_BYTES = 5 * 1024 * 1024;

function RequestStatusBadge({ status }: { status: DonationRequest["status"] }) {
  const styles = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-100",
    fulfilled: "bg-sky-50 text-sky-700 border-sky-100",
    expired: "bg-orange-50 text-orange-700 border-orange-100",
    cancelled: "bg-gray-100 text-gray-600 border-gray-200",
  } as const;

  const labels = {
    active: "نشط",
    fulfilled: "تمت تلبيته",
    expired: "منتهي",
    cancelled: "ملغي",
  } as const;

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function RequestCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-sm">
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="h-4 w-40 animate-pulse rounded-full bg-[#e7e1d9]" />
            <div className="h-3 w-28 animate-pulse rounded-full bg-[#f0ebe3]" />
          </div>
          <div className="h-6 w-16 animate-pulse rounded-full bg-[#f2ede6]" />
        </div>

        <div className="space-y-2">
          <div className="h-3.5 w-full animate-pulse rounded-full bg-[#f0ebe3]" />
          <div className="h-3.5 w-5/6 animate-pulse rounded-full bg-[#f0ebe3]" />
          <div className="h-3.5 w-3/5 animate-pulse rounded-full bg-[#f0ebe3]" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="h-10 animate-pulse rounded-2xl bg-[#f6f2eb]" />
          <div className="h-10 animate-pulse rounded-2xl bg-[#e8f5f3]" />
        </div>
      </div>
    </div>
  );
}

export default function DonationRequestsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const currentUserId = user?._id;
  const { requireHubForBooking } = useSiteConfig();
  const { settings: publicSettings } = useSettings();
  const { hubs } = usePublicHubs();
  const settingsCategories = publicSettings?.categories?.length
    ? publicSettings.categories
    : DEFAULT_CATEGORIES;
  const settingsLocations = publicSettings?.locations?.length
    ? publicSettings.locations
    : DEFAULT_LOCATIONS;

  const [myOnly, setMyOnly] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMyOnly(searchParams.get("mine") === "true");
  }, [searchParams]);

  useEffect(() => {
    if (authLoading || user || !myOnly) return;
    setMyOnly(false);
    router.replace("/donation-requests");
  }, [authLoading, myOnly, router, user]);

  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [respondingTo, setRespondingTo] = useState<DonationRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [respondForm, setRespondForm] = useState<{
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

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const stateRef = useRef({ myOnly, selectedCategory, selectedLocation, page });
  const loadControllerRef = useRef<AbortController | null>(null);
  useEffect(() => {
    stateRef.current = { myOnly, selectedCategory, selectedLocation, page };
  });

  const load = useCallback(
    async (
      targetPage = 1,
      category = stateRef.current.selectedCategory,
      mine = stateRef.current.myOnly,
      location = stateRef.current.selectedLocation
    ) => {
      loadControllerRef.current?.abort();
      const controller = new AbortController();
      loadControllerRef.current = controller;
      setLoading(true);
      try {
        const data = await getDonationRequests(
          {
            page: targetPage,
            limit: 10,
            category: category || undefined,
            location: location || undefined,
            mine: mine === true ? true : undefined,
          },
          controller.signal
        );
        if (controller.signal.aborted) return;
        setRequests(data.requests ?? []);
        setPage(data.page ?? 1);
        setPages(data.pages ?? 1);
      } catch (err) {
        if (!controller.signal.aborted) {
          setToast({ msg: extractErrorMsg(err, "تعذر تحميل طلبات التبرع"), ok: false });
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    []
  );

  const handleRespond = async () => {
    if (!respondingTo || (requireHubForBooking && !respondForm.safeHub)) return;
    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(`/donation-requests/${respondingTo._id}/offer`)}`
      );
      return;
    }

    const requestId = respondingTo._id;
    setSubmitting(true);
    try {
      const res = await respondToDonationRequest(respondingTo._id, {
        condition: respondForm.condition,
        safeHub: respondForm.safeHub || undefined,
        description: respondForm.description || undefined,
        imageFile: respondForm.imageFile || undefined,
      });

      setRespondingTo(null);
      setImagePreview(null);
      setToast({ msg: res.msg ?? "تم إرسال العرض للمراجعة", ok: true });
      await load(stateRef.current.page);
      setTimeout(() => router.push(`/donation-requests/${requestId}`), 700);
    } catch (err) {
      setToast({ msg: extractErrorMsg(err, "تعذر الاستجابة للطلب"), ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async (id: string) => {
    if (cancelingId) return;
    setCancelingId(id);
    try {
      const res = await cancelDonationRequest(id);
      setToast({ msg: res.msg ?? "تم إلغاء الطلب بنجاح", ok: true });
      void load(stateRef.current.page);
    } catch (err) {
      setToast({ msg: extractErrorMsg(err, "تعذر إلغاء الطلب"), ok: false });
    } finally {
      setCancelingId(null);
    }
  };

  useEffect(() => {
    if (!mounted || authLoading || (myOnly && !currentUserId)) return;
    void load(1, selectedCategory, myOnly, selectedLocation);
    return () => loadControllerRef.current?.abort();
  }, [
    authLoading,
    load,
    mounted,
    myOnly,
    selectedCategory,
    selectedLocation,
    currentUserId,
  ]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const activeMineCount = useMemo(
    () => requests.filter((r) => r.status === "active").length,
    [requests]
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (file && !OFFER_IMAGE_TYPES.has(file.type)) {
      e.target.value = "";
      setRespondForm((prev) => ({ ...prev, imageFile: null }));
      setImagePreview(null);
      setToast({ msg: "الصورة يجب أن تكون JPG أو PNG أو WebP", ok: false });
      return;
    }
    if (file && file.size > MAX_OFFER_IMAGE_BYTES) {
      e.target.value = "";
      setRespondForm((prev) => ({ ...prev, imageFile: null }));
      setImagePreview(null);
      setToast({ msg: "حجم الصورة يجب ألا يتجاوز 5MB", ok: false });
      return;
    }
    setRespondForm((prev) => ({ ...prev, imageFile: file }));
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const resetRespondForm = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setRespondForm({
      condition: "مستعمل جيد",
      safeHub: "",
      description: "",
      imageFile: null,
    });
  };

  return (
    <div className="min-h-dvh bg-[#f7f6f2] pb-24 text-[#191c1d]" dir="rtl">
      {toast && (
        <div
          role={toast.ok ? "status" : "alert"}
          aria-live={toast.ok ? "polite" : "assertive"}
          aria-atomic="true"
          className={`fixed left-1/2 top-24 z-[60] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl px-5 py-3 text-center text-sm font-black text-white shadow-[0_14px_35px_rgba(0,0,0,0.16)] transition-all ${
            toast.ok ? "bg-emerald-500" : "bg-red-500"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-6 px-4 pt-20 md:px-8 md:pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[32px] border border-black/[0.06] bg-white p-6 shadow-sm md:p-8">
          <div className="absolute left-0 top-0 h-40 w-40 -translate-x-1/3 -translate-y-1/3 rounded-full bg-[#01696f]/[0.06] blur-3xl" />
          <div className="absolute bottom-0 right-0 h-40 w-40 translate-x-1/3 translate-y-1/3 rounded-full bg-[#005a8c]/[0.05] blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d9ecea] bg-[#ecf8f6] px-3 py-1.5 text-[11px] font-black text-primary">
                <span className="material-symbols-outlined text-[15px]">
                  volunteer_activism
                </span>
                مساحة لطلب المساعدة والتبرع
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-tight text-[#191c1d] md:text-4xl">
                طلبات التبرع
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6e675f] md:text-base">
                استعرض الطلبات الحالية وساهم بما تستطيع، أو أنشئ طلبًا جديدًا بطريقة
                واضحة ومحترمة تحفظ خصوصية وكرامة الجميع.
              </p>

              <p className="mt-3 text-xs font-bold text-[#8e877f]">
                {!mounted
                  ? "تصفح الطلبات وساهم بتبرع"
                  : myOnly
                  ? `لديك ${activeMineCount} طلب نشط`
                  : "تصفح الطلبات وساهم بتبرع"}
              </p>
            </div>

            <Link
              href="/donation-requests/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-black text-white shadow-[0_10px_24px_rgba(1,105,111,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              اطلب تبرعاً
            </Link>
          </div>
        </section>

        {/* Controls */}
        <section className="rounded-3xl border border-black/[0.06] bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setMyOnly(false)}
                className={`rounded-full px-4 py-2 text-xs font-black transition-all ${
                  !myOnly
                    ? "bg-primary text-white shadow-sm"
                    : "bg-[#f3f1ec] text-[#6b655e] hover:bg-[#ece7df]"
                }`}
              >
                كل الطلبات
              </button>

              <button
                onClick={() => {
                  if (!user) {
                    router.push("/login?redirect=/donation-requests?mine=true");
                    return;
                  }
                  setMyOnly(true);
                }}
                className={`rounded-full px-4 py-2 text-xs font-black transition-all ${
                  myOnly
                    ? "bg-primary text-white shadow-sm"
                    : "bg-[#f3f1ec] text-[#6b655e] hover:bg-[#ece7df]"
                }`}
              >
                طلباتي فقط
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-2xl border border-[#e4dfd7] bg-[#fcfbf8] px-4 py-2.5 text-xs font-black text-[#393531] outline-none transition-all focus:border-primary focus:bg-white"
              >
                <option value="">كل التصنيفات</option>
                {settingsCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="rounded-2xl border border-[#e4dfd7] bg-[#fcfbf8] px-4 py-2.5 text-xs font-black text-[#393531] outline-none transition-all focus:border-primary focus:bg-white"
              >
                <option value="">كل المناطق</option>
                {settingsLocations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* List */}
        <section className="mx-auto max-w-5xl space-y-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <RequestCardSkeleton key={i} />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[#ddd7cf] bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f4f1eb]">
                <span className="material-symbols-outlined text-4xl text-[#b9b1a8]">
                  inbox
                </span>
              </div>
              <p className="text-sm font-black text-[#7c746b]">
                {myOnly
                  ? 'لا توجد طلبات بعد — اضغط "اطلب تبرعاً"'
                  : "لا توجد طلبات حالياً"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {requests.map((request) => (
                <article
                  key={request._id}
                  className="group rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-black text-[#1e2526] md:text-base">
                            {request.title}
                          </h3>
                          <RequestStatusBadge status={request.status} />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#8b847c]">
                          <span className="rounded-full bg-[#f3f1ec] px-2.5 py-1 text-[#6b655e]">
                            {request.category}
                          </span>
                          <span>بواسطة: {request.requester?.name ?? "مستخدم"}</span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-4 text-sm leading-7 text-[#635d56]">
                      {request.description}
                    </p>

                    <div className="mt-5 border-t border-[#f1ece5] pt-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          {myOnly &&
                            request.fulfilledByItem &&
                            request.status !== "cancelled" && (
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(`/donation-requests/${request._id}`)
                                }
                                className="inline-flex items-center gap-1 rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 transition-all hover:bg-emerald-100"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  notifications_active
                                </span>
                                شخص استجاب! اضغط هنا 🎁
                              </button>
                            )}

                          {myOnly && !request.fulfilledByItem && (
                            <button
                              type="button"
                              onClick={() =>
                                router.push(`/donation-requests/${request._id}`)
                              }
                              className="inline-flex items-center gap-1 rounded-2xl bg-[#f3f1ec] px-4 py-2 text-xs font-black text-[#625c55] transition-all hover:bg-[#ebe6df]"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                open_in_new
                              </span>
                              عرض التفاصيل
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {!myOnly &&
                            request.status === "active" &&
                            request.requester?._id !== user?._id && (
                            <button
                              type="button"
                              onClick={() => {
                                if (!user) {
                                  router.push(
                                    `/login?redirect=${encodeURIComponent(`/donation-requests/${request._id}/offer`)}`
                                  );
                                  return;
                                }
                                resetRespondForm();
                                setRespondingTo(request);
                              }}
                              className="inline-flex items-center gap-1 rounded-2xl bg-primary/10 px-4 py-2 text-xs font-black text-primary transition-all hover:bg-primary/15"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                volunteer_activism
                              </span>
                              سأتبرع بهذا 🎁
                            </button>
                          )}

                          {myOnly && request.status === "active" && (
                            <button
                              type="button"
                              onClick={() => cancel(request._id)}
                              disabled={cancelingId === request._id}
                              className="rounded-2xl bg-red-50 px-4 py-2 text-xs font-black text-red-600 transition-all hover:bg-red-100 disabled:opacity-50"
                            >
                              {cancelingId === request._id
                                ? "جاري الإلغاء..."
                                : "إلغاء الطلب"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => load(page - 1)}
                disabled={page <= 1 || loading}
                className="rounded-2xl bg-[#f0ece5] px-4 py-2 text-xs font-black text-[#6b655e] transition-all hover:bg-[#e8e2d9] disabled:opacity-40"
              >
                السابق
              </button>

              <span className="rounded-2xl bg-white px-4 py-2 text-xs font-black text-[#746d66] shadow-sm border border-black/[0.05]">
                {page} / {pages}
              </span>

              <button
                onClick={() => load(page + 1)}
                disabled={page >= pages || loading}
                className="rounded-2xl bg-[#f0ece5] px-4 py-2 text-xs font-black text-[#6b655e] transition-all hover:bg-[#e8e2d9] disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          )}
        </section>
      </div>

      {respondingTo && (
        <AccessibleDialog
          ariaLabel={`الاستجابة لطلب ${respondingTo.title}`}
          onClose={() => {
            resetRespondForm();
            setRespondingTo(null);
          }}
          closeDisabled={submitting}
          ariaBusy={submitting}
          overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-[2px]"
          panelClassName="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-[30px] border border-black/5 bg-white p-5 shadow-[0_30px_80px_rgba(0,0,0,0.22)] sm:p-6 md:p-7"
        >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#ecf8f6] px-3 py-1 text-[10px] font-black text-primary">
                  <span className="material-symbols-outlined text-[13px]">
                    volunteer_activism
                  </span>
                  إنشاء عرض مرتبط بالطلب
                </div>

                <h2 className="mt-3 text-base font-black text-[#1d2324] md:text-lg">
                  الاستجابة لطلب: {respondingTo.title}
                </h2>

                <p className="mt-1 text-xs leading-6 text-[#7a736b]">
                  سيصل عرضك لصاحب الطلب أولاً. إذا اختارك، سيُنشأ الغرض ويُحجز له
                  تلقائياً عند نقطة التسليم الآمنة.
                </p>
              </div>

              <button
                type="button"
                aria-label="إغلاق نافذة الاستجابة"
                onClick={() => {
                  resetRespondForm();
                  setRespondingTo(null);
                }}
                disabled={submitting}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-black text-[#4b4640]">
                  حالة الغرض
                </label>
                <select
                  value={respondForm.condition}
                  onChange={(e) =>
                    setRespondForm({
                      ...respondForm,
                      condition: e.target.value as (typeof CONDITIONS)[number],
                    })
                  }
                  className="w-full rounded-2xl border border-[#e4dfd7] bg-[#fcfbf8] px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                >
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-black text-[#4b4640]">
                  وصف الغرض
                  <span className="mr-1 font-normal text-gray-400">(اختياري)</span>
                </label>
                <textarea
                  value={respondForm.description}
                  onChange={(e) =>
                    setRespondForm({ ...respondForm, description: e.target.value })
                  }
                  placeholder="مثلاً: كتاب رياضيات صف عاشر، حالة ممتازة، لم يُستخدم كثيراً..."
                  rows={4}
                  maxLength={500}
                  className="w-full resize-none rounded-2xl border border-[#e4dfd7] bg-[#fcfbf8] px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                />
                <p className="mt-1 text-left text-[10px] text-gray-400">
                  {respondForm.description.length}/500
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-black text-[#4b4640]">
                  صورة الغرض
                  <span className="mr-1 font-normal text-gray-400">(اختيارية)</span>
                </label>

                <label className="relative flex h-32 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#ddd7cf] bg-[#fcfbf8] transition-all hover:border-primary/40 hover:bg-primary/[0.03]">
                  {imagePreview ? (
                    <>
                      <Image
                        src={imagePreview}
                        alt="معاينة الصورة"
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, 512px"
                        className="rounded-2xl object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                        <span className="text-xs font-black text-white">
                          تغيير الصورة
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <span className="material-symbols-outlined text-3xl">
                        add_photo_alternate
                      </span>
                      <span className="text-xs font-bold">اضغط لإضافة صورة</span>
                      <span className="text-[10px]">
                        JPG, PNG, WebP — بحد أقصى 5MB
                      </span>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>

                {respondForm.imageFile && (
                  <button
                    type="button"
                    onClick={() => {
                      if (imagePreview) URL.revokeObjectURL(imagePreview);
                      setImagePreview(null);
                      setRespondForm((prev) => ({ ...prev, imageFile: null }));
                    }}
                    className="mt-1 text-[10px] font-bold text-red-500 transition-colors hover:text-red-700"
                  >
                    ✕ إزالة الصورة
                  </button>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-black text-[#4b4640]">
                  نقطة التسليم الآمنة {requireHubForBooking ? "*" : "(اختيارية)"}
                </label>

                {hubs.length === 0 ? (
                  <div className="w-full rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs font-bold text-orange-600">
                    {requireHubForBooking
                      ? "⚠️ لا توجد نقاط تسليم متاحة — تواصل مع الإدارة"
                      : "لا توجد نقاط تسليم متاحة حالياً؛ يمكنك متابعة العرض والاتفاق مباشرةً."}
                  </div>
                ) : (
                  <select
                    value={respondForm.safeHub}
                    onChange={(e) =>
                      setRespondForm({ ...respondForm, safeHub: e.target.value })
                    }
                    className="w-full rounded-2xl border border-[#e4dfd7] bg-[#fcfbf8] px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                  >
                    <option value="">اختر نقطة...</option>
                    {hubs.map((h) => (
                      <option key={h._id} value={h._id}>
                        {h.name} — {h.city}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {respondForm.safeHub && (
                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-3 text-xs font-bold text-primary">
                  ✅ سيبقى العرض معلّقاً حتى يراجعه صاحب الطلب ويختار المتبرع
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRespond}
                  disabled={submitting || (requireHubForBooking && !respondForm.safeHub)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-black text-white transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      جاري الإرسال...
                    </>
                  ) : (
                    "تأكيد التبرع 🎁"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetRespondForm();
                    setRespondingTo(null);
                  }}
                  disabled={submitting}
                  className="rounded-2xl bg-[#f0ece5] px-5 py-3 text-sm font-black text-[#6b655e] transition-all hover:bg-[#e5dfd6] disabled:opacity-50"
                >
                  إلغاء
                </button>
              </div>
            </div>
        </AccessibleDialog>
      )}
    </div>
  );
}
