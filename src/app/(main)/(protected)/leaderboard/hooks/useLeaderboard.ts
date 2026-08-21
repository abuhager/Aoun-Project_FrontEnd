"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import axiosInstance from "@/lib/api/axiosInstance";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";

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
  eligible:       true;
  rank:           number;
  trustScore:     number;
  totalDonations: number;
  level:          number;
  title:          string;
  badge:          string;
  progress:       number;
  pointsToNext:   number | null;
}

interface IneligibleRank {
  eligible: false;
  reason:   string;
}

type MyRankResponse = MyRank | IneligibleRank;

export function useLeaderboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { socket } = useSocket();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank,      setMyRank]      = useState<MyRank | null>(null);
  const [rankEligibility, setRankEligibility] = useState<boolean | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const abortRef  = useRef<AbortController | null>(null);

  const fetchAll = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const requests = [
        axiosInstance.get<{ leaderboard: LeaderboardEntry[] }>(
          "/api/leaderboard",
          { signal: controller.signal }
        ),
        user?._id
          ? axiosInstance.get<MyRankResponse>(
              "/api/leaderboard/me",
              { signal: controller.signal }
            )
          : Promise.resolve(null),
      ] as const;

      const [boardResult, rankResult] = await Promise.allSettled(requests);

      if (controller.signal.aborted) return;

      if (boardResult.status === "rejected") throw boardResult.reason;

      setLeaderboard(boardResult.value.data.leaderboard);

      if (rankResult.status === "fulfilled" && rankResult.value) {
        const rankData = rankResult.value.data;
        if (rankData.eligible) {
          setMyRank(rankData);
          setRankEligibility(true);
        } else {
          setMyRank(null);
          setRankEligibility(false);
        }
      } else if (rankResult.status === "rejected") {
        const isLegacyIneligibleResponse =
          axios.isAxiosError(rankResult.reason) &&
          rankResult.reason.response?.status === 404 &&
          rankResult.reason.response?.data?.code === "LEADERBOARD_USER_NOT_ELIGIBLE";

        setMyRank(null);
        setRankEligibility(isLegacyIneligibleResponse ? false : null);

        if (!isLegacyIneligibleResponse && process.env.NODE_ENV === "development") {
          console.warn("[useLeaderboard] rank fetch error:", rankResult.reason);
        }
      } else {
        setMyRank(null);
        setRankEligibility(null);
      }
      setLastUpdated(new Date());

    } catch (err: unknown) {
      if (axios.isCancel(err)) {
        return;
      }

      // ✅ سجّل الخطأ الحقيقي في dev فقط — صامت في production
      if (process.env.NODE_ENV === "development") {
        console.warn("[useLeaderboard] fetch error:", err);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (authLoading) return;
    if (!user?._id) {
      setLeaderboard([]);
      setMyRank(null);
      setRankEligibility(null);
      setLoading(false);
      return;
    }
    void fetchAll(false);

    return () => {
      abortRef.current?.abort();
    };
  }, [authLoading, fetchAll, user?._id]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => void fetchAll(true);
    socket.on("leaderboard:update", handleUpdate);
    return () => {
      socket.off("leaderboard:update", handleUpdate);
    };
  }, [fetchAll, socket]);

  return {
    leaderboard,
    myRank,
    rankEligibility,
    loading,
    lastUpdated,
    refetch: () => fetchAll(false),
  };
}
