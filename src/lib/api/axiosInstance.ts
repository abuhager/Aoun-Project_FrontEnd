// src/lib/api/axiosInstance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

let accessToken: string | null = null;
export const setAccessToken = (t: string | null) => { accessToken = t; };
export const getAccessToken = () => accessToken;

// ── قراءة الـ token من الـ cookie (تُستدعى في كل طلب لضمان التزامن الصحيح) ────────
function getTokenFromCookie(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

const AUTH_PATHS = ['/login', '/register', '/verify'];

const axiosInstance = axios.create({
  baseURL:         process.env.NEXT_PUBLIC_API_URL,
  timeout:         15000,
  withCredentials: true,
});

// Request Interceptor — يقرأ الـ token في كل طلب
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // أولاً: الـ memory (أسرع) — ثانياً: الـ cookie (ضمان reload وـ redirect)
    const token = accessToken ?? getTokenFromCookie();

    // إذا الـ memory فارغ لكن الـ cookie موجود — حدّث الـ memory تلقائياً
    if (!accessToken && token) setAccessToken(token);

    if (token) {
      config.headers['x-auth-token'] = token;
    }

    if (config.data && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (typeof window === 'undefined') return Promise.reject(error);
    const status   = error.response?.status;
    const isOnAuth = AUTH_PATHS.some(p => window.location.pathname.startsWith(p));
    if (status === 401 && !isOnAuth) {
      setAccessToken(null);
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      window.location.replace('/login?expired=true');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
