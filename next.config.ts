import type { NextConfig } from "next";


const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "[next.config.ts] NEXT_PUBLIC_API_URL is not set.\n" +
    "Add it in Vercel → Settings → Environment Variables."
  );
}


const nextConfig: NextConfig = {
  // next.config.ts — أضف هذا القسم
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options',           value: 'DENY' },
        { key: 'X-Content-Type-Options',     value: 'nosniff' },
        { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'X-DNS-Prefetch-Control',     value: 'on' },
        { key: 'Strict-Transport-Security',  value: 'max-age=63072000; includeSubDomains; preload' },
      ],
    },
  ];
},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      // ─── Placeholder (development / seed data فقط) ───────────
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source:      "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};



export default nextConfig;