// src/lib/api/axiosInstance.ts
// ✅ إصلاحات: A1, A2, A3, A4, A5, A6
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
let accessToken: string | null = null;
let isRefreshing = false;

type RefreshQueueItem = {
  resolve: (token: string) => void;
  reject:  (error: Error)  => void;
};

let refreshQueue:     RefreshQueueItem[]           = [];
let isInitialized                                  = false;
let initQueue:        Array<() => void>            = [];
let initQueueRejects: Array<(err: Error) => void>  = [];

// ✅ إصلاح A4 — من .env بدلاً من hardcoded
const INIT_TIMEOUT_MS =
  parseInt(process.env.NEXT_PUBLIC_AUTH_INIT_TIMEOUT ?? "5000", 10) || 5000;

// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────
export const setAccessToken = (t: string | null) => { accessToken = t; };
export const getAccessToken = () => accessToken;

export const resetAuthState = () => {
  accessToken      = null;
  isRefreshing     = false;
  refreshQueue     = [];
  isInitialized    = false;
  initQueue        = [];
  initQueueRejects = [];
  delete axiosInstance.defaults.headers.common["Authorization"];
};

// ✅ إصلاح A1 — التفريق بين نجاح/فشل الـ init بشكل صريح
export const setInitialized = (success = true) => {
  isInitialized = true;

  if (success) {
    initQueue.forEach((cb) => cb());
  } else {
    initQueueRejects.forEach((rej) => rej(new Error("NOT_AUTHENTICATED")));
  }

  initQueue        = [];
  initQueueRejects = [];
};

function processRefreshQueue(error: Error | null, token: string | null = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error || !token) reject(error ?? new Error("REFRESH_FAILED"));
    else resolve(token);
  });
  refreshQueue = [];
}

// ─────────────────────────────────────────────
// Axios Instance
// ─────────────────────────────────────────────
const API_BASE_URL = (() => {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_API_URL ?? "";
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.startsWith("/")) return envUrl;
  return "";
})();

const axiosInstance = axios.create({
  baseURL:         API_BASE_URL,
  timeout:         15_000,
  withCredentials: true,
});

// ─────────────────────────────────────────────
// Route Classifiers
// ─────────────────────────────────────────────

// ✅ إصلاح A6 — إضافة /auth/me هنا يكسر الـ Deadlock
// /auth/me يُرسَل أثناء التهيئة مع token مُمرَّر يدوياً في الـ header
// لذا لا يحتاج لانتظار الـ initQueue
const isAuthSafeUrl = (url: string): boolean =>
  url.includes("/auth/refresh")  ||
  url.includes("/auth/login")    ||
  url.includes("/auth/register") ||
  url.includes("/auth/verify")   ||
  url.includes("/auth/forgot")   ||
  url.includes("/auth/reset")    ||
  url.includes("/auth/me");      // ✅ A6: كسر الـ Deadlock

// ✅ إصلاح A2 — فحص الـ pathname بشكل دقيق
const PUBLIC_PATH_PATTERNS: RegExp[] = [
  /^\/api\/items(\/[^/]+)?\/?$/,
  /^\/api\/hubs/,
  /^\/api\/public/,
];

const isPublicUrl = (url: string, method?: string): boolean => {
  const pathname = url.split("?")[0];
  const isGet    = (method ?? "get").toLowerCase() === "get";

  return PUBLIC_PATH_PATTERNS.some((pattern) => {
    if (pattern === PUBLIC_PATH_PATTERNS[0]) return isGet && pattern.test(pathname);
    return pattern.test(pathname);
  });
};

// ─────────────────────────────────────────────
// 1. Request Interceptor
// ─────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url    = config.url    ?? "";
    const method = config.method ?? "get";

    const skipInitCheck = isAuthSafeUrl(url) || isPublicUrl(url, method);

    if (!isInitialized && !skipInitCheck) {
      return new Promise<InternalAxiosRequestConfig>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error("AUTH_INIT_TIMEOUT"));
        }, INIT_TIMEOUT_MS);

        initQueue.push(() => {
          clearTimeout(timer);
          if (!accessToken && !isPublicUrl(url, method)) {
            reject(new Error("NOT_AUTHENTICATED"));
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

    // ✅ لا نتجاوز Authorization إذا كان مُمرَّراً يدوياً (مثل /auth/me أثناء التهيئة)
    if (!config.headers.Authorization) {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      } else {
        delete config.headers.Authorization;
      }
    }

    if (config.data && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
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

    if (!originalRequest) return Promise.reject(error);

    if (error.message === "NOT_AUTHENTICATED") return Promise.reject(error);

    if (error.message === "AUTH_INIT_TIMEOUT" && !originalRequest._initRetry) {
      originalRequest._initRetry = true;
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (!accessToken && !isPublicUrl(originalRequest.url ?? "", originalRequest.method)) {
        return Promise.reject(new Error("NOT_AUTHENTICATED"));
      }
      return axiosInstance(originalRequest);
    }

    const status      = error.response?.status;
    const url         = originalRequest.url ?? "";
    const isAuthRoute = isAuthSafeUrl(url);

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
          "/api/auth/refresh",
          {},
          { withCredentials: true }
        );

        const newToken = data.accessToken;
        setAccessToken(newToken);
        processRefreshQueue(null, newToken);

        originalRequest.headers                = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        const finalError =
          refreshError instanceof Error ? refreshError : new Error("REFRESH_FAILED");

        setAccessToken(null);
        processRefreshQueue(finalError, null);

        if (typeof window !== "undefined") {
          const currentPath    = window.location.pathname;
          const isProtected    =
            currentPath.startsWith("/dashboard") ||
            currentPath.startsWith("/profile")   ||
            currentPath.startsWith("/admin")      ||
            currentPath.startsWith("/my-items")   ||
            currentPath.startsWith("/donate");
          const notOnAuthPage  =
            !currentPath.startsWith("/login") &&
            !currentPath.startsWith("/register");

          if (isProtected && notOnAuthPage) {
            window.location.replace("/login?reason=session_expired");
          }
        }

        return Promise.reject(finalError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;