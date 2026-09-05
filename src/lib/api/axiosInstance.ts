import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { isProtectedPath, isAuthOnlyPath, isAuthSafeUrl } from "@/config/routes";
import { setSessionCookie, clearSessionCookie } from "@/lib/utils/cookieUtils";
import type { RefreshResponse } from "@/types/auth.types";

let accessToken: string | null = null;
let isRefreshing = false;
type AccessTokenListener = (token: string | null) => void;
const accessTokenListeners = new Set<AccessTokenListener>();

type RefreshQueueItem = {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
};

let refreshQueue: RefreshQueueItem[] = [];
let isInitialized = false;
type InitQueueItem = {
  onInitialized: () => void;
  reject: (error: Error) => void;
};
const initQueue = new Set<InitQueueItem>();

const INIT_TIMEOUT_MS =
  parseInt(process.env.NEXT_PUBLIC_AUTH_INIT_TIMEOUT ?? "5000", 10) || 5000;

export const setAccessToken = (t: string | null) => {
  if (accessToken === t) return;
  accessToken = t;
  accessTokenListeners.forEach((listener) => listener(t));
};

export const subscribeAccessToken = (listener: AccessTokenListener) => {
  accessTokenListeners.add(listener);
  listener(accessToken);
  return () => accessTokenListeners.delete(listener);
};

export const resetAuthState = () => {
  setAccessToken(null);
  isRefreshing = false;

  const authError = new Error("NOT_AUTHENTICATED");
  refreshQueue.forEach(({ reject }) => reject(authError));
  refreshQueue = [];

  [...initQueue].forEach((item) => item.reject(authError));
  initQueue.clear();

  isInitialized = false;
  delete axiosInstance.defaults.headers.common["Authorization"];
};

export const setInitialized = (success = true) => {
  isInitialized = true;
  const authError = new Error("NOT_AUTHENTICATED");
  [...initQueue].forEach((item) => {
    if (success) item.onInitialized();
    else item.reject(authError);
  });
  initQueue.clear();
};

function processRefreshQueue(error: Error | null, token: string | null = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error || !token) reject(error ?? new Error("REFRESH_FAILED"));
    else resolve(token);
  });
  refreshQueue = [];
}

const rawServerApiUrl = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";
const API_BASE_URL = typeof window !== "undefined" ? "" : rawServerApiUrl.replace(/\/$/, "");

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT ?? "15000", 10),
  withCredentials: true,
});

const isAuthMeUrl = (url: string): boolean => url.includes("/auth/me");

const PUBLIC_PATH_PATTERNS: Array<{ pattern: RegExp; getOnly: boolean }> = [
  { pattern: /^\/api\/items(\/(?!me|complete|waitlist)[^/]+)?\/?$/, getOnly: true },
  // القائمة العامة فقط؛ مسارات /admin وعمليات الكتابة يجب أن تنتظر تهيئة الهوية.
  { pattern: /^\/api\/hubs\/?$/, getOnly: true },
  { pattern: /^\/api\/donation-requests\/?$/, getOnly: true },
  { pattern: /^\/api\/donation-requests\/[a-f\d]{24}\/?$/i, getOnly: true },
  { pattern: /^\/api\/public/, getOnly: false },
  { pattern: /^\/api\/settings\/public/, getOnly: true },
];

const isPublicUrl = (url: string, method?: string): boolean => {
  const pathname = url.split("?")[0];
  const isGet = (method ?? "get").toLowerCase() === "get";
  return PUBLIC_PATH_PATTERNS.some(({ pattern, getOnly }) => {
    if (getOnly && !isGet) return false;
    return pattern.test(pathname);
  });
};

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url = config.url ?? "";
    const method = config.method ?? "get";

    // ✅ [FIX-WAITLIST-BTN]: إذا في accessToken موجود → لا نتخطى init check
    // حتى لو المسار "public" — المستخدم المسجل يحتاج req.user يكون صحيح
    // (isInWaitlist, isOwner, إلخ تعتمد على Authorization header)
    const skipInitCheck =
      !accessToken && (isAuthSafeUrl(url) || isPublicUrl(url, method));

    if (!isInitialized && !skipInitCheck) {
      return new Promise<InternalAxiosRequestConfig>((resolve, reject) => {
        let settled = false;
        let timer: ReturnType<typeof setTimeout> | null = null;

        const cleanup = () => {
          if (timer) clearTimeout(timer);
          config.signal?.removeEventListener?.("abort", onAbort);
          initQueue.delete(item);
        };

        const rejectOnce = (error: Error) => {
          if (settled) return;
          settled = true;
          cleanup();
          reject(error);
        };

        const onAbort = () => rejectOnce(new axios.CanceledError("REQUEST_CANCELED"));

        const item: InitQueueItem = {
          onInitialized: () => {
            if (settled) return;
            if (!accessToken && !isPublicUrl(url, method)) {
              rejectOnce(new Error("NOT_AUTHENTICATED"));
              return;
            }
            if (accessToken) {
              config.headers = config.headers ?? {};
              config.headers.Authorization = `Bearer ${accessToken}`;
            }
            settled = true;
            cleanup();
            resolve(config);
          },
          reject: rejectOnce,
        };

        timer = setTimeout(
          () => rejectOnce(new Error("AUTH_INIT_TIMEOUT")),
          INIT_TIMEOUT_MS
        );
        initQueue.add(item);

        if (config.signal?.aborted) onAbort();
        else config.signal?.addEventListener?.("abort", onAbort, { once: true });
      });
    }

    config.headers = config.headers ?? {};

    if (!config.headers.Authorization) {
      if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
      else delete config.headers.Authorization;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete (config.headers as Record<string, unknown>)["content-type"];
    } else if (config.data) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

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
      if (!accessToken) return Promise.reject(new Error("NOT_AUTHENTICATED"));
      return axiosInstance(originalRequest);
    }

    const status = error.response?.status;
    const url = originalRequest.url ?? "";
    const isAuthRoute = isAuthSafeUrl(url) || isAuthMeUrl(url);

    const responseData = error.response?.data as
      | { code?: string; msg?: string }
      | undefined;
    const disabledAccountCodes = new Set([
      "ACCOUNT_BANNED",
      "ACCOUNT_FROZEN",
      "ACCOUNT_DISABLED",
    ]);

    if (
      status === 403 &&
      responseData?.code &&
      disabledAccountCodes.has(responseData.code) &&
      !isAuthRoute
    ) {
      resetAuthState();
      clearSessionCookie();
      if (typeof window !== "undefined" && isProtectedPath(window.location.pathname)) {
        window.location.replace("/login?reason=account_unavailable");
      }
      return Promise.reject(error);
    }

    if (status === 401 && !isAuthRoute && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (newToken: string) => {
              originalRequest.headers = originalRequest.headers ?? {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(axiosInstance(originalRequest));
            },
            reject: (queueError: Error) => reject(queueError),
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await axiosInstance.post<RefreshResponse>(
          "/api/auth/refresh",
          {},
          { withCredentials: true }
        );

        const newToken = data.accessToken;
        setAccessToken(newToken);
        setSessionCookie();

        isRefreshing = false;
        processRefreshQueue(null, newToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        const finalError =
          refreshError instanceof Error ? refreshError : new Error("REFRESH_FAILED");

        setAccessToken(null);
        clearSessionCookie();

        isRefreshing = false;
        processRefreshQueue(finalError, null);

        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          const isProtected = isProtectedPath(currentPath);
          const notOnAuthPage = !isAuthOnlyPath(currentPath);
          if (isProtected && notOnAuthPage) {
            window.location.replace("/login?reason=session_expired");
          }
        }

        return Promise.reject(finalError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
