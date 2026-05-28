// src/app/(main)/(protected)/leaderboard/hooks/useLeaderboard.ts
"use client";

import { useEffect, useRef, useState } from "react";
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
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchAll = async () => {
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
      } catch {
        // صامت في الإنتاج
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchAll();
    return () => abortRef.current?.abort();
  }, []);

  return { leaderboard, myRank, loading };
}