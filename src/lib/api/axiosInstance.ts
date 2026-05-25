// src/lib/api/axiosInstance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ── Access Token في الذاكرة فقط — لا cookie لا localStorage ──
let accessToken: string | null = null;
let isRefreshing   = false;
let refreshQueue:  Array<(token: string) => void> = [];

// ── Init queue: طلبات جاءت قبل انتهاء refreshSession ──────────
let isInitialized      = false;
let initQueue:         Array<() => void>           = [];
let initQueueRejects:  Array<(err: Error) => void> = [];

export const setAccessToken = (t: string | null) => { accessToken = t; };
export const getAccessToken = () => accessToken;

// ✅ تقبل success flag: true = شغّل الطلبات / false = ارفضها
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

// ─── helpers لـ session_active cookie ────────────────────────
// ✅ هذه الدوال مستقلة عن js-cookie لتجنب circular dependency مع AuthContext
// ✅ session_active = مؤشر خفيف لـ middleware.ts Edge — لا بيانات حساسة
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function setSessionCookie() {
  if (typeof document === 'undefined') return; // SSR guard
  const secure   = IS_PRODUCTION ? '; Secure' : '';
  const sameSite = '; SameSite=Lax';
  // expires بعد 7 أيام — نفس عمر aoun_user
  const expires  = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `session_active=true; path=/; expires=${expires}${sameSite}${secure}`;
}

function clearSessionCookie() {
  if (typeof document === 'undefined') return; // SSR guard
  const secure   = IS_PRODUCTION ? '; Secure' : '';
  const sameSite = '; SameSite=Lax';
  document.cookie = `session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${sameSite}${secure}`;
}

// ─── Axios Instance ───────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL:         typeof window === 'undefined' ? process.env.NEXT_PUBLIC_API_URL : '',
  timeout:         15000,
  withCredentials: true, // ← مهم لإرسال httpOnly refreshToken cookie مع كل طلب
});

// ── Request Interceptor ───────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isAuthRoute = config.url?.includes('/auth/');

    // ✅ إذا التهيئة لم تنتهِ، علّق الطلب مع reject للأمان
    if (!isInitialized && !isAuthRoute) {
      return new Promise<InternalAxiosRequestConfig>((resolve, reject) => {
        initQueue.push(() => resolve(config));
        initQueueRejects.push(reject);
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
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const status      = error.response?.status;
    const isAuthRoute = originalRequest.url?.includes('/auth/');

    if (status === 401 && !isAuthRoute && !originalRequest._retry) {
      originalRequest._retry = true;

      // ── إذا refresh جارٍ بالفعل — أضف الطلب للـ queue ─────
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

        // ✅ جديد — جدّد مؤشر الجلسة بعد نجاح الـ Refresh
        setSessionCookie();

        // شغّل كل الطلبات المعلّقة بالتوكن الجديد
        refreshQueue.forEach(cb => cb(newToken));
        refreshQueue = [];

        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        // ✅ جديد — فشل الـ Refresh = لا جلسة نشطة
        setAccessToken(null);
        clearSessionCookie();
        refreshQueue = [];

        if (typeof window !== 'undefined') {
          window.location.replace('/login?expired=true');
        }
        return Promise.reject(refreshError); // ← رفع refreshError الأدق لا error القديم
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;