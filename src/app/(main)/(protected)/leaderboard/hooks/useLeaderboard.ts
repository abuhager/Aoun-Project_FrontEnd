"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { SOCKET_EVENTS } from "@/config/socket";
import {
  getLeaderboard,
  getMyLeaderboardRank,
} from "@/lib/api/leaderboardApi";
import { isRequestCanceled, normalizeApiError } from "@/lib/api/apiError";
import type {
  LeaderboardEntry,
  MyRank,
  MyRankResponse,
} from "@/types/leaderboard.types";

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
      const requests: [
        Promise<LeaderboardEntry[]>,
        Promise<MyRankResponse | null>,
      ] = [
        getLeaderboard(controller.signal),
        user?._id
          ? getMyLeaderboardRank(controller.signal)
          : Promise.resolve(null),
      ];

      const [boardResult, rankResult] = await Promise.allSettled(requests);

      if (controller.signal.aborted) return;

      if (boardResult.status === "rejected") throw boardResult.reason;

      setLeaderboard(boardResult.value);

      if (rankResult.status === "fulfilled" && rankResult.value) {
        const rankData = rankResult.value;
        if (rankData.eligible) {
          setMyRank(rankData);
          setRankEligibility(true);
        } else {
          setMyRank(null);
          setRankEligibility(false);
        }
      } else if (rankResult.status === "rejected") {
        const rankError = normalizeApiError(rankResult.reason);
        const isLegacyIneligibleResponse =
          rankError.status === 404
          && rankError.code === "LEADERBOARD_USER_NOT_ELIGIBLE";

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
      if (isRequestCanceled(err)) {
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
    const resyncAfterReconnect = () => {
      if (!socket.recovered) handleUpdate();
    };
    socket.on(SOCKET_EVENTS.LEADERBOARD_UPDATE, handleUpdate);
    socket.on("connect", resyncAfterReconnect);
    return () => {
      socket.off(SOCKET_EVENTS.LEADERBOARD_UPDATE, handleUpdate);
      socket.off("connect", resyncAfterReconnect);
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
