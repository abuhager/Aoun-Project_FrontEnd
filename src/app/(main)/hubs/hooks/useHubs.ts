"use client";

import { useMemo, useState } from "react";
import { usePublicHubs } from "@/hooks/usePublicHubs";

export function useHubs() {
  const {
    hubs: allHubs,
    error: requestError,
    isLoading,
    isValidating,
    refresh,
  } = usePublicHubs();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("الكل");

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
    loading: isLoading || (isValidating && allHubs.length === 0),
    error: requestError
      ? "تعذر تحميل مراكز التسليم. تحقق من الاتصال وحاول مجدداً."
      : "",
    refetch: refresh,
    search,
    setSearch,
    city,
    setCity,
    cities,
  };
}
