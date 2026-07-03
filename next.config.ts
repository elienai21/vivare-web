import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Stays.net image hosts: tenant subdomains like vivare.stays.net,
      // CDN, plus the .com.br variant. The wildcard pattern covers
      // any current and future tenant.
      {
        protocol: 'https',
        hostname: '**.stays.net',
      },
      {
        protocol: 'https',
        hostname: '**.stays.com.br',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
      },
      {
        // Vercel Blob Storage — used by the admin CMS for uploaded
        // images (founder photo, page hero, etc). Each store gets a
        // random subdomain, so we wildcard the public host.
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // For placeholders
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },
};

export default nextConfig;
