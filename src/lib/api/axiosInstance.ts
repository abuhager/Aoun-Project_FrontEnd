// src/lib/api/axiosInstance.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const AUTH_PATHS = ['/login', '/register', '/verify'];

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request: إضافة التوكن تلقائياً من Cookie ───
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window === 'undefined') return config; // SSR guard

    // ✅ Token من Cookie بدل localStorage
    const token = Cookies.get('token');
    if (token) config.headers['x-auth-token'] = token;

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response: معالجة الأخطاء المركزية ───
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === 'undefined') return Promise.reject(error); // SSR guard

    const status   = error.response?.status;
    const isOnAuth = AUTH_PATHS.some((p) => window.location.pathname.startsWith(p));

    // ✅ 401 → مسح الـ Cookie + redirect
    if (status === 401 && !isOnAuth) {
      Cookies.remove('token');
      localStorage.removeItem('user');
      window.location.href = '/login?expired=true';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;