/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;

// Optional: enable OpenNext Cloudflare bindings when running `next dev`
try {
  const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
  initOpenNextCloudflareForDev();
} catch (_) {
  // @opennextjs/cloudflare not installed or not needed
}

