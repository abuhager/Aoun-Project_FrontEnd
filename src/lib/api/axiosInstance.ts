// src/lib/api/axiosInstance.ts
// ✅ BUG-AX-01: isRefreshing يُعاد ضبطه قبل processRefreshQueue — حذف finally
// ✅ BUG-AX-02: resetAuthState يرفض الـ Promises المعلّقة قبل تفريغ الـ queues
// ✅ BUG-AX-03: PUBLIC_PATH_PATTERNS تحمل getOnly صراحةً — لا اعتماد على index
// ✅ BUG-AX-04: clearSessionCookie تُستدعى عند فشل الـ refresh لكسر redirect loop
// ✅ HC-01:     timeout من env
// ✅ DUP-01: حذف isAuthSafeUrl المكررة والاعتماد على الـ Import

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { isProtectedPath, isAuthOnlyPath, isAuthSafeUrl } from '@/config/routes'; // ✅ تم دمج الاستيرادات
import { setSessionCookie, clearSessionCookie }           from '@/lib/utils/cookieUtils';

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
let accessToken: string | null = null;
let isRefreshing                = false;

type RefreshQueueItem = {
  resolve: (token: string) => void;
  reject:  (error: Error)  => void;
};

let refreshQueue:     RefreshQueueItem[]          = [];
let isInitialized                                 = false;
let initQueue:        Array<() => void>           = [];
let initQueueRejects: Array<(err: Error) => void> = [];

const INIT_TIMEOUT_MS =
  parseInt(process.env.NEXT_PUBLIC_AUTH_INIT_TIMEOUT ?? '5000', 10) || 5000;

// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────
export const setAccessToken = (t: string | null) => { accessToken = t; };
export const getAccessToken = () => accessToken;

export const resetAuthState = () => {
  accessToken  = null;
  isRefreshing = false;

  // ✅ BUG-AX-02: أرفض كل الـ Promises المعلّقة قبل تفريغ الـ queues
  const authError = new Error('NOT_AUTHENTICATED');

  refreshQueue.forEach(({ reject }) => reject(authError));
  refreshQueue = [];

  initQueueRejects.forEach((rej) => rej(authError));
  initQueue        = [];
  initQueueRejects = [];

  isInitialized = false;
  delete axiosInstance.defaults.headers.common['Authorization'];
};

export const setInitialized = (success = true) => {
  isInitialized = true;
  if (success) {
    initQueue.forEach((cb) => cb());
  } else {
    initQueueRejects.forEach((rej) => rej(new Error('NOT_AUTHENTICATED')));
  }
  initQueue        = [];
  initQueueRejects = [];
};

function processRefreshQueue(error: Error | null, token: string | null = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error || !token) reject(error ?? new Error('REFRESH_FAILED'));
    else resolve(token);
  });
  refreshQueue = [];
}

// ─────────────────────────────────────────────
// Axios Instance
// ─────────────────────────────────────────────
const API_BASE_URL = (() => {
  // في المتصفح دائماً استخدم relative path → يمر عبر Next.js Rewrites
  if (typeof window !== 'undefined') return '';
  // في Server-Side استخدم الـ URL الكامل
  return process.env.NEXT_PUBLIC_API_URL ?? '';
})();

const axiosInstance = axios.create({
  baseURL:         API_BASE_URL,
  timeout:         parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT ?? '15000', 10),
  withCredentials: true,
});

// ─────────────────────────────────────────────
// Route Classifiers
// ─────────────────────────────────────────────
// ✅ تم حذف isAuthSafeUrl المكررة من هنا

const isAuthMeUrl = (url: string): boolean => url.includes('/auth/me');

const PUBLIC_PATH_PATTERNS: Array<{ pattern: RegExp; getOnly: boolean }> = [
  { pattern: /^\/api\/items(\/(?!me|complete|waitlist)[^/]+)?\/?$/, getOnly: true  },
  { pattern: /^\/api\/hubs/,                                         getOnly: false },
  { pattern: /^\/api\/public/,                                       getOnly: false },
  { pattern: /^\/api\/settings\/public/,                             getOnly: true  },
  { pattern: /^\/api\/leaderboard(?!\/me)/,                          getOnly: true  },
];

const isPublicUrl = (url: string, method?: string): boolean => {
  const pathname = url.split('?')[0];
  const isGet    = (method ?? 'get').toLowerCase() === 'get';
  return PUBLIC_PATH_PATTERNS.some(({ pattern, getOnly }) => {
    if (getOnly && !isGet) return false;
    return pattern.test(pathname);
  });
};

// ─────────────────────────────────────────────
// 1. Request Interceptor
// ─────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url    = config.url    ?? '';
    const method = config.method ?? 'get';

    const skipInitCheck = isAuthSafeUrl(url) || isPublicUrl(url, method);

    if (!isInitialized && !skipInitCheck) {
      return new Promise<InternalAxiosRequestConfig>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('AUTH_INIT_TIMEOUT'));
        }, INIT_TIMEOUT_MS);

        initQueue.push(() => {
          clearTimeout(timer);
          if (!accessToken && !isPublicUrl(url, method)) {
            reject(new Error('NOT_AUTHENTICATED'));
            return;
          }
          if (accessToken) {
            config.headers                = config.headers ?? {};
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
          resolve(config);
        });

        initQueueRejects.push((err: Error) => {
          clearTimeout(timer);
          reject(err);
        });
      });
    }

    config.headers = config.headers ?? {};

    if (!config.headers.Authorization) {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      } else {
        delete config.headers.Authorization;
      }
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      delete (config.headers as Record<string, unknown>)['content-type'];
    } else if (config.data) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────
// 2. Response Interceptor
// ─────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean; _initRetry?: boolean })
      | undefined;

    if (!originalRequest)                       return Promise.reject(error);
    if (error.message === 'NOT_AUTHENTICATED')  return Promise.reject(error);

    if (error.message === 'AUTH_INIT_TIMEOUT' && !originalRequest._initRetry) {
      originalRequest._initRetry = true;
      if (!accessToken) return Promise.reject(new Error('NOT_AUTHENTICATED'));
      return axiosInstance(originalRequest);
    }

    const status      = error.response?.status;
    const url         = originalRequest.url ?? '';
    const isAuthRoute = isAuthSafeUrl(url) || isAuthMeUrl(url);

    if (status === 401 && !isAuthRoute && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (newToken: string) => {
              originalRequest.headers                = originalRequest.headers ?? {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(axiosInstance(originalRequest));
            },
            reject: (queueError: Error) => reject(queueError),
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await axiosInstance.post<{ accessToken: string }>(
          '/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        const newToken = data.accessToken;
        setAccessToken(newToken);
        setSessionCookie();

        isRefreshing = false;
        processRefreshQueue(null, newToken);

        originalRequest.headers                = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        const finalError =
          refreshError instanceof Error ? refreshError : new Error('REFRESH_FAILED');

        setAccessToken(null);
        clearSessionCookie();

        isRefreshing = false;
        processRefreshQueue(finalError, null);

        if (typeof window !== 'undefined') {
          const currentPath   = window.location.pathname;
          const isProtected   = isProtectedPath(currentPath);
          const notOnAuthPage = !isAuthOnlyPath(currentPath);
          if (isProtected && notOnAuthPage) {
            window.location.replace('/login?reason=session_expired');
          }
        }

        return Promise.reject(finalError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;