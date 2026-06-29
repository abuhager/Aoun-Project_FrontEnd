"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import axiosInstance from "@/lib/api/axiosInstance";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import { useSocket } from "@/hooks/useSocket";
import ChatDrawer from "@/components/ChatDrawer";
import type {
  DonationRequest,
  DonationOffer,
} from "@/types/donationRequest.types";

// ─────────────────────────────────────────────────────────────
export default function DonationRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const socketRef = useSocket();

  const [request, setRequest] = useState<DonationRequest | null>(null);
  const [offers, setOffers] = useState<DonationOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [chatTarget, setChatTarget] = useState<{
    itemId: string;
    itemTitle: string;
  } | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);

  const requestRef = useRef<DonationRequest | null>(null);
  useEffect(() => {
    requestRef.current = request;
  }, [request]);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  useEffect(() => {
    axiosInstance
      .get("/api/auth/me")
      .then((r) => setCurrentUserId(r.data?.user?._id ?? r.data?._id ?? null))
      .catch(() => setCurrentUserId(null))
      .finally(() => setAuthLoading(false));
  }, []);

  const fetchRequest = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const r = await axiosInstance.get(`/api/donation-requests/${id}`);
      setRequest(r.data?.request ?? r.data);
    } catch {
      showToast("تعذر تحميل الطلب", false);
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  const fetchOffers = useCallback(async () => {
    if (!id) return;
    try {
      const r = await axiosInstance.get(`/api/donation-requests/${id}/offers`);
      setOffers(r.data?.offers ?? []);
    } catch {}
  }, [id]);

  useEffect(() => {
    fetchRequest();
    fetchOffers();
  }, [fetchRequest, fetchOffers]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !id) return;

    const handleRecipientConfirmed = (data: { itemId: string }) => {
      if (requestRef.current?.fulfilledByItem?._id !== data.itemId) return;
      setRequest((prev) => {
        if (!prev?.fulfilledByItem) return prev;
        return {
          ...prev,
          fulfilledByItem: {
            ...prev.fulfilledByItem,
            recipientConfirmed: true,
          },
        };
      });
    };

    const handleDeliveryCompleted = (data: { itemId: string }) => {
      if (requestRef.current?.fulfilledByItem?._id !== data.itemId) return;
      setRequest((prev) => {
        if (!prev?.fulfilledByItem) return prev;
        return {
          ...prev,
          status: "fulfilled",
          fulfilledByItem: {
            ...prev.fulfilledByItem,
            donorConfirmed: true,
            recipientConfirmed: true,
            status: "تم التسليم",
          },
        };
      });
      showToast("🎉 تم التسليم بنجاح!", true);
    };

    socket.on("recipient:confirmed", handleRecipientConfirmed);
    socket.on("delivery:completed", handleDeliveryCompleted);
    return () => {
      socket.off("recipient:confirmed", handleRecipientConfirmed);
      socket.off("delivery:completed", handleDeliveryCompleted);
    };
  }, [id, socketRef, showToast]);

  const handleAcceptOffer = async (offerId: string) => {
    setAccepting(offerId);
    try {
      const res = await axiosInstance.post(
        `/api/donation-requests/${id}/offers/${offerId}/accept`
      );

      const itemId = res.data?.itemId as string | undefined;
      showToast("🎉 تم اختيار المتبرع وحجز الغرض بنجاح!", true);

      setOffers([]);
      await fetchRequest();

      if (itemId) {
        router.push(`/items/${itemId}?ref=donation-request`);
      }
    } catch (err) {
      setIsChatOpen(false);
      setChatTarget(null);
      await fetchRequest();
      showToast(extractErrorMsg(err, "تعذر قبول العرض"), false);
    } finally {
      setAccepting(null);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!request?.fulfilledByItem?._id) return;
    setConfirming(true);

    setRequest((prev) => {
      if (!prev?.fulfilledByItem) return prev;
      return {
        ...prev,
        fulfilledByItem: { ...prev.fulfilledByItem, recipientConfirmed: true },
      };
    });

    try {
      await axiosInstance.put(`/api/items/complete/${request.fulfilledByItem._id}`, {
        confirmationType: "recipient_confirm",
      });
      showToast("✅ تم تأكيدك — في انتظار تأكيد المتبرع", true);
      setTimeout(() => fetchRequest(), 800);
    } catch (err) {
      setRequest((prev) => {
        if (!prev?.fulfilledByItem) return prev;
        return {
          ...prev,
          fulfilledByItem: { ...prev.fulfilledByItem, recipientConfirmed: false },
        };
      });
      showToast(extractErrorMsg(err, "تعذر تأكيد الاستلام"), false);
    } finally {
      setConfirming(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#f7f6f2]">
        <main className="mx-auto max-w-5xl px-4 pt-20 md:px-6 md:pt-24">
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
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded-full bg-[#f1ece5]" />
                  <div className="h-4 w-5/6 animate-pulse rounded-full bg-[#f1ece5]" />
                  <div className="h-4 w-2/3 animate-pulse rounded-full bg-[#f1ece5]" />
                </div>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-sm">
                <div className="space-y-3">
                  <div className="h-5 w-36 animate-pulse rounded-full bg-[#ece7df]" />
                  <div className="h-24 animate-pulse rounded-3xl bg-[#f6f2eb]" />
                </div>
              </div>
              <div className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-sm">
                <div className="space-y-3">
                  <div className="h-5 w-28 animate-pulse rounded-full bg-[#ece7df]" />
                  <div className="h-10 animate-pulse rounded-2xl bg-[#f6f2eb]" />
                  <div className="h-10 animate-pulse rounded-2xl bg-[#e8f5f3]" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f6f2]">
        <div className="rounded-3xl border border-dashed border-[#ddd7cf] bg-white px-10 py-12 text-center shadow-sm">
          <span className="material-symbols-outlined mb-2 block text-4xl text-gray-300">
            error
          </span>
          <p className="text-sm font-bold text-gray-400">الطلب غير موجود</p>
        </div>
      </div>
    );
  }

  const isOwner = currentUserId === request.requester._id;

  const fulfilledItem = request.fulfilledByItem as
    | Record<string, unknown>
    | null
    | undefined;

  const itemBookedById =
    fulfilledItem && "bookedBy" in fulfilledItem && fulfilledItem.bookedBy
      ? typeof fulfilledItem.bookedBy === "object" &&
        fulfilledItem.bookedBy !== null &&
        "_id" in fulfilledItem.bookedBy
        ? (fulfilledItem.bookedBy as { _id: string })._id
        : (fulfilledItem.bookedBy as string)
      : undefined;

  const isComponentBooked = !!itemBookedById;
  const respondedItem = isComponentBooked ? request.fulfilledByItem ?? null : null;

  const recipientDone = respondedItem?.recipientConfirmed ?? false;
  const donorDone = respondedItem?.donorConfirmed ?? false;
  const fullyDone = recipientDone && donorDone;

  const showCaseB =
    (request.status === "active" || !isComponentBooked) && !isOwner && !respondedItem;

  const donorId =
    request.fulfilledByItem?.donor &&
    typeof request.fulfilledByItem.donor === "object" &&
    "_id" in request.fulfilledByItem.donor
      ? (request.fulfilledByItem.donor as { _id: string })._id
      : (request.fulfilledByItem?.donor as unknown as string);

  const isAuthorizedForChat =
    !!currentUserId &&
    (currentUserId === request.requester._id || currentUserId === donorId);

  const showChat = !!respondedItem && !fullyDone && isAuthorizedForChat;

  return (
    <div className="min-h-screen bg-[#f7f6f2] pb-24 text-[#191c1d]" dir="rtl">
      {showChat && chatTarget && isChatOpen && (
        <ChatDrawer
          itemId={chatTarget.itemId}
          itemTitle={chatTarget.itemTitle}
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setChatTarget(null);
          }}
        />
      )}

      {toast && (
        <div
          className={`fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-[0_14px_35px_rgba(0,0,0,0.16)] transition-all ${
            toast.ok ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <main className="mx-auto max-w-5xl space-y-5 px-4 pt-20 md:px-6 md:pt-24">
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
                <span>بواسطة: {request.requester.name}</span>
                <span className="text-[#d2ccc4]">•</span>
                <span>
                  {new Date(request.createdAt).toLocaleDateString("ar-EG")}
                </span>
              </div>
            </div>

            <div className="grid min-w-[220px] grid-cols-2 gap-3">
              <MiniStat
                label="عدد العروض"
                value={respondedItem ? 1 : offers.length}
                tone="text-primary"
              />
              <MiniStat
                label="الحالة الحالية"
                value={fullyDone ? "مكتمل" : respondedItem ? "قيد التسليم" : "مفتوح"}
                tone="text-[#1f2526]"
              />
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left */}
          <div className="space-y-5">
            {/* CASE A */}
            {request.status === "active" && isOwner && !respondedItem && (
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
                        isAccepting={accepting === offer._id}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* CASE C */}
            {respondedItem && (
              <section className="rounded-[28px] border border-primary/20 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px] text-primary">
                    handshake
                  </span>
                  <h2 className="text-base font-black text-[#1d2324]">
                    {fullyDone ? "تم استلام الغرض 🎉" : "مرحلة التسليم والمتابعة"}
                  </h2>
                </div>

                <p className="mt-2 text-sm leading-7 text-[#6d665f]">
                  {fullyDone
                    ? "أكمل الطرفان عملية التسليم بنجاح، ويمكنك الآن الرجوع لسجل الطلبات أو متابعة صفحة الغرض."
                    : "تم اختيار متبرع لهذا الطلب، والخطوة التالية هي التنسيق وإتمام التسليم عبر النقطة الآمنة المحددة."}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <InfoRow label="المتبرع" value={respondedItem.donor?.name ?? "—"} />
                  <InfoRow label="حالة الغرض" value={respondedItem.condition ?? "—"} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <ConfirmIndicator label="تأكيد المستلم" done={recipientDone} />
                  <ConfirmIndicator label="تأكيد المتبرع" done={donorDone} />
                </div>

                {!fullyDone && respondedItem.safeHub && (
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

            {/* CASE B */}
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
                  مراجعته واختياره إذا كان مناسبًا.
                </p>
                <button
                  onClick={() => router.push(`/donation-requests/${id}/offer`)}
                  className="mt-5 w-full rounded-2xl bg-primary py-3 text-sm font-black text-white transition-all hover:bg-primary/90"
                >
                  🎁 أريد التبرع
                </button>
              </section>
            )}
          </div>

          {/* Right rail */}
          <div className="space-y-5">
            {/* Progress / actions */}
            <section className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-black text-[#1f2526]">حالة الطلب</h2>
              <p className="mt-2 text-sm leading-7 text-[#716a62]">
                {respondedItem
                  ? fullyDone
                    ? "اكتملت العملية وتم التسليم بنجاح."
                    : "هناك غرض مرتبط بهذا الطلب، والعملية الآن في مرحلة التنسيق أو التأكيد."
                  : request.status === "active"
                  ? "الطلب مفتوح حاليًا ويستقبل عروض التبرع."
                  : "هذا الطلب لم يعد مفتوحًا لاستقبال عروض جديدة."}
              </p>

              <div className="mt-4 space-y-3">
                <TimelineStep
                  done={true}
                  label="تم إنشاء الطلب"
                  muted={false}
                />
                <TimelineStep
                  done={!!respondedItem}
                  label="تم اختيار متبرع"
                  muted={!respondedItem}
                />
                <TimelineStep
                  done={recipientDone}
                  label="أكد المستلم الاستلام"
                  muted={!recipientDone}
                />
                <TimelineStep
                  done={donorDone}
                  label="أكد المتبرع التسليم"
                  muted={!donorDone}
                />
              </div>

              {isOwner && respondedItem && (
                <div className="mt-5 pt-4 border-t border-[#f1ece5]">
                  {!recipientDone ? (
                    <button
                      onClick={handleConfirmReceipt}
                      disabled={confirming}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-black text-white transition-all hover:bg-primary/90 disabled:opacity-50"
                    >
                      {confirming ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          جاري التأكيد...
                        </>
                      ) : (
                        "✅ تأكيد استلام الغرض"
                      )}
                    </button>
                  ) : !donorDone ? (
                    <div className="w-full rounded-2xl border border-yellow-100 bg-yellow-50 py-3 text-center text-sm font-black text-yellow-700">
                      ⏳ تم تأكيدك — في انتظار تأكيد المتبرع
                    </div>
                  ) : (
                    <div className="w-full rounded-2xl border border-green-100 bg-green-50 py-3 text-center text-sm font-black text-green-700">
                      🎉 تم التسليم بنجاح!
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Chat / navigate */}
            {respondedItem && (
              <section className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-sm">
                <h2 className="text-sm font-black text-[#1f2526]">التنسيق والمتابعة</h2>
                <p className="mt-2 text-sm leading-7 text-[#716a62]">
                  استخدم المحادثة لتنسيق وقت ومكان التسليم، أو افتح صفحة الغرض الكاملة
                  لمتابعة التفاصيل المرتبطة به.
                </p>

                <div className="mt-4 space-y-2">
                  {showChat ? (
                    <button
                      onClick={() => {
                        setChatTarget({
                          itemId: respondedItem._id,
                          itemTitle: request.title,
                        });
                        setIsChatOpen(true);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary/5 py-3 text-sm font-black text-primary transition-all hover:bg-primary/10"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        chat
                      </span>
                      محادثة مع المتبرع لتنسيق التسليم
                    </button>
                  ) : !fullyDone ? (
                    <div className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-3 text-center text-[11px] font-bold text-gray-400">
                      🔒 التنسيق والمراسلة متاحان فقط لأطراف عملية الحجز
                    </div>
                  ) : null}

                  <button
                    onClick={() =>
                      router.push(`/items/${respondedItem._id}?ref=donation-request`)
                    }
                    className="w-full rounded-2xl bg-[#f3f1ec] py-3 text-xs font-black text-[#615b54] transition-all hover:bg-[#ebe6df]"
                  >
                    عرض صفحة الغرض كاملة ←
                  </button>
                </div>
              </section>
            )}

            {/* Request owner card */}
            <section className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-black text-[#1f2526]">صاحب الطلب</h2>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-base font-black text-primary">
                  {request.requester.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-[#1d2324]">
                    {request.requester.name}
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
      </main>
    </div>
  );
}

// ── Internal components ──────────────────────────────────────

function TimelineStep({
  label,
  done,
  muted,
}: {
  label: string;
  done: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full ${
          done
            ? "bg-green-50 text-green-700"
            : muted
            ? "bg-gray-50 text-gray-300"
            : "bg-yellow-50 text-yellow-700"
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">
          {done ? "check" : "schedule"}
        </span>
      </div>
      <p
        className={`text-sm font-bold ${
          done ? "text-[#1f2526]" : muted ? "text-gray-400" : "text-[#6f685f]"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

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

function ConfirmIndicator({ label, done }: { label: string; done: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-2xl px-3 py-3 text-xs font-black ${
        done ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400"
      }`}
    >
      <span className="material-symbols-outlined text-[16px]">
        {done ? "check_circle" : "radio_button_unchecked"}
      </span>
      {label}
    </div>
  );
}

function OfferCard({
  offer,
  onAccept,
  isAccepting,
}: {
  offer: DonationOffer;
  onAccept: () => void;
  isAccepting: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-[#fcfbf8] p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-base font-black text-primary">
          {offer.donor.name.charAt(0)}
        </div>

        <div>
          <p className="text-sm font-black text-[#1d2324]">{offer.donor.name}</p>
          <p className="text-xs text-gray-400">
            Level {offer.donor.trustLevel} · {offer.donor.trustScore} نقطة
          </p>
        </div>

        <span className="mr-auto rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#6b655e]">
          {offer.condition}
        </span>
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
        {offer.safeHub.name} — {offer.safeHub.city}
      </div>

      <button
        onClick={onAccept}
        disabled={isAccepting}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-black text-white transition-all hover:bg-primary/90 disabled:opacity-50"
      >
        {isAccepting ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            جاري الاختيار...
          </>
        ) : (
          "✅ اختر هذا المتبرع"
        )}
      </button>
    </div>
  );
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