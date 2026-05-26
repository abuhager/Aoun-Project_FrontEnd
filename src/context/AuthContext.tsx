"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import axiosInstance, {
  setAccessToken,
  getAccessToken,
  setInitialized,
} from "@/lib/api/axiosInstance";
import type { AuthUser } from "@/types/user.types";
import Cookies from "js-cookie";

type CachedUser = Pick<
  AuthUser,
  "_id" | "name" | "email" | "avatar" | "role" | "trustLevel" | "trustScore" | "quota"
>;

interface AuthContextType {
  user: CachedUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isAuthenticated: boolean;
  setUser: (u: AuthUser | null) => void;
  refreshSession: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const USER_COOKIE = "aoun_user";
const SESSION_COOKIE = "session_active";

const AuthContext = createContext<AuthContextType | null>(null);

function toMinimalUser(u: AuthUser): CachedUser {
  return {
    _id: u._id,
    name: u.name,
    email: u.email,
    avatar: u.avatar ?? undefined,
    role: u.role,
    trustLevel: u.trustLevel ?? 1,
    trustScore: u.trustScore ?? 0,
    quota: u.quota ?? 0,
  };
}

function saveUserCookie(u: CachedUser) {
  Cookies.set(USER_COOKIE, JSON.stringify(u), {
    expires: 7,
    sameSite: IS_PRODUCTION ? "none" : "lax",
    secure: IS_PRODUCTION,
  });
}

function loadUserCookie(): CachedUser | null {
  try {
    const raw = Cookies.get(USER_COOKIE);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CachedUser>;
    if (!parsed._id) return null;

    return parsed as CachedUser;
  } catch {
    return null;
  }
}

function clearUserCookie() {
  Cookies.remove(USER_COOKIE, {
    sameSite: IS_PRODUCTION ? "none" : "lax",
    secure: IS_PRODUCTION,
  });
}

function setSessionCookie() {
  Cookies.set(SESSION_COOKIE, "true", {
    expires: 7,
    sameSite: "lax",
    secure: IS_PRODUCTION,
    path: "/",
  });
}

function clearSessionCookie() {
  Cookies.remove(SESSION_COOKIE, {
    path: "/",
    sameSite: "lax",
    secure: IS_PRODUCTION,
  });
}

async function warmUpBackend() {
  return;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<CachedUser | null>(loadUserCookie);
  const [isLoading, setIsLoading] = useState(true);

  const initialized = useRef(false);
  const refreshing = useRef<Promise<boolean> | null>(null);
  const isLoggingOut = useRef(false);

  const setUser = useCallback((u: AuthUser | null) => {
    if (u) {
      const minimal = toMinimalUser(u);
      setUserState(minimal);
      saveUserCookie(minimal);
      setSessionCookie();
    } else {
      setUserState(null);
      clearUserCookie();
      clearSessionCookie();
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (isLoggingOut.current) {
      return false;
    }

    if (refreshing.current) {
      return refreshing.current;
    }

    refreshing.current = (async () => {
      try {
        const { data } = await axiosInstance.post<{ accessToken: string }>(
          "/api/auth/refresh",
          {},
          { withCredentials: true }
        );

        const freshToken = data.accessToken;
        setAccessToken(freshToken);

        const meRes = await axiosInstance.get<{ user: AuthUser }>("/api/auth/me", {
          headers: { Authorization: `Bearer ${freshToken}` },
          withCredentials: true,
        });

        const fetchedUser =
          meRes.data.user ?? (meRes.data as unknown as AuthUser);

        setUser(fetchedUser);
        return true;
      } catch (err) {
        if (
          axios.isAxiosError(err) &&
          err.response?.status !== 401
        ) {
          console.error("refreshSession error:", err);
        }

        setAccessToken(null);
        setUser(null);
        return false;
      } finally {
        refreshing.current = null;
      }
    })();

    return refreshing.current;
  }, [setUser]);

  const logout = useCallback(async () => {
    isLoggingOut.current = true;

    try {
      await axiosInstance.post(
        "/api/auth/logout",
        {},
        { withCredentials: true }
      );
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status !== 401
      ) {
        console.error("logout error:", err);
      }
    } finally {
      setAccessToken(null);
      setUser(null);
      setInitialized(false);
      initialized.current = false;
      refreshing.current = null;

      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }

      setTimeout(() => {
        isLoggingOut.current = false;
      }, 1000);
    }
  }, [setUser]);

  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;
    void warmUpBackend();

    refreshSession()
      .then((success) => {
        setInitialized(success);
        if (!success) {
          clearSessionCookie();
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [refreshSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken: getAccessToken(),
        isLoading,
        isLoggedIn: !!user,
        isAuthenticated: !!user,
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
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}

export type { CachedUser };