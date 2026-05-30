// src/lib/api/axiosInstance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

let accessToken: string | null = null;
let isRefreshing = false;

type RefreshQueueItem = {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
};

let refreshQueue: RefreshQueueItem[] = [];

let isInitialized = false;
let initQueue: Array<() => void> = [];
let initQueueRejects: Array<(err: Error) => void> = [];

export const setAccessToken = (t: string | null) => {
  accessToken = t;
};

export const getAccessToken = () => accessToken;

export const resetAuthState = () => {
  accessToken = null;
  isRefreshing = false;
  refreshQueue = [];
  isInitialized = false;
  initQueue = [];
  initQueueRejects = [];
};

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

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url = config.url ?? "";
    const isRefreshRoute = url.includes("/auth/refresh");
    const isLoginRoute = url.includes("/auth/login");
    const isInitSafeRoute = isRefreshRoute || isLoginRoute;

    if (!isInitialized && !isInitSafeRoute) {
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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = originalRequest.url ?? "";
    const isAuthRoute = url.includes("/auth/");

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
        const { data } = await axiosInstance.post<{ accessToken: string }>(
          "/api/auth/refresh",
          {},
          { withCredentials: true }
        );

        const newToken = data.accessToken;
        setAccessToken(newToken);
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