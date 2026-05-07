"use client";

import {
  createContext, useContext, useEffect,
  useState, useCallback, useRef
} from "react";
import axiosInstance, {
  setAccessToken, getAccessToken
} from "@/lib/api/axiosInstance";
import type { AuthUser } from "@/types/user.types";

interface AuthContextType {
  user:          AuthUser | null;
  accessToken:   string | null;
  isLoading:     boolean;
  isAuthenticated: boolean;
  setUser:       (u: AuthUser | null) => void;
  refreshSession: () => Promise<boolean>;
  logout:        () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized               = useRef(false);

  // ── استعادة الجلسة عند تحميل الصفحة ─────────────────────
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data } = await axiosInstance.post<{
        accessToken: string;
        user?: AuthUser;
      }>("/api/auth/refresh", {}, { withCredentials: true });

      setAccessToken(data.accessToken);

      // جيب بيانات المستخدم
      const meRes = await axiosInstance.get<{ user: AuthUser }>("/api/auth/me");
      setUser(meRes.data.user ?? meRes.data as unknown as AuthUser);
      return true;
    } catch {
      setAccessToken(null);
      setUser(null);
      return false;
    }
  }, []);

  // ── تسجيل الخروج ────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await axiosInstance.post("/api/auth/logout", {}, { withCredentials: true });
    } finally {
      setAccessToken(null);
      setUser(null);
      window.location.replace("/login");
    }
  }, []);

  // ── عند أول تحميل — استعد الجلسة من refreshToken cookie ─
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    refreshSession().finally(() => setIsLoading(false));
  }, [refreshSession]);

  return (
    <AuthContext.Provider value={{
      user,
      accessToken:     getAccessToken(),
      isLoading,
      isAuthenticated: !!user,
      setUser,
      refreshSession,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}