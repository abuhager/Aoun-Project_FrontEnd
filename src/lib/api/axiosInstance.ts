// src/lib/api/axiosInstance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
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

const INIT_TIMEOUT_MS = 5_000;

// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────
export const setAccessToken = (t: string | null) => {
  accessToken = t;
};

export const getAccessToken = () => accessToken;

export const resetAuthState = () => {
  accessToken        = null;
  isRefreshing       = false;
  refreshQueue       = [];
  isInitialized      = false;
  initQueue          = [];
  initQueueRejects   = [];
};

export const setInitialized = (success = true) => {
  isInitialized = true;

  if (success) {
    // ✅ حرّر الطلبات المعلّقة — لكن فقط إذا يوجد token
    // إذا نجح الـ refresh لكن بدون token (حالة غريبة) → ارفض
    initQueue.forEach((cb) => cb());
  } else {
    // ✅ FIX: عند فشل الـ init، حرّر الطابور بـ resolve (ليس reject)
    // الطلبات ستُرسَل بدون token → backend يُرجع 401 → تُعالَج بالـ response interceptor
    // هذا أفضل من AUTH_INIT_FAILED الذي يملأ الـ console بأخطاء غير مفيدة
    initQueue.forEach((cb) => cb());
  }

  initQueue        = [];
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

// ─────────────────────────────────────────────
// Axios Instance
// ─────────────────────────────────────────────

// ✅ baseURL ذكي: SSR → URL كامل | Browser → same-origin مع Next.js rewrites
const API_BASE_URL = (() => {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? "";
  }
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.startsWith("/")) {
    return envUrl;
  }
  return "";
})();

const axiosInstance = axios.create({
  baseURL:         API_BASE_URL,
  timeout:         15_000,
  withCredentials: true,
});

// ─────────────────────────────────────────────
// مسارات لا تحتاج auth check
// ─────────────────────────────────────────────
const isAuthSafeUrl = (url: string): boolean =>
  url.includes("/auth/refresh") ||
  url.includes("/auth/login")   ||
  url.includes("/auth/register") ||
  url.includes("/auth/verify")   ||
  url.includes("/auth/forgot")   ||
  url.includes("/auth/reset");

// المسارات العامة التي تعمل بدون token
const isPublicUrl = (url: string, method?: string): boolean =>
  (url.includes("/items") && method?.toLowerCase() === "get") ||
  url.includes("/hubs")   ||
  url.includes("/public");

// ─────────────────────────────────────────────
// 1. Request Interceptor
// ─────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url    = config.url ?? "";
    const method = config.method ?? "get";

    const skipInitCheck = isAuthSafeUrl(url) || isPublicUrl(url, method);

    // ✅ إذا لم يكتمل الـ init بعد → علّق الطلب في الطابور
    if (!isInitialized && !skipInitCheck) {
      return new Promise<InternalAxiosRequestConfig>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error("AUTH_INIT_TIMEOUT"));
        }, INIT_TIMEOUT_MS);

        initQueue.push(() => {
          clearTimeout(timer);

          // ✅ FIX الجوهري: إذا المستخدم غير مسجّل (لا token) والـ route محمي
          // → أوقف الطلب صامتاً بدل إرساله للـ backend ليُرجع NO_TOKEN
          if (!accessToken && !isPublicUrl(url, method)) {
            reject(new Error("NOT_AUTHENTICATED"));
            return;
          }

          // أضف الـ token وأطلق الطلب
          if (accessToken) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
          resolve(config);
        });

        initQueueRejects.push((err) => {
          clearTimeout(timer);
          reject(err);
        });
      });
    }

    // ✅ Attach token للطلبات العادية بعد اكتمال الـ init
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

    // ── NOT_AUTHENTICATED: المستخدم غير مسجّل → تجاهل صامت ──
    // هذا يمنع ملء الـ console بأخطاء عند زيارة صفحات محمية بدون تسجيل دخول
    if (error.message === "NOT_AUTHENTICATED") {
      return Promise.reject(error); // الـ component يتعامل معه بـ isLoading / !user check
    }

    // ── AUTH_INIT_TIMEOUT: أعد المحاولة مرة واحدة بعد 500ms ──
    if (error.message === "AUTH_INIT_TIMEOUT" && !originalRequest._initRetry) {
      originalRequest._initRetry = true;

      await new Promise((resolve) => setTimeout(resolve, 500));

      // ✅ FIX: لا تعيد المحاولة إذا لا يزال بدون token
      if (!accessToken && !isPublicUrl(originalRequest.url ?? "", originalRequest.method)) {
        return Promise.reject(new Error("NOT_AUTHENTICATED"));
      }

      return axiosInstance(originalRequest);
    }

    const status      = error.response?.status;
    const url         = originalRequest.url ?? "";
    const isAuthRoute = isAuthSafeUrl(url);

    // ── 401: تجديد الـ Token تلقائياً ──
    if (status === 401 && !isAuthRoute && !originalRequest._retry) {
      originalRequest._retry = true;

      // إذا يوجد refresh جارٍ → انضم للطابور
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (newToken: string) => {
              originalRequest.headers                    = originalRequest.headers ?? {};
              originalRequest.headers.Authorization     = `Bearer ${newToken}`;
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
          refreshError instanceof Error
            ? refreshError
            : new Error("REFRESH_FAILED");

        setAccessToken(null);
        processRefreshQueue(finalError, null);

        // ✅ redirect للـ login فقط إذا كان المستخدم مسجّلاً أصلاً
        // (لمنع redirect غير ضروري عند زوار غير مسجّلين)
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          const isProtected =
            currentPath.startsWith("/dashboard") ||
            currentPath.startsWith("/profile")   ||
            currentPath.startsWith("/admin")      ||
            currentPath.startsWith("/my-items")   ||
            currentPath.startsWith("/donate");

          if (isProtected) {
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