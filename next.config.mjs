/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
  },
  // disable prerender for Live to avoid infinite loop
  async redirects() {
    return [];
  },
};

export default nextConfig;
