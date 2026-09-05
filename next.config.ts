import type { NextConfig } from 'next';

const isProduction = process.env.NODE_ENV === 'production';

const isLoopbackHostname = (hostname: string) =>
  ['localhost', '127.0.0.1', '[::1]'].includes(hostname);

export const normalizeBaseUrl = (
  value: string | undefined,
  variableName: string
) => {
  if (!value?.trim()) return null;

  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error(
      `[next.config.ts] ${variableName} ليس رابطًا صالحًا`
    );
  }

  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new Error(
      `[next.config.ts] ${variableName} يجب أن يكون HTTP(S) Origin آمنًا`
    );
  }

  const isLoopback = isLoopbackHostname(url.hostname);

  if (isProduction && url.protocol !== 'https:' && !isLoopback) {
    throw new Error(
      `[next.config.ts] ${variableName} يجب أن يستخدم HTTPS في production`
    );
  }

  if (
    (url.pathname !== '/' && url.pathname !== '') ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      `[next.config.ts] ${variableName} يجب ألا يحتوي مسارًا أو query أو hash`
    );
  }

  return url.origin;
};

const publicApiUrl = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_URL,
  'NEXT_PUBLIC_API_URL'
);

const backendUrl =
  normalizeBaseUrl(process.env.BACKEND_URL, 'BACKEND_URL') ?? publicApiUrl;

if (isProduction && !publicApiUrl) {
  throw new Error(
    '[next.config.ts] NEXT_PUBLIC_API_URL مطلوب في production لاتصال Socket.io.'
  );
}

if (!backendUrl) {
  console.warn(
    '[next.config.ts] API proxy معطّل حتى تضبط BACKEND_URL أو NEXT_PUBLIC_API_URL.'
  );
}

const publicApiHostname = publicApiUrl
  ? new URL(publicApiUrl).hostname
  : null;

const isLocalTarget =
  publicApiHostname !== null && isLoopbackHostname(publicApiHostname);

// next build يضبط NODE_ENV=production حتى عند اختبار البناء محليًا.
// لذلك نضيف HSTS فقط عند البناء لدومين خارجي حقيقي.
const shouldEnableHsts = isProduction && !isLocalTarget;
const allowLocalImages = !isProduction || isLocalTarget;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // يسمح بفتح نسخة التطوير نفسها من هاتف/جهاز آخر على الشبكة المحلية.
  // هذا الخيار يخص `next dev` فقط ولا ينشئ نسخة هاتف منفصلة ولا يؤثر على Vercel.
  allowedDevOrigins: ['192.168.100.118'],

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-XSS-Protection', value: '0' },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          { key: 'Origin-Agent-Cluster', value: '?1' },
          ...(shouldEnableHsts
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },
      {
        source: '/reset-password/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive',
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      ...(allowLocalImages
        ? [
            {
              protocol: 'http' as const,
              hostname: 'localhost',
              port: '5000',
            },
            {
              protocol: 'http' as const,
              hostname: '127.0.0.1',
              port: '5000',
            },
            {
              protocol: 'https' as const,
              hostname: 'placehold.co',
            },
          ]
        : []),
    ],
  },

  async rewrites() {
    if (!backendUrl) return [];

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
