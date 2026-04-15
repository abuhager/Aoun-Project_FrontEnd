// src/lib/api/axiosInstance.ts
import axios from 'axios';

const AUTH_PATHS = ['/login', '/register', '/verify'];

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  timeout: 15000, // ✅ timeout يمنع الطلبات المعلقة إلى الأبد
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request: إضافة التوكن تلقائياً ───
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window === 'undefined') return config; // SSR guard

    const token = localStorage.getItem('token');
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

    // ✅ 401 بس إذا مش على صفحة auth (لتجنب الـ redirect loop)
    if (status === 401 && !isOnAuth) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?expired=true';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;