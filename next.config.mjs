// Revalidated rather than immutable: photographs and share cards keep their
// filenames when re-edited, so a year-long immutable cache would pin stale files.
const staticAssetCache = "public, max-age=86400, stale-while-revalidate=604800";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Serve AVIF/WebP to browsers that accept them. The committed JPEGs stay
    // the source of truth, so no photograph is re-encoded or rewritten.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/photos/:path*", headers: [{ key: "Cache-Control", value: staticAssetCache }] },
      { source: "/cards/:path*", headers: [{ key: "Cache-Control", value: staticAssetCache }] },
      { source: "/og.png", headers: [{ key: "Cache-Control", value: staticAssetCache }] },
    ];
  },
};

export default nextConfig;
