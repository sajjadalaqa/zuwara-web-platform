import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
// Search engines stay blocked until SITE_INDEXABLE=true is set (go-live on the real domain).
const siteIndexable = process.env.SITE_INDEXABLE === "true";
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "dashboard.zuwara.sa", pathname: "/storage/**" },
      { protocol: "https", hostname: "dashboard.zuwara.sa", pathname: "/asset/**" },
      { protocol: "https", hostname: "dashboardvisit.zuwara.sa", pathname: "/storage/**" },
      { protocol: "https", hostname: "dashboardvisit.zuwara.sa", pathname: "/images/**" },
    ],
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        // Applies to every response (pages, images, files) and overrides page-level robots meta.
        ...(siteIndexable ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
      ],
    }];
  },
};

export default withNextIntl(nextConfig);
