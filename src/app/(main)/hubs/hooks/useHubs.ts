"use client";
import { useEffect, useState } from "react";
import { getHubs }             from "@/lib/api/hubApi";   // ✅ الاسم الصحيح
import { SafeHub }             from "@/types/hub.types";

export function useHubs() {
  const [hubs,    setHubs]    = useState<SafeHub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");
  const [city,    setCity]    = useState("الكل");

  useEffect(() => {
    getHubs()
      .then((data) => setHubs(data.filter((h) => h.isActive))) // ✅ فلترة النشطين
      .catch(() => setError("تعذر تحميل مراكز التسليم"))
      .finally(() => setLoading(false));
  }, []);

  const cities = ["الكل", ...Array.from(new Set(hubs.map((h) => h.city)))];

  const filtered = hubs.filter((h) => {
    const matchCity   = city === "الكل" || h.city === city;
    const matchSearch = h.name.includes(search) || h.address.includes(search);
    return matchCity && matchSearch;
  });

  return { hubs: filtered, loading, error, search, setSearch, city, setCity, cities };
}