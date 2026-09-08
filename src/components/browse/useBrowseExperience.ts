"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import { getItems } from "@/lib/api/itemApi";
import {
  getBrowseSearchRequestValue,
  isBrowseSearchReady,
} from "@/lib/navigation/browseSearch";
import type { ItemsListResponse } from "@/types/item.types";

const SEARCH_DELAY_MS = 300;
const PAGE_SIZE = 12;

export type BrowseValues = {
  search: string;
  location: string;
  category: string;
  page: number;
};

type UseBrowseExperienceArgs = {
  initialResult: ItemsListResponse | null;
  initialValues: BrowseValues;
};

const createRequestKey = (values: BrowseValues) =>
  JSON.stringify([
    getBrowseSearchRequestValue(values.search),
    values.location,
    values.category,
    values.page,
  ]);

const buildBrowseHref = (values: BrowseValues) => {
  const params = new URLSearchParams();
  if (values.search) params.set("search", values.search);
  if (values.location) params.set("location", values.location);
  if (values.category) params.set("category", values.category);
  if (values.page > 1) params.set("page", String(values.page));
  const query = params.toString();
  return query ? `/browse?${query}` : "/browse";
};

const resolveClientAssetUrl = (value?: string | null) => {
  if (!value) return "/placeholder.svg";
  if (/^https?:\/\//i.test(value)) return value;

  const path = value.startsWith("/") ? value : `/${value}`;
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  return apiOrigin ? `${apiOrigin}${path}` : path;
};

const normalizeItemImages = (response: ItemsListResponse): ItemsListResponse => ({
  ...response,
  items: response.items.map((item) => ({
    ...item,
    imageUrl: resolveClientAssetUrl(item.imageUrl),
  })),
});

export function useBrowseExperience({
  initialResult,
  initialValues,
}: UseBrowseExperienceArgs) {
  const initialRequestValues = useMemo<BrowseValues>(
    () => ({
      ...initialValues,
      search: getBrowseSearchRequestValue(initialValues.search),
    }),
    [initialValues]
  );
  const normalizedInitialResult = useMemo(
    () => (initialResult ? normalizeItemImages(initialResult) : null),
    [initialResult]
  );
  const [result, setResult] = useState<ItemsListResponse | null>(normalizedInitialResult);
  const [searchQuery, setSearchQuery] = useState(initialValues.search);
  const [debouncedSearch, setDebouncedSearch] = useState(initialRequestValues.search);
  const [selectedLocation, setSelectedLocation] = useState(initialValues.location);
  const [selectedCategory, setSelectedCategory] = useState(initialValues.category);
  const [currentPage, setCurrentPage] = useState(initialValues.page);
  const [loading, setLoading] = useState(!initialResult);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const lastLoadedKey = useRef(
    initialResult ? createRequestKey(initialRequestValues) : null
  );

  useEffect(() => {
    const normalizedSearch = getBrowseSearchRequestValue(searchQuery);
    if (normalizedSearch === debouncedSearch) return;

    const timer = window.setTimeout(() => {
      setDebouncedSearch(normalizedSearch);
      setCurrentPage(1);
    }, SEARCH_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [debouncedSearch, searchQuery]);

  const requestValues = useMemo<BrowseValues>(
    () => ({
      search: debouncedSearch,
      location: selectedLocation,
      category: selectedCategory,
      page: currentPage,
    }),
    [currentPage, debouncedSearch, selectedCategory, selectedLocation]
  );
  const requestKey = useMemo(() => createRequestKey(requestValues), [requestValues]);
  const browseReturnTo = useMemo(() => buildBrowseHref(requestValues), [requestValues]);

  useEffect(() => {
    if (lastLoadedKey.current === requestKey) return;

    const controller = new AbortController();

    const fetchItems = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getItems(
          {
            page: requestValues.page,
            limit: PAGE_SIZE,
            search: requestValues.search || undefined,
            location: requestValues.location || undefined,
            category: requestValues.category || undefined,
          },
          controller.signal
        );

        if (controller.signal.aborted) return;
        const normalizedResponse = normalizeItemImages(response);
        const pages = Math.max(1, normalizedResponse.pages ?? 1);

        if (requestValues.page > pages) {
          setCurrentPage(pages);
          return;
        }

        lastLoadedKey.current = requestKey;
        setResult({
          ...normalizedResponse,
          page: normalizedResponse.page ?? requestValues.page,
          pages,
        });
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setResult(null);
        setError(extractErrorMsg(requestError, "تعذّر تحميل الأغراض. حاول مجدداً."));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void fetchItems();
    return () => controller.abort();
  }, [requestKey, requestValues, retryKey]);

  useEffect(() => {
    const currentHref = `${window.location.pathname}${window.location.search}`;
    if (currentHref !== browseReturnTo) {
      window.history.replaceState(null, "", browseReturnTo);
    }
  }, [browseReturnTo]);

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedLocation("");
    setSelectedCategory("");
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setCurrentPage(1);
  };

  const changeLocation = (value: string) => {
    setSelectedLocation(value);
    setCurrentPage(1);
  };

  const changeCategory = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    isBrowseSearchReady(searchQuery) || selectedLocation || selectedCategory
  );
  const totalPages = Math.max(1, result?.pages ?? 1);

  return {
    browseReturnTo,
    changeCategory,
    changeLocation,
    clearFilters,
    clearSearch,
    currentPage: result?.page ?? currentPage,
    error,
    hasActiveFilters,
    items: result?.items ?? [],
    loading,
    retry: () => setRetryKey((value) => value + 1),
    searchQuery,
    selectedCategory,
    selectedLocation,
    setCurrentPage,
    setSearchQuery,
    total: result?.total ?? 0,
    totalPages,
  };
}
