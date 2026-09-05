"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import {
  acceptOffer,
  cancelDonationRequest,
  getDonationRequestById,
  getOffersByRequest,
  rejectOffer,
  withdrawOffer,
} from "@/lib/api/donationRequestApi";
import type { DonationOffer, DonationRequest } from "@/types/donationRequest.types";

type ToastState = { msg: string; ok: boolean } | null;

export function useDonationRequestDetails(
  id: string,
  initialRequest: DonationRequest | null
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [request, setRequest] = useState<DonationRequest | null>(initialRequest);
  const [offers, setOffers] = useState<DonationOffer[]>([]);
  const [loading, setLoading] = useState(!initialRequest);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const offersControllerRef = useRef<AbortController | null>(null);

  const currentUserId = user?._id ?? null;
  const requestedReturnTo = searchParams.get("returnTo");
  const listReturnTo =
    requestedReturnTo === "/donation-requests" ||
    requestedReturnTo?.startsWith("/donation-requests?")
      ? requestedReturnTo
      : "/donation-requests";

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
    if (initialRequest && !currentUserId) {
      setLoading(false);
      return;
    }
    void fetchRequest();
    return () => requestControllerRef.current?.abort();
  }, [authLoading, currentUserId, fetchRequest, initialRequest]);

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
    } catch (error) {
      await fetchRequest();
      showToast(extractErrorMsg(error, "تعذر قبول العرض"), false);
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
    if (
      !offerId ||
      !window.confirm("هل تريد سحب عرضك؟ لا يمكنك تقديم عرض جديد لنفس الطلب.")
    ) {
      return;
    }
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

  const isOwner = currentUserId === request?.requester?._id;
  const viewerOffer = request?.viewerOffer ?? null;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const canViewFulfilledItem = Boolean(
    isOwner || isAdmin || viewerOffer?.status === "accepted"
  );
  const respondedItem = canViewFulfilledItem ? request?.fulfilledByItem ?? null : null;
  const isAccepted = request?.status === "fulfilled" || Boolean(respondedItem);
  const showOfferCallToAction = Boolean(
    request?.status === "active" && !isOwner && !isAccepted && !viewerOffer
  );

  return {
    request,
    offers,
    toast,
    loading: loading || (authLoading && !initialRequest),
    accepting,
    rejecting,
    withdrawing,
    canceling,
    isOwner,
    viewerOffer,
    respondedItem,
    isAccepted,
    showOfferCallToAction,
    isAuthenticated: Boolean(user),
    handleAcceptOffer,
    handleRejectOffer,
    handleWithdrawOffer,
    handleCancelRequest,
    goBack: () => router.push(listReturnTo),
    openOfferForm: () => router.push(`/donation-requests/${id}/offer`),
    openFulfilledItem: (itemId: string) =>
      router.push(`/items/${itemId}?ref=donation-request`),
  };
}
