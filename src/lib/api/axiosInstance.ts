// src/lib/api/axiosInstance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

let accessToken: string | null = null;
export const setAccessToken = (t: string | null) => { accessToken = t; };
export const getAccessToken = () => accessToken;

// استرجع الـ token من cookie عند reload الصفحة
if (typeof window !== 'undefined') {
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  if (match?.[1]) accessToken = decodeURIComponent(match[1]);
}

const AUTH_PATHS = ['/login', '/register', '/verify'];

const axiosInstance = axios.create({
  baseURL:         process.env.NEXT_PUBLIC_API_URL,
  timeout:         15000,
  withCredentials: true,
  // ✅ لا تضع Content-Type هنا أبداً — axios يضيفه لـ JSON تلقائياً
  // والمتصفح يضيفه لـ FormData مع boundary الصحيح تلقائياً
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers['x-auth-token'] = accessToken;
    }
    // إذا الـ data ليس FormData → أضف JSON header فقط
    if (config.data && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (typeof window === 'undefined') return Promise.reject(error);
    const status   = error.response?.status;
    const isOnAuth = AUTH_PATHS.some(p => window.location.pathname.startsWith(p));
    if (status === 401 && !isOnAuth) {
      setAccessToken(null);
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.replace('/login?expired=true');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
