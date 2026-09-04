"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useSettings } from "@/hooks/useSettings";
import { usePublicHubs } from "@/hooks/usePublicHubs";
import {
  cancelDonationRequest,
  getDonationRequests,
  respondToDonationRequest,
} from "@/lib/api/donationRequestApi";
import {
  extractErrorMsg,
  normalizeApiError,
  type NormalizedApiError,
} from "@/lib/api/apiError";
import type {
  DonationRequest,
  DonationRequestsListResponse,
} from "@/types/donationRequest.types";

const DEFAULT_CATEGORIES = ["كتب", "إلكترونيات", "أثاث", "ملابس", "أخرى"];
const DEFAULT_LOCATIONS = ["عمان", "الزرقاء", "إربد", "العقبة", "السلط", "مادبا"];
const OFFER_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_OFFER_IMAGE_BYTES = 5 * 1024 * 1024;

export const DONATION_OFFER_CONDITIONS = [
  "جديد",
  "مستعمل ممتاز",
  "مستعمل جيد",
] as const;

export type DonationOfferForm = {
  condition: (typeof DONATION_OFFER_CONDITIONS)[number];
  safeHub: string;
  description: string;
  imageFile: File | null;
};

type ToastState = { msg: string; ok: boolean } | null;

const EMPTY_OFFER_FORM: DonationOfferForm = {
  condition: "مستعمل جيد",
  safeHub: "",
  description: "",
  imageFile: null,
};

const normalizePage = (value: string | null): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

export function useDonationRequests(
  initialData: DonationRequestsListResponse | null
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mineFromUrl = searchParams.get("mine") === "true";
  const { user, isLoading: authLoading } = useAuth();
  const currentUserId = user?._id;
  const { requireHubForBooking } = useSiteConfig();
  const { settings: publicSettings } = useSettings();
  const { hubs } = usePublicHubs();

  const categories = publicSettings?.categories?.length
    ? publicSettings.categories
    : DEFAULT_CATEGORIES;
  const locations = publicSettings?.locations?.length
    ? publicSettings.locations
    : DEFAULT_LOCATIONS;

  const [myOnly, setMyOnly] = useState(() => mineFromUrl);
  const [mounted, setMounted] = useState(false);
  const [requests, setRequests] = useState<DonationRequest[]>(
    () => initialData?.requests ?? []
  );
  const [loading, setLoading] = useState(!initialData);
  const [loadError, setLoadError] = useState<NormalizedApiError | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [page, setPage] = useState(
    () => initialData?.page ?? normalizePage(searchParams.get("page"))
  );
  const [pages, setPages] = useState(() => initialData?.pages ?? 1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [respondingTo, setRespondingTo] = useState<DonationRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [respondForm, setRespondForm] = useState<DonationOfferForm>(EMPTY_OFFER_FORM);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const stateRef = useRef({ myOnly, selectedCategory, selectedLocation, page });
  const loadControllerRef = useRef<AbortController | null>(null);
  const filtersKeyRef = useRef(`${myOnly}|${selectedCategory}|${selectedLocation}`);
  const consumedInitialDataRef = useRef(false);

  const listQuery = searchParams.toString();
  const listReturnTo = listQuery
    ? `/donation-requests?${listQuery}`
    : "/donation-requests";

  const requestDetailsHref = useCallback(
    (requestId: string) =>
      `/donation-requests/${requestId}?returnTo=${encodeURIComponent(listReturnTo)}`,
    [listReturnTo]
  );

  const writePageToHistory = useCallback(
    (nextPage: number, mode: "push" | "replace" = "push") => {
      const safePage = Math.max(1, Math.floor(nextPage));
      const params = new URLSearchParams(window.location.search);

      if (safePage === 1) params.delete("page");
      else params.set("page", String(safePage));

      const query = params.toString();
      const href = query ? `/donation-requests?${query}` : "/donation-requests";
      if (mode === "replace") window.history.replaceState(null, "", href);
      else window.history.pushState(null, "", href);
      setPage(safePage);
    },
    []
  );

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
      setLoadError(null);

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
      } catch (error) {
        if (controller.signal.aborted) return;
        const normalized = normalizeApiError(error, "تعذر تحميل طلبات التبرع");
        if (!normalized.isCanceled) setLoadError(normalized);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    []
  );

  const clearOfferImage = useCallback(() => {
    setImagePreview((currentPreview) => {
      if (currentPreview) URL.revokeObjectURL(currentPreview);
      return null;
    });
    setRespondForm((current) => ({ ...current, imageFile: null }));
  }, []);

  const resetRespondForm = useCallback(() => {
    setImagePreview((currentPreview) => {
      if (currentPreview) URL.revokeObjectURL(currentPreview);
      return null;
    });
    setRespondForm(EMPTY_OFFER_FORM);
  }, []);

  const closeOffer = useCallback(() => {
    resetRespondForm();
    setRespondingTo(null);
  }, [resetRespondForm]);

  const openOffer = (request: DonationRequest) => {
    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(`/donation-requests/${request._id}/offer`)}`
      );
      return;
    }
    resetRespondForm();
    setRespondingTo(request);
  };

  const updateRespondForm = (patch: Partial<DonationOfferForm>) => {
    setRespondForm((current) => ({ ...current, ...patch }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (imagePreview) URL.revokeObjectURL(imagePreview);

    if (file && !OFFER_IMAGE_TYPES.has(file.type)) {
      event.target.value = "";
      setRespondForm((current) => ({ ...current, imageFile: null }));
      setImagePreview(null);
      setToast({ msg: "الصورة يجب أن تكون JPG أو PNG أو WebP", ok: false });
      return;
    }

    if (file && file.size > MAX_OFFER_IMAGE_BYTES) {
      event.target.value = "";
      setRespondForm((current) => ({ ...current, imageFile: null }));
      setImagePreview(null);
      setToast({ msg: "حجم الصورة يجب ألا يتجاوز 5MB", ok: false });
      return;
    }

    setRespondForm((current) => ({ ...current, imageFile: file }));
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const submitOffer = async () => {
    if (!respondingTo || (requireHubForBooking && !respondForm.safeHub)) return;

    const requestId = respondingTo._id;
    setSubmitting(true);
    try {
      const response = await respondToDonationRequest(requestId, {
        condition: respondForm.condition,
        safeHub: respondForm.safeHub || undefined,
        description: respondForm.description || undefined,
        imageFile: respondForm.imageFile || undefined,
      });

      closeOffer();
      setToast({ msg: response.msg ?? "تم إرسال العرض للمراجعة", ok: true });
      await load(stateRef.current.page);
      setTimeout(() => router.push(requestDetailsHref(requestId)), 700);
    } catch (error) {
      setToast({ msg: extractErrorMsg(error, "تعذر الاستجابة للطلب"), ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  const cancelRequest = async (requestId: string) => {
    if (cancelingId) return;
    setCancelingId(requestId);
    try {
      const response = await cancelDonationRequest(requestId);
      setToast({ msg: response.msg ?? "تم إلغاء الطلب بنجاح", ok: true });
      void load(stateRef.current.page);
    } catch (error) {
      setToast({ msg: extractErrorMsg(error, "تعذر إلغاء الطلب"), ok: false });
    } finally {
      setCancelingId(null);
    }
  };

  const showMine = () => {
    if (!user) {
      router.push("/login?redirect=/donation-requests?mine=true");
      return;
    }
    setMyOnly(true);
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setMyOnly(mineFromUrl);
  }, [mineFromUrl]);

  useEffect(() => {
    if (authLoading || user || !myOnly) return;
    setMyOnly(false);
    router.replace("/donation-requests");
  }, [authLoading, myOnly, router, user]);

  useEffect(() => {
    const urlPage = normalizePage(searchParams.get("page"));
    setPage((current) => (current === urlPage ? current : urlPage));
  }, [searchParams]);

  useEffect(() => {
    stateRef.current = { myOnly, selectedCategory, selectedLocation, page };
  });

  useEffect(() => {
    if (!mounted || authLoading || (myOnly && !currentUserId)) return;
    const filtersKey = `${myOnly}|${selectedCategory}|${selectedLocation}`;
    const filtersChanged = filtersKeyRef.current !== filtersKey;
    filtersKeyRef.current = filtersKey;

    if (filtersChanged && page !== 1) {
      writePageToHistory(1, "replace");
      return;
    }

    if (
      !consumedInitialDataRef.current &&
      initialData &&
      !currentUserId &&
      !myOnly &&
      !selectedCategory &&
      !selectedLocation &&
      page === initialData.page
    ) {
      consumedInitialDataRef.current = true;
      setLoading(false);
      return;
    }

    void load(page, selectedCategory, myOnly, selectedLocation);
    return () => loadControllerRef.current?.abort();
  }, [
    authLoading,
    currentUserId,
    initialData,
    load,
    mounted,
    myOnly,
    page,
    selectedCategory,
    selectedLocation,
    writePageToHistory,
  ]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(
    () => () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    },
    [imagePreview]
  );

  const activeMineCount = useMemo(
    () => requests.filter((request) => request.status === "active").length,
    [requests]
  );

  return {
    activeMineCount,
    cancelingId,
    cancelRequest,
    categories,
    clearOfferImage,
    closeOffer,
    currentUserId,
    handleImageChange,
    hubs,
    imagePreview,
    loadError,
    loading,
    locations,
    mounted,
    myOnly,
    openOffer,
    page,
    pages,
    requestDetailsHref,
    requests,
    requireHubForBooking,
    respondForm,
    respondingTo,
    retry: () => void load(stateRef.current.page),
    selectedCategory,
    selectedLocation,
    setSelectedCategory,
    setSelectedLocation,
    showAll: () => setMyOnly(false),
    showMine,
    submitOffer,
    submitting,
    toast,
    updateRespondForm,
    writePageToHistory,
  };
}
