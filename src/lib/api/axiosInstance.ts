// src/lib/api/axiosInstance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// ── Access Token في الذاكرة فقط ───────────────────────────────
let accessToken: string | null = null;
let isRefreshing = false;

type RefreshQueueItem = {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
};

let refreshQueue: RefreshQueueItem[] = [];

// ── Init queue: طلبات جاءت قبل انتهاء refreshSession ─────────
let isInitialized = false;
let initQueue: Array<() => void> = [];
let initQueueRejects: Array<(err: Error) => void> = [];

export const setAccessToken = (t: string | null) => {
  accessToken = t;
};

export const getAccessToken = () => accessToken;

export const setInitialized = (success = true) => {
  isInitialized = true;

  if (success) {
    initQueue.forEach((cb) => cb());
  } else {
    const err = new Error("AUTH_INIT_FAILED");
    initQueueRejects.forEach((rej) => rej(err));
  }

  initQueue = [];
  initQueueRejects = [];
};

// ─── helpers لـ session_active cookie ─────────────────────────
const IS_PRODUCTION = process.env.NODE_ENV === "production";

function setSessionCookie() {
  if (typeof document === "undefined") return;

  const secure = IS_PRODUCTION ? "; Secure" : "";
  const sameSite = "; SameSite=Lax";
  const expires = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toUTCString();

  document.cookie = `session_active=true; path=/; expires=${expires}${sameSite}${secure}`;
}

function clearSessionCookie() {
  if (typeof document === "undefined") return;

  const secure = IS_PRODUCTION ? "; Secure" : "";
  const sameSite = "; SameSite=Lax";

  document.cookie = `session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${sameSite}${secure}`;
}

function processRefreshQueue(error: Error | null, token: string | null = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error ?? new Error("REFRESH_FAILED"));
    } else {
      resolve(token);
    }
  });

  refreshQueue = [];
}

const API_BASE_URL =
  typeof window === "undefined" ? process.env.NEXT_PUBLIC_API_URL : "";

// ─── Axios Instance ───────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

// ── Request Interceptor ───────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isAuthRoute = config.url?.includes("/auth/");

    if (!isInitialized && !isAuthRoute) {
      return new Promise<InternalAxiosRequestConfig>((resolve, reject) => {
        initQueue.push(() => resolve(config));
        initQueueRejects.push((err) => reject(err));
      });
    }

    config.headers = config.headers ?? {};

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (config.data && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const status = error.response?.status;
    const isAuthRoute = originalRequest?.url?.includes("/auth/");

    if (!originalRequest) {
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
            reject: (queueError: Error) => {
              reject(queueError);
            },
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await axiosInstance.post<{ accessToken: string }>(
          "/api/auth/refresh",
          {},
          {
            withCredentials: true,
          }
        );

        const newToken = data.accessToken;
        setAccessToken(newToken);
        setSessionCookie();

        processRefreshQueue(null, newToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        const finalError =
          refreshError instanceof Error
            ? refreshError
            : new Error("REFRESH_FAILED");

        setAccessToken(null);
        clearSessionCookie();
        processRefreshQueue(finalError, null);

        if (typeof window !== "undefined") {
          window.location.replace("/login?expired=true");
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