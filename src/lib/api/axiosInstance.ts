// src/lib/api/axiosInstance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ── Access Token في الذاكرة فقط — لا cookie لا localStorage ──
let accessToken: string | null = null;
let isRefreshing   = false;
let refreshQueue:  Array<(token: string) => void> = [];

// ── Init queue: طلبات جاءت قبل انتهاء refreshSession ──────────
let isInitialized      = false;
let initQueue:         Array<() => void>           = [];
let initQueueRejects:  Array<(err: Error) => void> = []; // ✅ F2 Fix

export const setAccessToken = (t: string | null) => { accessToken = t; };
export const getAccessToken = () => accessToken;

// ✅ F2 Fix — تقبل success flag: true = شغّل الطلبات / false = ارفضها
export const setInitialized = (success = true) => {
  isInitialized = true;

  if (success) {
    initQueue.forEach(cb => cb());
  } else {
    // ❌ التهيئة فشلت — ارفض كل الطلبات المعلّقة بدل تجميدها
    const err = new Error('AUTH_INIT_FAILED');
    initQueueRejects.forEach(rej => rej(err));
  }

  initQueue        = [];
  initQueueRejects = [];
};

const axiosInstance = axios.create({
  baseURL:         typeof window === 'undefined' ? process.env.NEXT_PUBLIC_API_URL : '',
  timeout:         15000,
  withCredentials: true, // ← مهم لإرسال httpOnly cookie مع كل طلب
});

// ── Request Interceptor ───────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isAuthRoute = config.url?.includes('/auth/');

    // ✅ F2 Fix — إذا التهيئة لم تنتهِ، علّق الطلب مع reject للأمان
    if (!isInitialized && !isAuthRoute) {
      return new Promise<InternalAxiosRequestConfig>((resolve, reject) => {
        initQueue.push(() => resolve(config));
        initQueueRejects.push(reject); // ← جديد
      });
    }

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

// ── Response Interceptor ──────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status          = error.response?.status;
    const isAuthRoute     = originalRequest.url?.includes('/auth/');

    if (status === 401 && !isAuthRoute && !originalRequest._retry) {
      originalRequest._retry = true;

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

        refreshQueue.forEach(cb => cb(newToken));
        refreshQueue = [];

        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch {
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