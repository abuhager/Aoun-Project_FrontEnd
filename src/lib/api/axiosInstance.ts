// src/lib/api/axiosInstance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ── Access Token في الذاكرة (آمن ضد XSS)
let accessToken: string | null = null;

export const setAccessToken = (t: string | null) => { accessToken = t; };
export const getAccessToken = () => accessToken;

// ✅ عند reload الصفحة: استرجع الـ token من cookie للذاكرة تلقائياً
if (typeof window !== 'undefined') {
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  if (match?.[1]) accessToken = decodeURIComponent(match[1]);
}

const AUTH_PATHS = ['/login', '/register', '/verify'];

const axiosInstance = axios.create({
  baseURL:         process.env.NEXT_PUBLIC_API_URL,
  timeout:         15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers['x-auth-token'] = accessToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: 401 → redirect للـ login
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (typeof window === 'undefined') return Promise.reject(error);

    const status   = error.response?.status;
    const isOnAuth = AUTH_PATHS.some(p => window.location.pathname.startsWith(p));

    if (status === 401 && !isOnAuth) {
      setAccessToken(null);
      // امسح الـ cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.replace('/login?expired=true');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
