"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import axiosInstance from "@/lib/api/axiosInstance";

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
      const [boardRes, rankRes] = await Promise.all([
        axiosInstance.get<{ leaderboard: LeaderboardEntry[] }>(
          "/api/leaderboard",
          { signal: controller.signal }
        ),
        axiosInstance.get<MyRank>(
          "/api/leaderboard/me",
          { signal: controller.signal }
        ),
      ]);

      if (controller.signal.aborted) return;
      setLeaderboard(boardRes.data.leaderboard);
      setMyRank(rankRes.data);
      setLastUpdated(new Date());
    } catch {
      // صامت
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // فيتش أول
    fetchAll(false);

    // ✅ اتصال Socket.io
    const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      withCredentials: true,
      transports: ["websocket"],
    });
    socketRef.current = socket;

    // ✅ كل ما يصير تبرع/تسليم → حدّث الـ leaderboard
    socket.on("leaderboard:update", () => {
      fetchAll(true); // في الخلفية بدون spinner
    });

    return () => {
      abortRef.current?.abort();
      socket.disconnect();
    };
  }, [fetchAll]);

  return { leaderboard, myRank, loading, lastUpdated, refetch: () => fetchAll(false) };
}