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
  setInitialized,
  resetAuthState,
} from "@/lib/api/axiosInstance";
import type { AuthUser } from "@/types/user.types";
import Cookies from "js-cookie";

type CachedUser = Pick<
  AuthUser,
  "_id" | "name" | "email" | "avatar" | "role" | "trustLevel" | "quota" | "gamification"
>;

interface AuthContextType {
  user: CachedUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isAuthenticated: boolean;
  setUser: (u: AuthUser | null) => void;
  refreshSession: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const USER_COOKIE = "aoun_user";

const AuthContext = createContext<AuthContextType | null>(null);

function toMinimalUser(u: AuthUser): CachedUser {
  return {
    _id: u._id,
    name: u.name,
    email: u.email,
    avatar: u.avatar ?? undefined,
    role: u.role,
    trustLevel: u.trustLevel ?? 1,
    quota: u.quota ?? 0,
    gamification: u.gamification ?? {
      trustScore: 0,
      totalDonations: 0,
      level: 1,
      title: "مبتدئ",
      badge: "🌱",
      progress: 0,
      pointsToNext: null,
    },
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
    } else {
      setUserState(null);
      clearUserCookie();
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (isLoggingOut.current) return false;
    if (refreshing.current) return refreshing.current;

    refreshing.current = (async () => {
      try {
        // ─── 1. احصل على accessToken جديد ───────────────────
        const { data } = await axiosInstance.post<{ accessToken: string }>(
          "/api/auth/refresh",
          {},
          { withCredentials: true }
        );

        const token = data.accessToken;
        setAccessToken(token);

        // ─── 2. أطلق الـ initQueue فوراً ────────────────────
        // لا تنتظر /me — الطلبات الأخرى تحتاج الـ token الآن
        setInitialized(true);

        // ─── 3. جلب بيانات المستخدم ─────────────────────────
        // /api/auth/me يرجع الـ user مباشرة (بدون wrapper)
        const meRes = await axiosInstance.get<AuthUser>("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        setUser(meRes.data);
        return true;

      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status !== 401) {
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
      await axiosInstance.post("/api/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status !== 401) {
        console.error("logout error:", err);
      }
    } finally {
      resetAuthState();
      setUser(null);
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

    // ─── timeout أمان 8 ثوانٍ ────────────────────────────
    const safetyTimer = setTimeout(() => {
      setInitialized(false);
      setIsLoading(false);
    }, 8000);

    refreshSession()
      .then(() => clearTimeout(safetyTimer))
      .catch(() => {
        clearTimeout(safetyTimer);
        setInitialized(false);
      })
      .finally(() => setIsLoading(false));
  }, [refreshSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
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