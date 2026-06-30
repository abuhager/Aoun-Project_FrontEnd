"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { getAccessToken } from "@/lib/api/axiosInstance";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let socketSingleton: Socket | null = null;
let socketUserId:    string | null = null;

export function useSocket() {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  const connectSocket = useCallback((userId: string) => {
    if (socketSingleton?.connected && socketUserId === userId) {
      socketRef.current = socketSingleton;
      return socketSingleton;
    }

    if (socketSingleton) {
      socketSingleton.removeAllListeners();
      socketSingleton.disconnect();
      socketSingleton = null;
      socketUserId    = null;
    }

    socketSingleton = io(SOCKET_URL, {
      // ✅ auth كـ callback ديناميكي — يُستدعى عند كل reconnect تلقائياً
      auth: (cb: (data: { token: string | null }) => void) =>
        cb({ token: getAccessToken() }),
      withCredentials:      true,
      transports:           ["websocket"],
      reconnection:         true,
      reconnectionAttempts: 10,
      reconnectionDelay:    1500,
      timeout:              8000,
    });

    socketUserId      = userId;
    socketRef.current = socketSingleton;
    return socketSingleton;
  }, []);

  useEffect(() => {
    if (!user?._id || !isAuthenticated) {
      if (socketSingleton) {
        socketSingleton.removeAllListeners();
        socketSingleton.disconnect();
        socketSingleton = null;
        socketUserId    = null;
      }
      socketRef.current = null;
      return;
    }

    const socket = connectSocket(user._id);
    if (!socket) return;

    const handleConnectError = (err: Error) => {
      const msg = err?.message || "";
      if (msg === "TOKEN_EXPIRED" || msg === "INVALID_TOKEN") {
        // auth callback يجلب fresh token تلقائياً عند reconnect
        setTimeout(() => {
          if (socketSingleton && !socketSingleton.connected) {
            socketSingleton.connect();
          }
        }, 1200);
      }
    };

    socket.on("connect_error", handleConnectError);
    return () => { socket.off("connect_error", handleConnectError); };
  }, [user?._id, isAuthenticated, connectSocket]);

  return socketRef;
}