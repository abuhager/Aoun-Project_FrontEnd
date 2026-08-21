"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
import axiosInstance, {
  resetAuthState,
  setAccessToken,
  setInitialized,
} from "@/lib/api/axiosInstance";
import { clearSessionCookie, setSessionCookie } from "@/lib/utils/cookieUtils";
import type { AuthUser } from "@/types/user.types";

interface AuthContextType {
  user: AuthUser | null;
  fullUser: AuthUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  refreshSession: () => Promise<boolean>;
  logout: () => Promise<void>;
}

interface RefreshResponse {
  accessToken: string;
  user: AuthUser;
}

const SAFETY_TIMEOUT_MS =
  Number.parseInt(process.env.NEXT_PUBLIC_AUTH_SAFETY_TIMEOUT ?? "8000", 10) ||
  8000;

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);
  const refreshing = useRef<Promise<boolean> | null>(null);
  const isLoggingOut = useRef(false);
  const authRevision = useRef(0);
  const userRef = useRef<AuthUser | null>(null);

  const setUser = useCallback((nextUser: AuthUser | null) => {
    authRevision.current += 1;
    userRef.current = nextUser;
    setUserState(nextUser);
    setInitialized(Boolean(nextUser));
  }, []);

  const clearLocalSession = useCallback(() => {
    authRevision.current += 1;
    resetAuthState();
    clearSessionCookie();
    userRef.current = null;
    setUserState(null);
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (isLoggingOut.current) return false;
    if (refreshing.current) return refreshing.current;

    const refreshRevision = authRevision.current;
    refreshing.current = (async () => {
      try {
        const { data } = await axiosInstance.post<RefreshResponse>(
          "/api/auth/refresh",
          {},
          { withCredentials: true }
        );

        if (!data.accessToken || !data.user?._id) {
          throw new Error("INVALID_REFRESH_RESPONSE");
        }
        if (refreshRevision !== authRevision.current) {
          setInitialized(Boolean(userRef.current));
          return Boolean(userRef.current);
        }

        setAccessToken(data.accessToken);
        userRef.current = data.user;
        setUserState(data.user);
        setSessionCookie();
        setInitialized(true);
        return true;
      } catch (error) {
        if (refreshRevision !== authRevision.current) {
          setInitialized(Boolean(userRef.current));
          return Boolean(userRef.current);
        }

        const isNetworkError = axios.isAxiosError(error) && !error.response;
        const status = axios.isAxiosError(error) ? error.response?.status : null;

        if (!isNetworkError || status === 401 || status === 403) {
          clearLocalSession();
        }

        setInitialized(false);
        return false;
      } finally {
        refreshing.current = null;
      }
    })();

    return refreshing.current;
  }, [clearLocalSession]);

  const logout = useCallback(async () => {
    isLoggingOut.current = true;
    try {
      await axiosInstance.post("/api/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status !== 401) {
        console.error("[AuthContext] logout failed:", error.message);
      }
    } finally {
      clearLocalSession();
      initialized.current = false;
      refreshing.current = null;
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
      setTimeout(() => {
        isLoggingOut.current = false;
      }, 2000);
    }
  }, [clearLocalSession]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const safetyTimer = window.setTimeout(() => {
      setInitialized(false);
      setIsLoading(false);
    }, SAFETY_TIMEOUT_MS);

    void refreshSession().finally(() => {
      window.clearTimeout(safetyTimer);
      setIsLoading(false);
    });

    return () => window.clearTimeout(safetyTimer);
  }, [refreshSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        fullUser: user,
        isLoading,
        isLoggedIn: Boolean(user),
        isAuthenticated: Boolean(user),
        setUser,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return { ...context, isFullyLoaded: Boolean(context.user) };
}

export type CachedUser = AuthUser;
