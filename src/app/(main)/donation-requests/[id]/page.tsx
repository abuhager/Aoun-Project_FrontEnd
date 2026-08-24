"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import { useAuth } from "@/context/AuthContext";
import {
  acceptOffer,
  cancelDonationRequest,
  getDonationRequestById,
  getOffersByRequest,
  rejectOffer,
  withdrawOffer,
} from "@/lib/api/donationRequestApi";
import type {
  DonationRequest,
  DonationOffer,
} from "@/types/donationRequest.types";

export default function DonationRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [request, setRequest] = useState<DonationRequest | null>(null);
  const [offers, setOffers] = useState<DonationOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const currentUserId = user?._id ?? null;

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const offersControllerRef = useRef<AbortController | null>(null);
  const showToast = useCallback((msg: string, ok: boolean) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, ok });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  const fetchRequest = useCallback(async () => {
    if (!id) return;
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    setLoading(true);
    try {
      const response = await getDonationRequestById(id, controller.signal);
      if (!controller.signal.aborted) setRequest(response.request);
    } catch (error) {
      if (!controller.signal.aborted) {
        setRequest(null);
        showToast(extractErrorMsg(error, "تعذر تحميل الطلب"), false);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [id, showToast]);

  const fetchOffers = useCallback(async () => {
    if (!id) return;
    offersControllerRef.current?.abort();
    const controller = new AbortController();
    offersControllerRef.current = controller;
    try {
      const response = await getOffersByRequest(id, controller.signal);
      if (!controller.signal.aborted) setOffers(response.offers ?? []);
    } catch (error) {
      if (!controller.signal.aborted) {
        showToast(extractErrorMsg(error, "تعذر تحميل العروض"), false);
      }
    }
  }, [id, showToast]);

  useEffect(() => {
    if (authLoading) return;
    void fetchRequest();
    return () => requestControllerRef.current?.abort();
  }, [authLoading, fetchRequest]);

  useEffect(() => {
    if (!request || request.requester?._id !== currentUserId) {
      setOffers([]);
      return;
    }
    void fetchOffers();
    return () => offersControllerRef.current?.abort();
  }, [currentUserId, fetchOffers, request]);

  const handleAcceptOffer = async (offerId: string) => {
    setAccepting(offerId);
    try {
      if (!window.confirm("هل تريد اعتماد هذا العرض ورفض بقية العروض؟")) return;
      await acceptOffer(id, offerId);

      showToast("🎉 تم اختيار المتبرع وحجز الغرض بنجاح!", true);
      setOffers([]);
      await fetchRequest();
    } catch (err) {
      await fetchRequest();
      showToast(extractErrorMsg(err, "تعذر قبول العرض"), false);
    } finally {
      setAccepting(null);
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    if (!window.confirm("هل تريد رفض هذا العرض؟ لا يمكن التراجع عن ذلك.")) return;
    setRejecting(offerId);
    try {
      const result = await rejectOffer(id, offerId);
      showToast(result.msg, true);
      await fetchOffers();
    } catch (error) {
      showToast(extractErrorMsg(error, "تعذر رفض العرض"), false);
    } finally {
      setRejecting(null);
    }
  };

  const handleWithdrawOffer = async () => {
    const offerId = request?.viewerOffer?._id;
    if (!offerId || !window.confirm("هل تريد سحب عرضك؟ لا يمكنك تقديم عرض جديد لنفس الطلب.")) return;
    setWithdrawing(true);
    try {
      const result = await withdrawOffer(id, offerId);
      showToast(result.msg, true);
      await fetchRequest();
    } catch (error) {
      showToast(extractErrorMsg(error, "تعذر سحب العرض"), false);
    } finally {
      setWithdrawing(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!window.confirm("هل تريد إلغاء الطلب وكل العروض المعلقة عليه؟")) return;
    setCanceling(true);
    try {
      const result = await cancelDonationRequest(id);
      showToast(result.msg, true);
      await fetchRequest();
      await fetchOffers();
    } catch (error) {
      showToast(extractErrorMsg(error, "تعذر إلغاء الطلب"), false);
    } finally {
      setCanceling(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-dvh bg-[#f7f6f2]">
        <div className="mx-auto max-w-5xl px-4 pt-20 md:px-6 md:pt-24">
          <div className="space-y-4">
            <div className="h-5 w-20 animate-pulse rounded-full bg-[#e9e4dc]" />
            <div className="rounded-[30px] border border-black/[0.06] bg-white p-6 shadow-sm">
              <div className="space-y-4">
                <div className="h-6 w-44 animate-pulse rounded-full bg-[#e7e1d9]" />
                <div className="h-4 w-32 animate-pulse rounded-full bg-[#f0ebe3]" />
                <div className="flex gap-2">
                  <div className="h-7 w-20 animate-pulse rounded-full bg-[#f2ede6]" />
                  <div className="h-7 w-20 animate-pulse rounded-full bg-[#f2ede6]" />
                  <div className="h-7 w-20 animate-pulse rounded-full bg-[#f2ede6]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f7f6f2]">
        <div className="rounded-3xl border border-dashed border-[#ddd7cf] bg-white px-10 py-12 text-center shadow-sm">
          <span className="material-symbols-outlined mb-2 block text-4xl text-gray-300">
            error
          </span>
          <p className="text-sm font-bold text-gray-400">الطلب غير موجود</p>
        </div>
      </div>
    );
  }

  const isOwner = currentUserId === request.requester?._id;
  const viewerOffer = request.viewerOffer ?? null;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const canViewFulfilledItem = Boolean(
    isOwner || isAdmin || viewerOffer?.status === "accepted"
  );
  const respondedItem = canViewFulfilledItem
    ? request.fulfilledByItem ?? null
    : null;
  const isAccepted = request.status === "fulfilled" || !!respondedItem;
  const showCaseB = request.status === "active" && !isOwner && !isAccepted && !viewerOffer;

  return (
    <div className="min-h-dvh bg-[#f7f6f2] pb-24 text-[#191c1d]" dir="rtl">
      {toast && (
        <div
          role={toast.ok ? "status" : "alert"}
          aria-live={toast.ok ? "polite" : "assertive"}
          aria-atomic="true"
          className={`fixed left-1/2 top-20 z-50 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl px-6 py-3 text-center text-sm font-bold text-white shadow-[0_14px_35px_rgba(0,0,0,0.16)] transition-all ${
            toast.ok ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="mx-auto max-w-5xl space-y-5 px-4 pt-20 md:px-6 md:pt-24">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-xs font-black text-gray-500 transition-colors hover:text-primary"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          رجوع
        </button>

        {/* Hero summary */}
        <section className="relative overflow-hidden rounded-[32px] border border-black/[0.06] bg-white p-6 shadow-sm md:p-7">
          <div className="absolute left-0 top-0 h-40 w-40 -translate-x-1/3 -translate-y-1/3 rounded-full bg-[#01696f]/[0.06] blur-3xl" />
          <div className="absolute bottom-0 right-0 h-40 w-40 translate-x-1/3 translate-y-1/3 rounded-full bg-[#005a8c]/[0.05] blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={request.status} />
                <span className="rounded-full bg-[#f3f1ec] px-3 py-1 text-[11px] font-black text-[#6b655e]">
                  {request.category}
                </span>
                <span className="rounded-full bg-[#f3f1ec] px-3 py-1 text-[11px] font-black text-[#6b655e]">
                  📍 {request.location}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-black ${
                    request.urgency === "high"
                      ? "bg-red-50 text-red-600"
                      : request.urgency === "medium"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {request.urgency === "high"
                    ? "🔴 عاجل"
                    : request.urgency === "medium"
                    ? "🟡 متوسط"
                    : "🟢 عادي"}
                </span>
              </div>

              <h1 className="mt-4 text-xl font-black tracking-tight text-[#1d2324] md:text-3xl">
                {request.title}
              </h1>

              {request.description && (
                <p className="mt-3 max-w-2xl text-sm leading-8 text-[#655f58] md:text-base">
                  {request.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-[#8c857d]">
                <span>بواسطة: {request.requester?.name}</span>
                <span className="text-[#d2ccc4]">•</span>
                <span>
                  {new Date(request.createdAt).toLocaleDateString("ar-EG")}
                </span>
              </div>
            </div>

            <div className="grid min-w-[220px] grid-cols-2 gap-3">
              <MiniStat
                label="عدد العروض"
                value={isOwner ? offers.length : viewerOffer ? 1 : isAccepted ? 1 : 0}
                tone="text-primary"
              />
              <MiniStat
                label="الحالة الحالية"
                value={isAccepted ? "تمت تلبيته" : "مفتوح"}
                tone="text-[#1f2526]"
              />
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left Column */}
          <div className="space-y-5">
            {/* CASE A: طلب نشط وصاحب الطلب يتصفح العروض */}
            {request.status === "active" && isOwner && !isAccepted && (
              <section className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-black text-[#1d2324]">
                      العروض المقدمة
                    </h2>
                    <p className="mt-1 text-xs font-bold text-[#8a837b]">
                      اختر العرض الأنسب لك بناءً على الحالة ونقطة التسليم.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#f3f1ec] px-3 py-1 text-[11px] font-black text-[#6b655e]">
                    {offers.length} عرض
                  </span>
                </div>

                {offers.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#ddd7cf] bg-[#fcfbf8] p-10 text-center">
                    <span className="material-symbols-outlined mb-2 block text-4xl text-gray-300">
                      hourglass_empty
                    </span>
                    <p className="text-sm font-bold text-gray-400">
                      لا أحد عرض التبرع بعد
                    </p>
                    <p className="mt-1 text-xs text-gray-300">
                      ستصلك إشعارات فور تقديم أي شخص عرضاً 🔔
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {offers.map((offer) => (
                      <OfferCard
                        key={offer._id}
                        offer={offer}
                        onAccept={() => handleAcceptOffer(offer._id)}
                        onReject={() => handleRejectOffer(offer._id)}
                        isAccepting={accepting === offer._id}
                        isRejecting={rejecting === offer._id}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {!isOwner && viewerOffer && (
              <section className="rounded-[28px] border border-primary/20 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-3xl">inventory</span>
                </div>
                <h2 className="mt-4 text-base font-black text-[#1d2324]">
                  {offerStatusLabel(viewerOffer.status)}
                </h2>
                <p className="mt-2 text-sm leading-7 text-[#6d665f]">
                  {offerStatusDescription(viewerOffer.status)}
                </p>
                {viewerOffer.status === "pending" && request.status === "active" && (
                  <button
                    type="button"
                    onClick={handleWithdrawOffer}
                    disabled={withdrawing}
                    className="mt-5 w-full rounded-2xl bg-red-50 py-3 text-sm font-black text-red-600 transition-all hover:bg-red-100 disabled:opacity-50"
                  >
                    {withdrawing ? "جارٍ سحب العرض..." : "سحب العرض"}
                  </button>
                )}
              </section>
            )}

            {/* CASE C: تم قبول عرض */}
            {isAccepted && respondedItem && (
              <section className="rounded-[28px] border border-primary/20 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px] text-primary">
                    handshake
                  </span>
                  <h2 className="text-base font-black text-[#1d2324]">
                    تفاصيل التبرع المقبول 🎉
                  </h2>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <InfoRow label="المتبرع" value={respondedItem.donor?.name ?? "—"} />
                  <InfoRow label="حالة الغرض" value={respondedItem.condition ?? "—"} />
                </div>

                {respondedItem.safeHub && (
                  <div className="mt-4 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <p className="text-xs font-black text-primary">
                      📍 نقطة التسليم الآمنة
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-800">
                      {respondedItem.safeHub.name} — {respondedItem.safeHub.city}
                    </p>
                    {respondedItem.safeHub.address && (
                      <p className="mt-1 text-xs text-gray-500">
                        {respondedItem.safeHub.address}
                      </p>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* CASE B: طلب نشط ومستخدم آخر يريد التبرع */}
            {showCaseB && (
              <section className="rounded-[28px] border border-primary/20 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-3xl">
                    volunteer_activism
                  </span>
                </div>
                <h2 className="mt-4 text-base font-black text-[#1d2324]">
                  هل تريد التبرع بهذا الغرض؟
                </h2>
                <p className="mt-2 text-sm leading-7 text-[#6d665f]">
                  يمكنك تقديم عرض تبرع مرتبط بهذا الطلب، ثم سيتمكن صاحب الطلب من
                  مراجعته واختياره.
                </p>
                <button
                  onClick={() => router.push(`/donation-requests/${id}/offer`)}
                  className="mt-5 w-full rounded-2xl bg-primary py-3 text-sm font-black text-white transition-all hover:bg-primary/90"
                >
                  {user ? "🎁 أريد التبرع" : "سجّل دخولك لتقديم عرض"}
                </button>
              </section>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {isOwner && request.status === "active" && (
              <section className="rounded-[28px] border border-red-100 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-black text-[#1f2526]">إدارة الطلب</h2>
                <p className="mt-2 text-xs leading-6 text-gray-500">
                  إلغاء الطلب يوقف كل العروض المعلقة ويبلغ أصحابها.
                </p>
                <button
                  type="button"
                  onClick={handleCancelRequest}
                  disabled={canceling || accepting !== null}
                  className="mt-4 w-full rounded-2xl bg-red-50 py-3 text-xs font-black text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  {canceling ? "جارٍ إلغاء الطلب..." : "إلغاء الطلب"}
                </button>
              </section>
            )}

            {/* عرض صفحة الغرض */}
            {isAccepted && respondedItem && (
              <section className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-sm">
                <h2 className="text-sm font-black text-[#1f2526]">متابعة الغرض</h2>
                <p className="mt-2 text-sm leading-7 text-[#716a62]">
                  يمكنك استعراض الصفحة الكاملة للغرض المرتبط بهذا الطلب لمشاهدة التفاصيل والصور.
                </p>

                <div className="mt-4">
                  <button
                    onClick={() => {
                      const itemObj = respondedItem as { _id?: string };
                      router.push(`/items/${itemObj?._id || ""}?ref=donation-request`);
                    }}
                    className="w-full rounded-2xl bg-primary py-3 text-xs font-black text-white transition-all hover:bg-primary/90"
                  >
                    عرض صفحة الغرض كاملة ←
                  </button>
                </div>
              </section>
            )}

            {/* بطاقة صاحب الطلب */}
            <section className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-black text-[#1f2526]">صاحب الطلب</h2>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-base font-black text-primary">
                  {request.requester?.name?.charAt(0) ?? "U"}
                </div>
                <div>
                  <p className="text-sm font-black text-[#1d2324]">
                    {request.requester?.name}
                  </p>
                  <p className="text-xs font-bold text-[#8b847c]">
                    تاريخ الإنشاء:{" "}
                    {new Date(request.createdAt).toLocaleDateString("ar-EG")}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Internal components ──────────────────────────────────────

function MiniStat({
  label,
  value,
  tone = "text-[#1f2526]",
}: {
  label: string;
  value: string | number;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.05] bg-[#fcfbf8] p-3 text-center">
      <p className={`text-base font-black ${tone}`}>{value}</p>
      <p className="mt-1 text-[10px] font-bold text-gray-400">{label}</p>
    </div>
  );
}

function OfferCard({
  offer,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
}: {
  offer: DonationOffer;
  onAccept: () => void;
  onReject: () => void;
  isAccepting: boolean;
  isRejecting: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-[#fcfbf8] p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-base font-black text-primary">
          {offer.donor?.name?.charAt(0) ?? "D"}
        </div>

        <div>
          <p className="text-sm font-black text-[#1d2324]">{offer.donor?.name}</p>
          <p className="text-xs text-gray-400">
            Level {offer.donor?.trustLevel ?? 1} · {offer.donor?.trustScore ?? 0} نقطة
          </p>
        </div>

        <div className="mr-auto flex flex-col items-end gap-1">
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#6b655e]">
            {offer.condition}
          </span>
          <span className="text-[10px] font-black text-primary">
            {offerStatusLabel(offer.status)}
          </span>
        </div>
      </div>

      {offer.imageUrl && (
        <div className="relative mt-4 h-44 w-full overflow-hidden rounded-2xl">
          <Image
            src={offer.imageUrl}
            alt="صورة الغرض"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 640px"
          />
        </div>
      )}

      {offer.description && (
        <p className="mt-4 text-sm leading-7 text-[#625c55]">{offer.description}</p>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-500">
        <span className="material-symbols-outlined text-[14px] text-primary">
          location_on
        </span>
        {offer.safeHub?.name} — {offer.safeHub?.city}
      </div>

      {offer.status === "pending" ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onAccept}
            disabled={isAccepting || isRejecting}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-black text-white transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {isAccepting ? "جاري الاختيار..." : "✅ قبول"}
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={isAccepting || isRejecting}
            className="rounded-2xl bg-red-50 py-3 text-sm font-black text-red-600 transition-all hover:bg-red-100 disabled:opacity-50"
          >
            {isRejecting ? "جاري الرفض..." : "رفض"}
          </button>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-gray-100 py-3 text-center text-xs font-black text-gray-500">
          {offerStatusLabel(offer.status)}
        </div>
      )}
    </div>
  );
}

function offerStatusLabel(status: DonationOffer["status"]) {
  const labels: Record<DonationOffer["status"], string> = {
    pending: "قيد المراجعة",
    accepted: "تم القبول",
    rejected: "مرفوض",
    withdrawn: "تم سحبه",
    cancelled_by_requester: "الطلب ملغي",
    request_expired: "انتهت مدة الطلب",
  };
  return labels[status];
}

function offerStatusDescription(status: DonationOffer["status"]) {
  const descriptions: Record<DonationOffer["status"], string> = {
    pending: "عرضك وصل إلى صاحب الطلب وما زال بانتظار قراره.",
    accepted: "تم اختيار عرضك. يمكنك متابعة الغرض وإجراءات التسليم من هذه الصفحة.",
    rejected: "تم اختيار عرض آخر. حفاظاً على الخصوصية لن تظهر لك بيانات الغرض أو المتبرع الذي تم اختياره.",
    withdrawn: "سحبت عرضك لهذا الطلب، ولن تظهر لك بيانات أي عرض يتم اختياره.",
    cancelled_by_requester: "ألغى صاحب الطلب طلبه، لذلك أُغلق عرضك تلقائياً.",
    request_expired: "انتهت مدة الطلب قبل اختيار عرضك.",
  };
  return descriptions[status];
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-50 text-green-700 border-green-100",
    fulfilled: "bg-blue-50 text-blue-700 border-blue-100",
    expired: "bg-orange-50 text-orange-700 border-orange-100",
    cancelled: "bg-gray-100 text-gray-600 border-gray-200",
  };
  const labels: Record<string, string> = {
    active: "نشط",
    fulfilled: "تمت تلبيته",
    expired: "منتهي",
    cancelled: "ملغي",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${
        styles[status] ?? ""
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f8f6f2] p-4">
      <p className="mb-1 text-[10px] font-black text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  );
}
