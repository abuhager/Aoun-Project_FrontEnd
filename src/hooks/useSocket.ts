"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { getAccessToken } from "@/lib/api/axiosInstance";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// singleton — اتصال واحد للتطبيق كله
let _socket: Socket | null = null;
let _userId: string | null  = null;

function getOrCreateSocket(userId: string): Socket {
  // نفس المستخدم + متصل → أعد الـ socket الحالي
  if (_socket?.connected && _userId === userId) return _socket;

  // مستخدم مختلف أو socket مغلق → أنشئ جديد
  if (_socket) {
    _socket.disconnect();
    _socket = null;
    _userId = null;
  }

  _socket = io(SOCKET_URL, {
    auth: (cb) => cb({ token: getAccessToken() }),
    withCredentials: true,
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1500,
    timeout: 8000,
  });
  _userId = userId;
  return _socket;
}

export function useSocket() {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user?._id || !isAuthenticated) {
      if (_socket) {
        _socket.disconnect();
        _socket = null;
        _userId = null;
      }
      socketRef.current = null;
      return;
    }

    const socket = getOrCreateSocket(user._id);
    socketRef.current = socket;

    const onConnectError = (err: Error) => {
      const msg = err?.message ?? "";
      if (msg === "TOKEN_EXPIRED" || msg === "INVALID_TOKEN") {
        setTimeout(() => {
          if (_socket && !_socket.connected) _socket.connect();
        }, 1200);
      }
    };

    socket.on("connect_error", onConnectError);
    return () => {
      socket.off("connect_error", onConnectError);
    };
  }, [user?._id, isAuthenticated]);

  return socketRef;
}