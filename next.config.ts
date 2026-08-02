// next.config.ts — ARCH-02 FIXED
// ✅ ARCH-02: إضافة redirects() — HTTP → HTTPS في production
//             بدون هذا: HSTS يعمل فقط بعد الزيارة الأولى، الطلب الأول عبر http يصل غير مشفَّر

import type { NextConfig } from 'next';

const API_URL      = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
const isProduction = process.env.NODE_ENV === 'production';

if (!API_URL) {
  if (isProduction) {
    throw new Error(
      '[next.config.ts] NEXT_PUBLIC_API_URL غير مضبوط في production.\n' +
      'أضفه في: Vercel → Settings → Environment Variables'
    );
  } else {
    console.warn(
      '[next.config.ts] ⚠️ NEXT_PUBLIC_API_URL غير مضبوط.\n' +
      'الـ API proxy لن يعمل حتى تُضبطه في .env.local'
    );
  }
}

const cleanDomain = API_URL ? API_URL.replace(/^https?:\/\//, '') : '';

const nextConfig: NextConfig = {

  // ── Security Headers ──────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',        value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key:   'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "img-src 'self' https://res.cloudinary.com data:",
              `script-src 'self' 'unsafe-inline' ${!isProduction ? "'unsafe-eval'" : ""} https://www.gstatic.com https://www.recaptcha.net https://recaptchaenterprise.googleapis.com https://www.google.com`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              `connect-src 'self' ${API_URL || ''} ${cleanDomain ? `ws://${cleanDomain} wss://${cleanDomain}` : ''} https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://recaptchaenterprise.googleapis.com https://www.recaptcha.net https://www.google.com https://*.firebase.com https://*.firebaseio.com`,
              "frame-ancestors 'none'",
              "frame-src https://www.recaptcha.net https://recaptchaenterprise.googleapis.com https://www.google.com",
            ].join('; ').replace(/\s+/g, ' ').trim(),
          },
          ...(isProduction
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
            : []
          ),
        ],
      },
    ];
  },

  // ✅ ARCH-02: redirect HTTP → HTTPS في production فقط
  // السبب: HSTS وحده لا يكفي — يعمل فقط بعد الزيارة الأولى عبر HTTPS
  // المستخدم الذي يكتب http:// يصل للموقع غير مشفَّر في الزيارة الأولى
  // هذا الـ redirect يضمن التشفير من أول طلب
  async redirects() {
    if (!isProduction) return []; // في dev: لا redirect حتى لا نكسر localhost
    return [
      {
        source:      '/:path*',
        has:         [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        destination: 'https://:host/:path*', // :host يحافظ على الدومين الأصلي
        permanent:   true,                   // 301 — يُخزَّن في cache المتصفح
      },
    ];
  },

  // ── Images ────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      ...(!isProduction
        ? [
            { protocol: 'http' as const, hostname: 'localhost',  port: '5000' },
            { protocol: 'http' as const, hostname: '127.0.0.1', port: '5000' },
          ]
        : []
      ),
      ...(!isProduction
        ? [{ protocol: 'https' as const, hostname: 'placehold.co' }]
        : []
      ),
    ],
  },

  // ── API Proxy ──────────────────────────────────────────────────
  async rewrites() {
    if (!API_URL) return [];
    return [
      {
        source:      '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;