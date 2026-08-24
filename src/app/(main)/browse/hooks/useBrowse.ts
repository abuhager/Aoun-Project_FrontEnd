"use client";

import { useCallback, useEffect, useState } from "react";
import { getItems } from "@/lib/api/itemApi";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import { useAuth } from "@/context/AuthContext";
import type { Item } from "@/types/item.types";

const PAGE_SIZE = 12;

export function useBrowse() {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCity, selectedCategory]);

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
          setCurrentPage(pages);
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
