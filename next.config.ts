// next.config.ts — النسخة المصحّحة (Flow-1 Audit)
// ✅ إصلاح BUG-04: HSTS مقيّد بـ production فقط — لا يكسر localhost في dev
// ✅ تنظيف: حذف التعليق المتروك داخل object literal

import type { NextConfig } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    '[next.config.ts] NEXT_PUBLIC_API_URL غير مضبوط.\n' +
    'أضفه في: Vercel → Settings → Environment Variables'
  );
}

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {

  // ── Security Headers ────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',       value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },

          // ✅ BUG-04: HSTS في production فقط
          // في dev، هذا الهيدر يُسبب مشاكل مع http://localhost
          // المتصفح يحفظه ويرفض HTTP لمدة سنتين (max-age=63072000)
          ...(isProduction
            ? [{
                key:   'Strict-Transport-Security',
                value: 'max-age=63072000; includeSubDomains; preload',
              }]
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
      // ✅ localhost مسموح به في dev فقط — في production هذه الأنماط تُجاهَل
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
      // ── Placeholder — للـ development والـ seed data فقط ──
      {
        protocol: 'https',
        hostname:  'placehold.co',
      },
    ],
  },

  // ── API Proxy ────────────────────────────────────────────────
  async rewrites() {
    return [
      {
        source:      '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
