// src/context/AuthContext.tsx
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
    setInitialized,
} from "@/lib/api/axiosInstance";
import type { AuthUser } from "@/types/user.types";
import Cookies from "js-cookie";

// ─── النوع المصغّر — فقط ما تحتاجه الواجهة للعرض ───────────
// أي حقل زيادة هنا = بيانات غير ضرورية مكشوفة في كوكي قابل للقراءة
type CachedUser = Pick<
  AuthUser,
  "_id" | "name" | "email" | "avatar" | "role" | "trustLevel" | "isVerifiedStudent"
>;

interface AuthContextType {
  user:            CachedUser | null; // ← الواجهة تعمل مع CachedUser فقط
  accessToken:     string | null;
  isLoading:       boolean;
  isLoggedIn:      boolean;
  isAuthenticated: boolean;
  setUser:         (u: AuthUser | null) => void; // ← تقبل AuthUser كامل لكن تحفظ المصغّر
  refreshSession:  () => Promise<boolean>;
  logout:          () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_COOKIE = "aoun_user";

// ─── تحويل AuthUser الكامل إلى CachedUser المصغّر ────────────
// هذه الدالة هي "الفلتر" — أي بيانات لا تمر منها لا تُحفظ
function toMinimalUser(u: AuthUser): CachedUser {
  return {
    _id:               u._id,
    name:              u.name,
    email:             u.email,
    avatar: u.avatar ?? undefined,
    role:              u.role,
    trustLevel:        u.trustLevel ?? 1,
    isVerifiedStudent: u.isVerifiedStudent ?? false,
  };
}

// ─── حفظ الـ subset الصغير فقط في الكوكي ─────────────────────
// ملاحظة: js-cookie لا تدعم httpOnly — هذا الكوكي للعرض فقط
// الـ refreshToken الحقيقي محمي في httpOnly cookie يديره الباك إند
function saveUserCookie(u: CachedUser) {
  Cookies.set(USER_COOKIE, JSON.stringify(u), {
    expires:  7,
    sameSite: "lax",
  });
}

// ─── تحميل الكوكي عند بدء التطبيق ───────────────────────────
function loadUserCookie(): CachedUser | null {
  try {
    const raw = Cookies.get(USER_COOKIE);
    return raw ? (JSON.parse(raw) as CachedUser) : null;
  } catch {
    return null;
  }
}

function clearUserCookie() {
  Cookies.remove(USER_COOKIE);
}

// ─── إيقاظ الباك إند قبل أول طلب حقيقي ─────────────────────
async function warmUpBackend() {
  try {
    await axiosInstance.get("/health", { timeout: 3000 });
  } catch {
    // تجاهل الفشل — الهدف فقط إيقاظ السيرفر من السبات
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ─── State يعمل مع CachedUser فقط ────────────────────────
  const [user, setUserState] = useState<CachedUser | null>(loadUserCookie);
  const [isLoading, setIsLoading]   = useState(true);
  const initialized = useRef(false);
  const refreshing  = useRef<Promise<boolean> | null>(null);

  // ─── setUser: تقبل AuthUser كامل، تحفظ المصغّر فقط ─────────
  const setUser = useCallback((u: AuthUser | null) => {
    if (u) {
      const minimal = toMinimalUser(u); // ← الفلتر هنا
      setUserState(minimal);
      saveUserCookie(minimal);
    } else {
      setUserState(null);
      clearUserCookie();
    }
  }, []);

  // ─── تجديد الجلسة عبر refreshToken (httpOnly cookie) ─────
  const refreshSession = useCallback(async (): Promise<boolean> => {
    // إذا يوجد طلب تجديد جارٍ، انتظره بدل فتح طلب ثانٍ
    if (refreshing.current) return refreshing.current;

    refreshing.current = (async () => {
      try {
        // الباك إند يقرأ refreshToken من httpOnly cookie تلقائياً
        const { data } = await axiosInstance.post<{ accessToken: string }>(
          "/api/auth/refresh",
          {}
        );

        const freshToken = data.accessToken;
        setAccessToken(freshToken); // ← يُخزَّن في الذاكرة فقط، لا localStorage

        // جلب بيانات المستخدم الحالية من الباك إند
        const meRes = await axiosInstance.get<{ user: AuthUser }>("/api/auth/me", {
          headers: { Authorization: `Bearer ${freshToken}` },
        });

        const fetchedUser =
          meRes.data.user ?? (meRes.data as unknown as AuthUser);

        // setUser يفلتر تلقائياً ويحفظ المصغّر فقط
        setUser(fetchedUser);
        return true;
      } catch {
        // فشل التجديد = جلسة منتهية أو غير صالحة
        setAccessToken(null);
        clearUserCookie();
        setUserState(null);
        return false;
      } finally {
        refreshing.current = null;
      }
    })();

    return refreshing.current;
  }, [setUser]);

  // ─── تسجيل الخروج ───────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      // الباك إند يمسح refreshToken من DB ويحذف الكوكي الـ httpOnly
      await axiosInstance.post("/api/auth/logout", {});
    } finally {
      setAccessToken(null);
      clearUserCookie();
      setUserState(null);
      window.location.replace("/login");
    }
  }, []);

  // ─── تهيئة الجلسة عند فتح التطبيق ──────────────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

   warmUpBackend().finally(() => {
  refreshSession().finally(() => {
    setIsLoading(false);
    setInitialized(); // ← أضف هذا السطر
  });
});
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