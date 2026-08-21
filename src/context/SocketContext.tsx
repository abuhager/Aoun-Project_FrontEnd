"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { subscribeAccessToken } from "@/lib/api/axiosInstance";

const resolveSocketUrl = () => {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (!configured) {
    return process.env.NODE_ENV === "development" ? "http://localhost:5000" : null;
  }
  try {
    return new URL(configured).origin;
  } catch {
    return null;
  }
};

const SOCKET_URL = resolveSocketUrl();

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, isConnected: false });

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const disconnectSocket = () => {
      const current = socketRef.current;
      if (!current) return;
      current.off("connect");
      current.off("disconnect");
      current.off("connect_error");
      current.disconnect();
      socketRef.current = null;
      setSocketInstance(null);
      setIsConnected(false);
    };

    if (!user?._id || !isAuthenticated || !SOCKET_URL) {
      disconnectSocket();
      return;
    }

    const connectWithToken = (token: string | null) => {
      if (!token) {
        disconnectSocket();
        return;
      }

      if (socketRef.current) {
        socketRef.current.auth = { token };
        if (!socketRef.current.connected) socketRef.current.connect();
        return;
      }

      const instance = io(SOCKET_URL, {
        auth: { token },
        withCredentials: true,
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 8,
        reconnectionDelay: 1_000,
        reconnectionDelayMax: 10_000,
        timeout: 10_000,
      });

      instance.on("connect", () => setIsConnected(true));
      instance.on("disconnect", () => setIsConnected(false));
      instance.on("connect_error", (error) => {
        setIsConnected(false);
        console.error("[Socket] تعذر الاتصال:", error.message);
      });

      socketRef.current = instance;
      setSocketInstance(instance);
      instance.connect();
    };

    const unsubscribe = subscribeAccessToken(connectWithToken);

    return () => {
      unsubscribe();
      disconnectSocket();
    };
  }, [user?._id, isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket: socketInstance, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
