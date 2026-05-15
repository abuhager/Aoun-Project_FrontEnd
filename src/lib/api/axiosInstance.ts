// src/lib/api/axiosInstance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ── Access Token في الذاكرة فقط — لا cookie لا localStorage ──
let accessToken: string | null = null;
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

export const setAccessToken = (t: string | null) => { accessToken = t; };
export const getAccessToken = () => accessToken;

const axiosInstance = axios.create({
baseURL: typeof window === 'undefined' ? process.env.NEXT_PUBLIC_API_URL : '',
  timeout:         15000,
  withCredentials: true, // ← مهم لإرسال httpOnly cookie مع كل طلب
});

// ── Request: أرسل accessToken في Authorization header ──────────
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    if (config.data && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response: عند 401 جرب refresh قبل logout ──────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const isAuthRoute = originalRequest.url?.includes('/auth/');

    // لو 401 وهو مش طلب auth ومش جرّبنا refresh بعد
    if (status === 401 && !isAuthRoute && !originalRequest._retry) {
      originalRequest._retry = true;

      // لو في refresh جاري — ضيف الطلب في queue
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((newToken: string) => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await axios.post<{ accessToken: string }>(
'/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        const newToken = data.accessToken;
        setAccessToken(newToken);

        // أكمل الطلبات اللي كانت منتظرة
        refreshQueue.forEach(cb => cb(newToken));
        refreshQueue = [];

        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch {
        // Refresh فشل — logout
        setAccessToken(null);
        refreshQueue = [];
        if (typeof window !== 'undefined') {
          window.location.replace('/login?expired=true');
        }
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;