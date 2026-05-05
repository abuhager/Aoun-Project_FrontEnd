// src/lib/api/axiosInstance.ts
// ================================================================
// ✅ PHASE 1 — Axios Instance مع Refresh Token Rotation
//
// التغييرات:
//   + withCredentials: true — لإرسال httpOnly cookie تلقائياً
//   + عند 401 → حاول /auth/refresh-token أولاً
//   + لو نجح الـ refresh → أعد الطلب الأصلي تلقائياً
//   + لو فشل → redirect للـ login
//
// BLAST RADIUS:
//   Direct:     كل طلب axios في الـ app يستخدم هذا
//   Cross-Repo: Backend يجب يدعم POST /api/auth/refresh-token (تم في Phase 1)
//   DB:         لا يوجد
// ================================================================
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ── Access Token في الذاكرة (ليس localStorage — آمن ضد XSS)
let accessToken: string | null = null;

export const setAccessToken  = (t: string | null) => { accessToken = t; };
export const getAccessToken  = () => accessToken;

const AUTH_PATHS = ['/login', '/register', '/verify'];

const axiosInstance = axios.create({
  baseURL:         process.env.NEXT_PUBLIC_API_URL!,
  timeout:         15000,
  withCredentials: true,           // ✅ ضروري لإرسال httpOnly cookie
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor: أضف Access Token من الذاكرة
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers['x-auth-token'] = accessToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: معالجة 401 و Refresh Token Rotation
let isRefreshing    = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject:  (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (typeof window === 'undefined') return Promise.reject(error); // SSR guard

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status          = error.response?.status;
    const isOnAuth        = AUTH_PATHS.some((p) => window.location.pathname.startsWith(p));
    const isRefreshCall   = originalRequest?.url?.includes('/auth/refresh-token');

    // ── 401 وليس على صفحة auth ولم يجرب بعد
    if (status === 401 && !isOnAuth && !originalRequest._retry && !isRefreshCall) {
      if (isRefreshing) {
        // طلبات أخرى تنتظر في الطابور
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers['x-auth-token'] = token;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ✅ Refresh Token مخزّن في httpOnly Cookie — يُرسَل تلقائياً
        const { data } = await axiosInstance.post<{ accessToken: string }>(
          '/api/auth/refresh-token'
        );
        const newToken = data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers['x-auth-token'] = newToken;
        return axiosInstance(originalRequest); // أعد الطلب الأصلي
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        window.location.href = '/login?expired=true';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
