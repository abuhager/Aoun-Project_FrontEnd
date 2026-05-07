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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // useRef بدل module-level variable — يتصفّر مع كل mount جديد
  const initialized = useRef(false);
  const refreshing  = useRef<Promise<boolean> | null>(null);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    // لو في refresh شغّال، انتظر نفس الـ promise
    if (refreshing.current) return refreshing.current;

    refreshing.current = (async () => {
      try {
        const { data } = await axiosInstance.post<{
          accessToken: string;
          user?: AuthUser;
        }>("/api/auth/refresh", {});
        // withCredentials موجودة في axiosInstance افتراضياً

        const freshToken = data.accessToken;
        setAccessToken(freshToken);

        // بعث الـ token يدوياً في /me لمنع race condition
        const meRes = await axiosInstance.get<{ user: AuthUser }>("/api/auth/me", {
          headers: { Authorization: `Bearer ${freshToken}` },
        });

        const fetchedUser = meRes.data.user ?? (meRes.data as unknown as AuthUser);
        setUser(fetchedUser);
        Cookies.set("isLoggedIn", "1", { expires: 7, sameSite: "lax" });
        return true;
      } catch {
        setAccessToken(null);
        setUser(null);
        Cookies.remove("isLoggedIn");
        return false;
      } finally {
        refreshing.current = null;
      }
    })();

    return refreshing.current;
  }, []);

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post("/api/auth/logout", {});
    } finally {
      setAccessToken(null);
      setUser(null);
      Cookies.remove("isLoggedIn");
      window.location.replace("/login");
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
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
