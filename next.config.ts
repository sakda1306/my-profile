import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Off so unknown slugs answer 404 on the first request (the app-shell fallback streamed 200 first).
  partialPrefetching: false,
  images: {
    remotePatterns: [
      ...(supabaseHost ? [{ protocol: "https" as const, hostname: supabaseHost }] : []),
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "skillicons.dev" },
    ],
    // skillicons.dev serves SVG; only those images opt out of optimization (unoptimized prop).
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
