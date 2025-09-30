/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"],
    unoptimized: true,
  },
  // Disable experimental features that might cause issues
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
