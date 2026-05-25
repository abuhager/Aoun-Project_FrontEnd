import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ✅ Guard — إذا المتغير غير مضبوط في بيئة Build، أوقف البناء بخطأ واضح
// أفضل من "undefined/api/:path*" الصامت
if (!API_URL) {
  throw new Error(
    "[next.config.ts] NEXT_PUBLIC_API_URL is not set.\n" +
    "Add it in Vercel → Settings → Environment Variables."
  );
}

const nextConfig: NextConfig = {
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
    ],
  },

  // ✅ Proxy: كل طلبات /api/* تروح للباك إند
  // يحل مشكلة cross-origin cookies في localhost و Production
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