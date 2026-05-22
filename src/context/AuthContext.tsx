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

// ─── CachedUser: أصغر subset آمن يُخزَّن في Cookie قابل للقراءة ──
// القاعدة: أي حقل هنا = مرئي في المتصفح بدون جهد
// ✅ أضفنا: quota, trustScore  ← يحتاجهما StatsGrid و ProfileCard
// ❌ حذفنا: isVerifiedStudent  ← لا يُعرض في الـ navbar أو الـ layout
// ❌ لا isBanned, لا phone, لا badges, لا totalDonations
type CachedUser = Pick<
  AuthUser,
  "_id" | "name" | "email" | "avatar" | "role" | "trustLevel" | "trustScore" | "quota"
>;

interface AuthContextType {
  user:            CachedUser | null;
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

// ─── الفلتر الوحيد — أي بيانات لا تمر منه لا تُحفظ ───────────
function toMinimalUser(u: AuthUser): CachedUser {
  return {
    _id:        u._id,
    name:       u.name,
    email:      u.email,
    avatar:     u.avatar ?? undefined,
    role:       u.role,
    trustLevel: u.trustLevel ?? 1,
    trustScore: u.trustScore ?? 85,
    quota:      u.quota ?? 3,
  };
}

function saveUserCookie(u: CachedUser) {
  // ملاحظة: js-cookie لا تدعم httpOnly
  // هذا الكوكي للعرض السريع (avatar، اسم) فقط
  // الـ refreshToken الحقيقي محمي في httpOnly cookie يديره الباك إند
  Cookies.set(USER_COOKIE, JSON.stringify(u), {
    expires:  7,    // يُجدَّد مع كل refreshSession ناجح
    sameSite: "lax",
  });
}

function loadUserCookie(): CachedUser | null {
  try {
    const raw = Cookies.get(USER_COOKIE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachedUser>;
    // ✅ تحقق بسيط — إذا الكوكي تالف أو قديم لا يحتوي _id
    if (!parsed._id) return null;
    return parsed as CachedUser;
  } catch {
    return null;
  }
}

function clearUserCookie() {
  Cookies.remove(USER_COOKIE);
}

// ─── إيقاظ الباك إند قبل أول طلب حقيقي (Render free tier) ──
async function warmUpBackend() {
  try {
    await axiosInstance.get("/health", { timeout: 3000 });
  } catch {
    // تجاهل — الهدف إيقاظ السيرفر فقط
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState]     = useState<CachedUser | null>(loadUserCookie);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);
  const refreshing  = useRef<Promise<boolean> | null>(null);

  // ─── setUser: تقبل AuthUser الكامل من API، تحفظ المصغّر فقط ──
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

  // ─── refreshSession: يجدد Access Token عبر httpOnly Cookie ──
  const refreshSession = useCallback(async (): Promise<boolean> => {
    // منع طلبين متزامنين للـ refresh
    if (refreshing.current) return refreshing.current;

    refreshing.current = (async () => {
      try {
        const { data } = await axiosInstance.post<{ accessToken: string }>(
          "/api/auth/refresh",
          {}
        );

        const freshToken = data.accessToken;
        setAccessToken(freshToken); // ← في الذاكرة فقط، لا localStorage

        // ✅ جلب بيانات المستخدم المحدّثة من /me
        // هذا يضمن أن quota وtrustScore محدّثان دائماً
        const meRes = await axiosInstance.get<{ user: AuthUser }>("/api/auth/me", {
          headers: { Authorization: `Bearer ${freshToken}` },
        });

        const fetchedUser = meRes.data.user ?? (meRes.data as unknown as AuthUser);
        setUser(fetchedUser); // ← toMinimalUser يُفلتر تلقائياً
        return true;
      } catch {
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

  // ─── logout ───────────────────────────────────────────────
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

  // ─── تهيئة الجلسة عند فتح التطبيق ──────────────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    warmUpBackend(); // في الخلفية — لا ينتظرها أحد

    refreshSession().finally(() => {
      setIsLoading(false);
      setInitialized();
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

// ─── Export النوع للمكونات التي تحتاج CachedUser ────────────
export type { CachedUser };