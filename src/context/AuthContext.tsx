"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import axiosInstance, {
  setAccessToken,
  getAccessToken,
} from "@/lib/api/axiosInstance";
import type { AuthUser } from "@/types/user.types";
import Cookies from "js-cookie";

interface AuthContextType {
  user:            AuthUser | null;
  accessToken:     string | null;
  isLoading:       boolean;
  isLoggedIn:      boolean;
  isAuthenticated: boolean;
  setUser:         (u: AuthUser | null) => void;
  refreshSession:  () => Promise<boolean>;
  logout:          () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_COOKIE = "aoun_user";

function saveUserCookie(u: AuthUser) {
  Cookies.set(USER_COOKIE, JSON.stringify(u), { expires: 7, sameSite: "lax" });
}

function loadUserCookie(): AuthUser | null {
  try {
    const raw = Cookies.get(USER_COOKIE);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function clearUserCookie() {
  Cookies.remove(USER_COOKIE);
  Cookies.remove("isLoggedIn");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ابدأ ببيانات الكوكي فوراً عشان الناف بار يظهر بدون انتظار
  const [user,      setUserState] = useState<AuthUser | null>(loadUserCookie);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);
  const refreshing  = useRef<Promise<boolean> | null>(null);

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
    if (u) {
      saveUserCookie(u);
      Cookies.set("isLoggedIn", "1", { expires: 7, sameSite: "lax" });
    } else {
      clearUserCookie();
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (refreshing.current) return refreshing.current;

    refreshing.current = (async () => {
      try {
        const { data } = await axiosInstance.post<{ accessToken: string }>(
          "/api/auth/refresh", {}
        );

        const freshToken = data.accessToken;
        setAccessToken(freshToken);

        const meRes = await axiosInstance.get<{ user: AuthUser }>("/api/auth/me", {
          headers: { Authorization: `Bearer ${freshToken}` },
        });

        const fetchedUser = meRes.data.user ?? (meRes.data as unknown as AuthUser);
        setUser(fetchedUser);
        return true;
      } catch {
        setAccessToken(null);
        // لو فشل الـ refresh نظف الكوكي فقط لو كان محدود الصلاحية
        const existing = loadUserCookie();
        if (existing) {
          // كوكي موجودة لكن refresh فشل — نظف الكل
          clearUserCookie();
          setUserState(null);
        }
        return false;
      } finally {
        refreshing.current = null;
      }
    })();

    return refreshing.current;
  }, [setUser]);

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post("/api/auth/logout", {});
    } finally {
      setAccessToken(null);
      clearUserCookie();
      setUserState(null);
      window.location.replace("/login");
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    // لو كان في كوكي موجودة يعني في session محتملة — جرب refresh
    refreshSession().finally(() => setIsLoading(false));
  }, [refreshSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken:     getAccessToken(),
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
