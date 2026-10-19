import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/content/queries";
import { hasOwnContent } from "@/lib/locale/pick";
import { ALL_OWN, buildSitemapEntries, getSiteUrl } from "@/lib/seo/alternates";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects, posts } = await getAllSlugs();
  const own = (row: Record<string, unknown>, fields: string[]) => ({
    th: hasOwnContent(row, fields, "th"),
    en: hasOwnContent(row, fields, "en"),
  });
  return buildSitemapEntries(
    [
      { path: "/", own: ALL_OWN },
      { path: "/blog", own: ALL_OWN },
      ...projects.map((p) => ({
        path: `/projects/${p.slug}`,
        own: own(p, ["title", "summary"]),
        updatedAt: p.updated_at as string | undefined,
      })),
      ...posts.map((p) => ({
        path: `/blog/${p.slug}`,
        own: own(p, ["title", "content"]),
        updatedAt: p.updated_at as string | undefined,
      })),
    ],
    getSiteUrl(),
  );
}
