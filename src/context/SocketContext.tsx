"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "@/config/socket";
import { useAuth, type SessionEndReason } from "@/context/AuthContext";
import { subscribeAccessToken } from "@/lib/api/axiosInstance";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketAuthPayload,
  SocketReadyPayload,
} from "@/types/socket.types";

type AounSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
type SocketStatus = "idle" | "connecting" | "connected" | "reconnecting" | "error";
type SocketConnectError = Error & { data?: { code?: string } };

const REFRESHABLE_AUTH_CODES = new Set([
  "SOCKET_UNAUTHORIZED",
  "TOKEN_EXPIRED",
  "INVALID_TOKEN",
  "INVALID_TOKEN_IDENTITY",
]);

const TERMINAL_AUTH_REASONS: Record<string, SessionEndReason> = {
  ACCOUNT_BANNED: "account_unavailable",
  ACCOUNT_FROZEN: "account_unavailable",
  EMAIL_NOT_VERIFIED: "account_unavailable",
  USER_NOT_FOUND: "account_unavailable",
  SESSION_INVALIDATED: "session_expired",
};

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
  socket: AounSocket | null;
  isConnected: boolean;
  status: SocketStatus;
  wasRecovered: boolean;
  lastError: string | null;
  reconnect: () => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  status: "idle",
  wasRecovered: false,
  lastError: null,
  reconnect: () => {},
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const {
    user,
    isAuthenticated,
    refreshSession,
    invalidateSession,
  } = useAuth();
  const socketRef = useRef<AounSocket | null>(null);
  const activeTokenRef = useRef<string | null>(null);
  const refreshAttemptRef = useRef<Promise<boolean> | null>(null);
  const [socketInstance, setSocketInstance] = useState<AounSocket | null>(null);
  const [status, setStatus] = useState<SocketStatus>("idle");
  const [wasRecovered, setWasRecovered] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const reconnect = useCallback(() => {
    const current = socketRef.current;
    if (!current || current.connected || !activeTokenRef.current) return;
    setLastError(null);
    setStatus("connecting");
    current.connect();
  }, []);

  useEffect(() => {
    let disposed = false;
    let creatingSocket = false;
    let removeInstanceListeners = () => {};

    const disconnectSocket = () => {
      const current = socketRef.current;
      activeTokenRef.current = null;
      refreshAttemptRef.current = null;
      removeInstanceListeners();
      if (current) current.disconnect();
      socketRef.current = null;
      setSocketInstance(null);
      setStatus("idle");
      setWasRecovered(false);
      setLastError(null);
    };

    if (!user?._id || !isAuthenticated || !SOCKET_URL) {
      disconnectSocket();
      return;
    }

    const refreshSocketSession = () => {
      if (refreshAttemptRef.current) return refreshAttemptRef.current;

      const attempt = refreshSession().finally(() => {
        if (refreshAttemptRef.current === attempt) {
          refreshAttemptRef.current = null;
        }
      });
      refreshAttemptRef.current = attempt;
      return attempt;
    };

    const createSocket = async () => {
      if (creatingSocket) return;
      creatingSocket = true;

      let socketClient: typeof import("socket.io-client");
      try {
        socketClient = await import("socket.io-client");
      } catch {
        if (!disposed) {
          setStatus("error");
          setLastError("تعذر تحميل الاتصال الفوري");
        }
        creatingSocket = false;
        return;
      }

      const token = activeTokenRef.current;
      if (disposed || !token) {
        creatingSocket = false;
        return;
      }

      const { io } = socketClient;
      const instance = io(SOCKET_URL, {
        auth: { token },
        withCredentials: true,
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: Number.POSITIVE_INFINITY,
        reconnectionDelay: 1_000,
        reconnectionDelayMax: 10_000,
        randomizationFactor: 0.5,
        timeout: 10_000,
      }) as AounSocket;

      const onConnect = () => {
        if (disposed) return;
        setStatus("connected");
        setWasRecovered(Boolean(instance.recovered));
        setLastError(null);
      };
      const onDisconnect = (reason: string) => {
        if (disposed) return;
        setWasRecovered(false);
        setStatus(
          reason === "io client disconnect" && activeTokenRef.current
            ? "connecting"
            : "reconnecting"
        );
      };
      const onConnectError = (rawError: Error) => {
        if (disposed) return;
        const error = rawError as SocketConnectError;
        const code = error.data?.code;
        setStatus("error");
        setLastError(error.message || "تعذر الاتصال الفوري");

        if (code && TERMINAL_AUTH_REASONS[code]) {
          invalidateSession(TERMINAL_AUTH_REASONS[code]);
          return;
        }
        if (code && REFRESHABLE_AUTH_CODES.has(code)) {
          void refreshSocketSession();
        }
      };
      const onSocketReady = (payload: SocketReadyPayload) => {
        if (!disposed) setWasRecovered(payload.recovered);
      };
      const onTokenExpiring = () => {
        void refreshSocketSession();
      };
      const onTokenExpired = () => {
        setStatus("connecting");
        void refreshSocketSession();
      };
      const onForcedLogout = (payload: SocketAuthPayload) => {
        const reason = TERMINAL_AUTH_REASONS[payload.code] ?? "session_expired";
        invalidateSession(reason);
      };
      const onReconnectAttempt = () => {
        if (!disposed) setStatus("reconnecting");
      };
      const onReconnectFailed = () => {
        if (disposed) return;
        setStatus("error");
        setLastError("تعذر استعادة الاتصال الفوري");
      };

      instance.on("connect", onConnect);
      instance.on("disconnect", onDisconnect);
      instance.on("connect_error", onConnectError);
      instance.on(SOCKET_EVENTS.SOCKET_READY, onSocketReady);
      instance.on(SOCKET_EVENTS.AUTH_TOKEN_EXPIRING, onTokenExpiring);
      instance.on(SOCKET_EVENTS.AUTH_TOKEN_EXPIRED, onTokenExpired);
      instance.on(SOCKET_EVENTS.AUTH_FORCED_LOGOUT, onForcedLogout);
      instance.io.on("reconnect_attempt", onReconnectAttempt);
      instance.io.on("reconnect_failed", onReconnectFailed);

      removeInstanceListeners = () => {
        instance.off("connect", onConnect);
        instance.off("disconnect", onDisconnect);
        instance.off("connect_error", onConnectError);
        instance.off(SOCKET_EVENTS.SOCKET_READY, onSocketReady);
        instance.off(SOCKET_EVENTS.AUTH_TOKEN_EXPIRING, onTokenExpiring);
        instance.off(SOCKET_EVENTS.AUTH_TOKEN_EXPIRED, onTokenExpired);
        instance.off(SOCKET_EVENTS.AUTH_FORCED_LOGOUT, onForcedLogout);
        instance.io.off("reconnect_attempt", onReconnectAttempt);
        instance.io.off("reconnect_failed", onReconnectFailed);
      };

      socketRef.current = instance;
      activeTokenRef.current = token;
      setSocketInstance(instance);
      setStatus("connecting");
      instance.connect();
      creatingSocket = false;
    };

    const connectWithToken = (token: string | null) => {
      if (disposed) return;
      if (!token) {
        disconnectSocket();
        return;
      }

      const current = socketRef.current;
      if (!current) {
        activeTokenRef.current = token;
        void createSocket();
        return;
      }

      const tokenChanged = activeTokenRef.current !== token;
      activeTokenRef.current = token;
      current.auth = { token };

      if (tokenChanged && current.connected) {
        // A Socket handshake is authenticated once. Reconnect so the server validates the rotated token.
        setStatus("connecting");
        current.disconnect().connect();
      } else if (!current.connected) {
        setStatus("connecting");
        current.connect();
      }
    };

    const onOnline = () => {
      if (!socketRef.current?.connected) {
        void refreshSocketSession().then((refreshed) => {
          if (refreshed) reconnect();
        });
      }
    };

    const unsubscribe = subscribeAccessToken(connectWithToken);
    window.addEventListener("online", onOnline);

    return () => {
      disposed = true;
      window.removeEventListener("online", onOnline);
      unsubscribe();
      disconnectSocket();
    };
  }, [invalidateSession, isAuthenticated, reconnect, refreshSession, user?._id]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketInstance,
        isConnected: status === "connected",
        status,
        wasRecovered,
        lastError,
        reconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

export type { AounSocket, SocketStatus };
