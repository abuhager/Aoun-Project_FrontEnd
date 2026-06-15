// next.config.ts — Flow 1 Fixed
// ✅ ARCH-WARN-02: localhost/127.0.0.1 في remotePatterns مقيّدان بـ !isProduction فقط
// ✅ باقي المنطق محفوظ كما هو

import type { NextConfig } from 'next';

const API_URL      = process.env.NEXT_PUBLIC_API_URL;
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
        protocol: 'https',
        hostname:  '*.googleusercontent.com',
      },
      // ✅ ARCH-WARN-02: localhost/127.0.0.1 في dev فقط
      // في production قبولهما يعني SSRF محتمل عبر Next.js Image Optimization
      ...(!isProduction
        ? [
            { protocol: 'http' as const, hostname: 'localhost',  port: '5000' },
            { protocol: 'http' as const, hostname: '127.0.0.1', port: '5000' },
          ]
        : []
      ),
      // placehold.co في dev/staging فقط — لا تسرب لـ production
      ...(!isProduction
        ? [{ protocol: 'https' as const, hostname: 'placehold.co' }]
        : []
      ),
    ],
  },

  // ── API Proxy ────────────────────────────────────────────────
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