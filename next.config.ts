// next.config.ts — مُصحَّح (F-01 Audit)
// ✅ F01-WARN-3: throw → console.warn في dev/CI حتى لا يكسر `next build`
// ✅ F01-INFO-1: placehold.co مقيّد بـ non-production فقط
// ✅ باقي المنطق محفوظ كما هو بدون تغيير

import type { NextConfig } from 'next';

const API_URL       = process.env.NEXT_PUBLIC_API_URL;
const isProduction  = process.env.NODE_ENV === 'production';

// ✅ F01-WARN-3: throw فقط في production — في dev/CI نُحذِّر ونكمل
// السبب: `next build` يُنفَّذ في CI قبل حقن env أحياناً
// throw هنا يكسر pipeline كاملاً حتى لو الكود سليم
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

const nextConfig: NextConfig = {

  // ── Security Headers ────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',        value: 'DENY' },
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control',  value: 'on' },

          // HSTS في production فقط — في dev يُسبب مشاكل مع http://localhost
          ...(isProduction
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
            : []
          ),
        ],
      },
    ];
  },

  // ── Images ──────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname:  'res.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname:  'localhost',
        port:      '5000',
      },
      {
        protocol: 'http',
        hostname:  '127.0.0.1',
        port:      '5000',
      },
      {
        protocol: 'https',
        hostname:  '*.googleusercontent.com',
      },
      // ✅ F01-INFO-1: placehold.co في non-production فقط
      // في production أي رابط placehold.co يعني seed data تسرّب للـ live
      ...(isProduction
        ? []
        : [{ protocol: 'https' as const, hostname: 'placehold.co' }]
      ),
    ],
  },

  // ── API Proxy ────────────────────────────────────────────────
  async rewrites() {
    // إذا API_URL غير موجود في dev، أعد array فارغ بدلاً من الكسر
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