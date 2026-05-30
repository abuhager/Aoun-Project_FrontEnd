"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { getAccessToken } from "@/lib/api/axiosInstance";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let socketSingleton: Socket | null = null;

export function useSocket() {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  const connectSocket = useCallback(() => {
    const token = getAccessToken();
    if (!token) return null;

    if (socketSingleton?.connected) {
      socketRef.current = socketSingleton;
      return socketSingleton;
    }

    if (socketSingleton) {
      socketSingleton.disconnect();
      socketSingleton = null;
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

    socketRef.current = socketSingleton;
    return socketSingleton;
  }, []);

  useEffect(() => {
    if (!user?._id || !isAuthenticated) {
      if (socketSingleton) {
        socketSingleton.disconnect();
        socketSingleton = null;
      }
      socketRef.current = null;
      return;
    }

    const socket = connectSocket();
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
    };
  }, [user?._id, isAuthenticated, connectSocket]);

  return socketRef;
}