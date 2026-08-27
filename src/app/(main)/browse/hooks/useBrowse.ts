"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getItems } from "@/lib/api/itemApi";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import { useAuth } from "@/context/AuthContext";
import type { Item } from "@/types/item.types";

const PAGE_SIZE = 12;

const normalizePage = (value: string | null) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

export function useBrowse() {
  const { user, isLoading: authLoading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const currentPage = normalizePage(searchParams.get("page"));
  const [refreshKey, setRefreshKey] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const filtersKeyRef = useRef(
    `${debouncedSearch}\u0000${selectedCity}\u0000${selectedCategory}`
  );

  const writePageToHistory = useCallback(
    (nextPage: number, mode: "push" | "replace" = "push") => {
      const safePage = Math.max(1, Math.floor(nextPage));
      const params = new URLSearchParams(window.location.search);

      if (safePage === 1) params.delete("page");
      else params.set("page", String(safePage));

      const query = params.toString();
      const href = query ? `${pathname}?${query}` : pathname;
      if (mode === "replace") window.history.replaceState(null, "", href);
      else window.history.pushState(null, "", href);
    },
    [pathname]
  );

  const setCurrentPage = useCallback(
    (value: number | ((page: number) => number)) => {
      const previousPage = normalizePage(
        new URLSearchParams(window.location.search).get("page")
      );
      const nextPage = typeof value === "function" ? value(previousPage) : value;
      writePageToHistory(nextPage);
    },
    [writePageToHistory]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const filtersKey = `${debouncedSearch}\u0000${selectedCity}\u0000${selectedCategory}`;
    if (filtersKeyRef.current === filtersKey) return;
    filtersKeyRef.current = filtersKey;

    writePageToHistory(1, "replace");
  }, [debouncedSearch, selectedCity, selectedCategory, writePageToHistory]);

  useEffect(() => {
    if (authLoading) return;
    const controller = new AbortController();

    const fetchItems = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getItems(
          {
            page: currentPage,
            limit: PAGE_SIZE,
            search: debouncedSearch || undefined,
            location: selectedCity || undefined,
            category: selectedCategory || undefined,
          },
          controller.signal
        );

        if (controller.signal.aborted) return;
        const pages = Math.max(1, response.pages ?? 1);
        if (currentPage > pages) {
          writePageToHistory(pages, "replace");
          return;
        }
        setItems(response.items ?? []);
        setTotal(response.total ?? 0);
        setTotalPages(pages);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setItems([]);
        setTotal(0);
        setTotalPages(1);
        setError(extractErrorMsg(requestError, "تعذّر تحميل الأغراض. حاول مجدداً."));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void fetchItems();
    return () => controller.abort();
  }, [
    authLoading,
    currentPage,
    debouncedSearch,
    selectedCity,
    selectedCategory,
    refreshKey,
    user?._id,
    writePageToHistory,
  ]);

  const retry = useCallback(() => setRefreshKey((value) => value + 1), []);

  return {
    items,
    loading,
    error,
    total,
    totalPages,
    currentPage,
    setCurrentPage,
    retry,
    searchQuery,
    setSearchQuery,
    selectedCity,
    setSelectedCity,
    selectedCategory,
    setSelectedCategory,
  };
}
