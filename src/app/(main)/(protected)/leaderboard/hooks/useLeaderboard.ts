"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import axiosInstance, { getAccessToken } from "@/lib/api/axiosInstance";

export interface LeaderboardEntry {
  rank:           number;
  _id:            string;
  name:           string;
  avatar?:        string;
  trustScore:     number;
  totalDonations: number;
  level:          number;
  title:          string;
  badge:          string;
  progress:       number;
  pointsToNext:   number | null;
}

export interface MyRank {
  rank:           number;
  trustScore:     number;
  totalDonations: number;
  level:          number;
  title:          string;
  badge:          string;
  progress:       number;
  pointsToNext:   number | null;
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank,      setMyRank]      = useState<MyRank | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const abortRef  = useRef<AbortController | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const fetchAll = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // ✅ الإصلاح الجوهري:
      // /api/leaderboard  → عام، يُطلب دائماً
      // /api/leaderboard/me → محمي، يُطلب فقط إذا يوجد accessToken
      const isLoggedIn = !!getAccessToken();

      const requests = [
        axiosInstance.get<{ leaderboard: LeaderboardEntry[] }>(
          "/api/leaderboard",
          { signal: controller.signal }
        ),
        // ✅ إذا غير مسجّل → Promise.resolve(null) بدلاً من طلب محمي
        isLoggedIn
          ? axiosInstance.get<MyRank>(
              "/api/leaderboard/me",
              { signal: controller.signal }
            )
          : Promise.resolve(null),
      ] as const;

      const [boardRes, rankRes] = await Promise.all(requests);

      if (controller.signal.aborted) return;

      setLeaderboard(boardRes.data.leaderboard);
      // ✅ rankRes يكون null إذا غير مسجّل → myRank يبقى null
      setMyRank(rankRes ? rankRes.data : null);
      setLastUpdated(new Date());

    } catch (err: unknown) {
      // ✅ سجّل الخطأ في dev فقط — صامت في production
      if (process.env.NODE_ENV === "development") {
        console.warn("[useLeaderboard] fetch error:", err);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(false);

    const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      withCredentials: true,
      transports:      ["websocket"],
    });
    socketRef.current = socket;

    socket.on("leaderboard:update", () => {
      fetchAll(true);
    });

    return () => {
      abortRef.current?.abort();
      socket.disconnect();
    };
  }, [fetchAll]);

  return {
    leaderboard,
    myRank,
    loading,
    lastUpdated,
    refetch: () => fetchAll(false),
  };
}