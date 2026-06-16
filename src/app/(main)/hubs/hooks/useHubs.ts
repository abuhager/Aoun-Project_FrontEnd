// src/app/(main)/hubs/hooks/useHubs.ts — ✅ PATCHED [LOGIC-02]
"use client";
import { useEffect, useState } from "react";
import { getHubs }             from "@/lib/api/hubApi";
import { SafeHub }             from "@/types/hub.types";

export function useHubs() {
  const [hubs,    setHubs]    = useState<SafeHub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");
  const [city,    setCity]    = useState("الكل");

  useEffect(() => {
    getHubs()
      // ✅ LOGIC-02: حُذفت .filter((h) => h.isActive) — الـ Backend يكفل ذلك
      // GET /api/hubs → findAllActive() → isActive: true فقط
      .then((data) => setHubs(data))
      .catch(() => setError("تعذر تحميل مراكز التسليم"))
      .finally(() => setLoading(false));
  }, []);

  // ✅ المدن مستخرجة ديناميكياً من البيانات المحملة — لا hardcoded
  const cities = ["الكل", ...Array.from(new Set(hubs.map((h) => h.city))).sort()];

  const filtered = hubs.filter((h) => {
    const matchCity   = city === "الكل" || h.city === city;
    const matchSearch = h.name.includes(search) || h.address.includes(search);
    return matchCity && matchSearch;
  });

  return { hubs: filtered, loading, error, search, setSearch, city, setCity, cities };
}