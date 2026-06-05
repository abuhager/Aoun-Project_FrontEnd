// src/hooks/useSocket.ts — الإصلاح الكامل

"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { getAccessToken } from "@/lib/api/axiosInstance";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ✅ الـ singleton مرتبط بـ userId لضمان disconnect صحيح
let socketSingleton: Socket | null = null;
let socketUserId: string | null = null;

export function useSocket() {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  const connectSocket = useCallback((userId: string) => {
    const token = getAccessToken();
    if (!token) return null;

    // ✅ إذا الـ socket موجود ويخص نفس المستخدم — أعد استخدامه
    if (socketSingleton?.connected && socketUserId === userId) {
      socketRef.current = socketSingleton;
      return socketSingleton;
    }

    // ✅ قطع الاتصال القديم بالكامل قبل فتح جديد
    if (socketSingleton) {
      socketSingleton.removeAllListeners();
      socketSingleton.disconnect();
      socketSingleton = null;
      socketUserId = null;
    }

    socketSingleton = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
      timeout: 8000,
      autoConnect: true,
    });

    socketUserId = userId;
    socketRef.current = socketSingleton;
    return socketSingleton;
  }, []);

  useEffect(() => {
    if (!user?._id || !isAuthenticated) {
      // ✅ تنظيف كامل عند logout
      if (socketSingleton) {
        socketSingleton.removeAllListeners();
        socketSingleton.disconnect();
        socketSingleton = null;
        socketUserId = null;
      }
      socketRef.current = null;
      return;
    }

    const socket = connectSocket(user._id);
    if (!socket) return;

    const handleConnectError = (err: Error) => {
      const message = err?.message || "";
      if (message === "TOKEN_EXPIRED" || message === "INVALID_TOKEN") {
        setTimeout(() => {
          const freshToken = getAccessToken();
          if (!freshToken || !socketSingleton) return;
          socketSingleton.auth = { token: freshToken };
          socketSingleton.connect();
        }, 1200);
      }
    };

    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect_error", handleConnectError);
      // ✅ لا نقطع الـ socket عند unmount — Singleton يبقى حياً
    };
  }, [user?._id, isAuthenticated, connectSocket]);

  return socketRef;
}