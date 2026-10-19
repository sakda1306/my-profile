import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/alternates";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
