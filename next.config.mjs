/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // IMPORTANT: do NOT use `output: 'export'` — we need dynamic /live
  // output: 'standalone' is fine on Vercel (or just omit `output`)
};

module.exports = nextConfig;
