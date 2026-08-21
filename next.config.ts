import type { NextConfig } from 'next';

export const normalizeBaseUrl = (value: string | undefined, variableName: string) => {
  if (!value?.trim()) return null;

  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error(`[next.config.ts] ${variableName} ليس رابطاً صالحاً`);
  }

  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error(`[next.config.ts] ${variableName} يجب أن يكون HTTP(S) Origin آمناً`);
  }
  if ((url.pathname !== '/' && url.pathname !== '') || url.search || url.hash) {
    throw new Error(`[next.config.ts] ${variableName} يجب ألا يحتوي مساراً أو query أو hash`);
  }

  return url.origin;
};

const isProduction = process.env.NODE_ENV === 'production';
const publicApiUrl = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_URL,
  'NEXT_PUBLIC_API_URL'
);
const backendUrl = normalizeBaseUrl(process.env.BACKEND_URL, 'BACKEND_URL') ?? publicApiUrl;

if (isProduction && !publicApiUrl) {
  throw new Error(
    '[next.config.ts] NEXT_PUBLIC_API_URL مطلوب في production لاتصال Socket.io.'
  );
}

if (!backendUrl) {
  console.warn('[next.config.ts] API proxy معطّل حتى تضبط BACKEND_URL أو NEXT_PUBLIC_API_URL.');
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          ...(isProduction
            ? [{
                key: 'Strict-Transport-Security',
                value: 'max-age=63072000; includeSubDomains; preload',
              }]
            : []),
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      ...(!isProduction
        ? [
            { protocol: 'http' as const, hostname: 'localhost', port: '5000' },
            { protocol: 'http' as const, hostname: '127.0.0.1', port: '5000' },
            { protocol: 'https' as const, hostname: 'placehold.co' },
          ]
        : []),
    ],
  },

  async rewrites() {
    if (!backendUrl) return [];
    return [{
      source: '/api/:path*',
      destination: `${backendUrl}/api/:path*`,
    }];
  },
};

export default nextConfig;
