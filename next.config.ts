import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🟢 إضافة تصريح للصور الخارجية
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // ضفتلك هاد كمان عشان لما نربط Cloudinary ما يضرب إيرور
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ],
  },
};

export default nextConfig;