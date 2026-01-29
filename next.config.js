/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pages: set NEXT_PUBLIC_ASSET_PREFIX=/assets so /_next/* resolves (ASSETS root is upload root, files under assets/)
  ...(process.env.NEXT_PUBLIC_ASSET_PREFIX && {
    assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX,
  }),
};

module.exports = nextConfig;

// Optional: enable OpenNext Cloudflare bindings only when running `next dev`
if (process.env.NODE_ENV === "development") {
  try {
    const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
    initOpenNextCloudflareForDev();
  } catch (_) {
    // @opennextjs/cloudflare not installed or not needed
  }
}

