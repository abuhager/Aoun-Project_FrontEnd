"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getHubs } from "@/lib/api/hubApi";
import type { SafeHub } from "@/types/hub.types";

export function useHubs() {
  const [allHubs, setAllHubs] = useState<SafeHub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("الكل");
  const requestRef = useRef<AbortController | null>(null);

  const refetch = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setError("");

    try {
      const data = await getHubs(controller.signal);
      if (!controller.signal.aborted) setAllHubs(data);
    } catch {
      if (!controller.signal.aborted) {
        setError("تعذر تحميل مراكز التسليم. تحقق من الاتصال وحاول مجدداً.");
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
    return () => requestRef.current?.abort();
  }, [refetch]);

  const cities = useMemo(
    () => [
      "الكل",
      ...Array.from(new Set(allHubs.map((hub) => hub.city))).sort((a, b) =>
        a.localeCompare(b, "ar")
      ),
    ],
    [allHubs]
  );

  const hubs = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ar");
    return allHubs.filter((hub) => {
      const matchesCity = city === "الكل" || hub.city === city;
      const searchable = `${hub.name} ${hub.address} ${hub.city}`.toLocaleLowerCase("ar");
      return matchesCity && (!query || searchable.includes(query));
    });
  }, [allHubs, city, search]);

  return {
    hubs,
    total: allHubs.length,
    loading,
    error,
    refetch,
    search,
    setSearch,
    city,
    setCity,
    cities,
  };
}
