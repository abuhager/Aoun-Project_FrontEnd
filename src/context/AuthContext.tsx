// src/context/AuthContext.tsx
// ✅ إصلاحات: B1, B2, B3, B4, B5, B6
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

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type CachedUser = Pick<
  AuthUser,
  "_id" | "name" | "email" | "avatar" | "gamification"
>;

interface AuthContextType {
  user:            CachedUser | null;
  fullUser:        AuthUser   | null;
  isLoading:       boolean;
  isLoggedIn:      boolean;
  isAuthenticated: boolean;
  setUser:         (u: AuthUser | null) => void;
  refreshSession:  () => Promise<boolean>;
  logout:          () => Promise<void>;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const USER_COOKIE   = "aoun_user";

// ✅ إصلاح B5 — من .env بدلاً من hardcoded
const SAFETY_TIMEOUT_MS =
  parseInt(process.env.NEXT_PUBLIC_AUTH_SAFETY_TIMEOUT ?? "8000", 10) || 8000;

// ─────────────────────────────────────────────
// ✅ إصلاح B2 — Schema Validator للـ Cookie
// ─────────────────────────────────────────────
const REQUIRED_CACHED_FIELDS: (keyof CachedUser)[] = ["_id", "name", "email"];

function isValidCachedUser(obj: unknown): obj is CachedUser {
  if (!obj || typeof obj !== "object") return false;
  const u = obj as Record<string, unknown>;
  for (const field of REQUIRED_CACHED_FIELDS) {
    if (typeof u[field] !== "string" || !(u[field] as string).trim()) {
      return false;
    }
  }
  if (!/^[a-f\d]{24}$/i.test(u._id as string)) return false;
  return true;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function toMinimalUser(u: AuthUser): CachedUser {
  return {
    _id:    u._id,
    name:   u.name,
    email:  u.email,
    avatar: u.avatar ?? undefined,
    gamification: u.gamification ?? {
      trustScore:     0,
      totalDonations: 0,
      level:          1,
      title:          "مبتدئ",
      badge:          "🌱",
      progress:       0,
      pointsToNext:   null,
    },
  };
}

// ✅ إصلاح B1 — تشفير بيانات الـ cookie بـ Base64
function encodeCookieValue(obj: CachedUser): string {
  try {
    return btoa(encodeURIComponent(JSON.stringify(obj)));
  } catch {
    return "";
  }
}

function decodeCookieValue(raw: string): unknown {
  try {
    return JSON.parse(decodeURIComponent(atob(raw)));
  } catch {
    return null;
  }
}

function saveUserCookie(u: CachedUser) {
  const encoded = encodeCookieValue(u);
  if (!encoded) return;
  Cookies.set(USER_COOKIE, encoded, {
    expires:  7,
    sameSite: IS_PRODUCTION ? "none" : "lax",
    secure:   IS_PRODUCTION,
    path:     "/",
  });
}

function loadUserCookie(): CachedUser | null {
  try {
    const raw = Cookies.get(USER_COOKIE);
    if (!raw) return null;
    const decoded = decodeCookieValue(raw);
    if (!isValidCachedUser(decoded)) {
      clearUserCookie();
      return null;
    }
    return {
      _id:          decoded._id,
      name:         decoded.name,
      email:        decoded.email,
      avatar:       decoded.avatar ?? "",
      gamification: decoded.gamification ?? {
        trustScore:     0,
        totalDonations: 0,
        level:          1,
        title:          "مبتدئ",
        badge:          "🌱",
        progress:       0,
        pointsToNext:   null,
      },
    };
  } catch {
    clearUserCookie();
    return null;
  }
}

function clearUserCookie() {
  Cookies.remove(USER_COOKIE, {
    sameSite: IS_PRODUCTION ? "none" : "lax",
    secure:   IS_PRODUCTION,
    path:     "/",
  });
}

// ─────────────────────────────────────────────
// AuthProvider
// ─────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,      setUserState] = useState<CachedUser | null>(loadUserCookie);
  const [fullUser,  setFullUser]  = useState<AuthUser   | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initialized  = useRef(false);
  const refreshing   = useRef<Promise<boolean> | null>(null);
  const isLoggingOut = useRef(false);

  const setUser = useCallback((u: AuthUser | null) => {
    if (u) {
      const minimal = toMinimalUser(u);
      setUserState(minimal);
      setFullUser(u);
      saveUserCookie(minimal);
    } else {
      setUserState(null);
      setFullUser(null);
      clearUserCookie();
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (isLoggingOut.current) return false;
    if (refreshing.current)   return refreshing.current;

    refreshing.current = (async () => {
      try {
        const { data } = await axiosInstance.post<{ accessToken: string }>(
          "/api/auth/refresh",
          {},
          { withCredentials: true }
        );
        const token = data.accessToken;
        setAccessToken(token);

        try {
          const meRes = await axiosInstance.get<AuthUser>("/api/auth/me", {
            headers:         { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
          setUser(meRes.data);
          setInitialized(true);  // ✅ نجاح كامل
          return true;
        } catch (meError) {
          // ✅ إصلاح B3 — refresh نجح لكن /me فشل
          console.error("[AuthContext] /api/auth/me failed after refresh:", meError);
          setAccessToken(null);
          setUser(null);
          // ✅ إصلاح B6 — نحرّر الـ queue حتى لا تتجمّد طلبات الزوار
          setInitialized(false);
          return false;
        }
      } catch (err) {
        // refresh فشل — المستخدم زائر غير مسجّل (طبيعي تماماً)
        if (axios.isAxiosError(err) && err.response?.status !== 401) {
          console.error("[AuthContext] refreshSession error:", err);
        }
        setAccessToken(null);
        setUser(null);
        // ✅ إصلاح B6 — حرّر الـ initQueue للزوار فوراً بدل تجميد الـ Navbar
        // setInitialized(false) يُطلق initQueueRejects → NOT_AUTHENTICATED
        // وهذا صحيح: الزوار لا يحتاجون token
        setInitialized(false);
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
        console.error("[AuthContext] logout error:", err);
      }
    } finally {
      resetAuthState();
      setUser(null);
      initialized.current = false;
      refreshing.current  = null;
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
      // ✅ إصلاح B4 — نُصفّر isLoggingOut بعد اكتمال الـ redirect
      setTimeout(() => {
        isLoggingOut.current = false;
      }, 2000);
    }
  }, [setUser]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const safetyTimer = setTimeout(() => {
      // ✅ إصلاح B5+B6 — Safety timeout يحرّر الـ queue أيضاً
      setInitialized(false);
      setIsLoading(false);
    }, SAFETY_TIMEOUT_MS);

    refreshSession()
      .then(()  => clearTimeout(safetyTimer))
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
        fullUser,
        isLoading,
        isLoggedIn:      !!user,
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

// ─────────────────────────────────────────────
// useAuth Hook
// ─────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');

  // ✅ نُعيد fullUser إذا متاح — وإلا CachedUser مع علامة واضحة
  // المكوّنات التي تحتاج trustLevel أو role يجب أن تنتظر isLoading=false
  return {
    ...ctx,
    user:           ctx.fullUser ?? ctx.user,   // AuthUser | CachedUser | null
    isFullyLoaded:  !!ctx.fullUser,             // ✅ Guard صريح للمكوّنات الحساسة
  };
}

export type { CachedUser };