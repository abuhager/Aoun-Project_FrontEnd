"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  resetAuthState,
  setAccessToken,
  setInitialized,
} from "@/lib/api/axiosInstance";
import { requestLogout, requestRefreshSession } from "@/lib/api/authApi";
import { normalizeApiError } from "@/lib/api/apiError";
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
  invalidateSession: (reason?: SessionEndReason) => void;
  logout: () => Promise<void>;
}

export type SessionEndReason = "session_expired" | "account_unavailable";

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
        const data = await requestRefreshSession();

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

        const apiError = normalizeApiError(error);
        const isNetworkError = apiError.isNetworkError;
        const status = apiError.status;

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

  const invalidateSession = useCallback((reason: SessionEndReason = "session_expired") => {
    clearLocalSession();
    initialized.current = false;
    refreshing.current = null;
    isLoggingOut.current = false;
    setIsLoading(false);

    if (typeof window !== "undefined") {
      window.location.replace(`/login?reason=${reason}`);
    }
  }, [clearLocalSession]);

  const logout = useCallback(async () => {
    isLoggingOut.current = true;
    try {
      await requestLogout();
    } catch (error) {
      const apiError = normalizeApiError(error);
      if (apiError.status !== 401) {
        console.error("[AuthContext] logout failed:", apiError.code ?? apiError.message);
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
        invalidateSession,
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
