import type { SupabaseClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import { createPublicClient } from "@/lib/supabase/public";
import { createServerClient } from "@/lib/supabase/server";
import type { Database, Tables } from "@/lib/supabase/database.types";
import { CONTENT_TAG } from "./revalidate";

type Client = SupabaseClient<Database>;

export type Profile = Tables<"profile">;
export type Section = Tables<"sections">;
export type SectionItem = Tables<"section_items">;
export type Skill = Tables<"skills">;
export type Project = Tables<"projects">;
export type ProjectImage = Tables<"project_images">;
export type Certificate = Tables<"certificates">;
export type Post = Tables<"posts">;

export type HomeData = {
  profile: Profile | null;
  sections: Section[];
  skills: Skill[];
  projects: Project[];
  certificates: Certificate[];
  posts: Post[];
  itemsBySection: Record<string, SectionItem[]>;
};

export type SlugRow = { slug: string } & Record<string, unknown>;

export const LATEST_POSTS_FETCH = 12;

// Draft mode reads through the admin session (RLS lets the admin see hidden rows and drafts).
// Everyone else uses the anon client. Only call this where request APIs are allowed,
// that is, outside 'use cache' scopes.
export async function getContentClient(): Promise<Client> {
  const { isEnabled } = await draftMode();
  return isEnabled ? createServerClient() : createPublicClient();
}

async function isDraft(): Promise<boolean> {
  return (await draftMode()).isEnabled;
}

function rows<T>(res: { data: T[] | null; error: { message: string } | null }): T[] {
  if (res.error) throw new Error(res.error.message);
  return res.data ?? [];
}

function one<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

// ---- Plain loaders: take a client, so the same code serves cached and live reads. ----

async function loadHome(db: Client): Promise<HomeData> {
  const [profile, sections, skills, projects, certificates, posts, items] = await Promise.all([
    db.from("profile").select("*").maybeSingle(),
    db.from("sections").select("*").order("sort_order"),
    db.from("skills").select("*").order("sort_order"),
    db.from("projects").select("*").order("sort_order"),
    db.from("certificates").select("*").order("sort_order"),
    db
      .from("posts")
      .select("*")
      .order("published_at", { ascending: false, nullsFirst: true })
      .limit(LATEST_POSTS_FETCH),
    db.from("section_items").select("*").order("sort_order"),
  ]);
  const itemsBySection: Record<string, SectionItem[]> = {};
  for (const item of rows(items)) (itemsBySection[item.section_id] ??= []).push(item);
  return {
    profile: one(profile),
    sections: rows(sections),
    skills: rows(skills),
    projects: rows(projects),
    certificates: rows(certificates),
    posts: rows(posts),
    itemsBySection,
  };
}

export type ProjectDetail = { project: Project; images: ProjectImage[] };

async function loadProject(db: Client, slug: string): Promise<ProjectDetail | null> {
  const project = one(await db.from("projects").select("*").eq("slug", slug).maybeSingle());
  if (!project) return null;
  const images = rows(
    await db.from("project_images").select("*").eq("project_id", project.id).order("sort_order"),
  );
  return { project, images };
}

async function loadPosts(db: Client): Promise<Post[]> {
  return rows(
    await db.from("posts").select("*").order("published_at", { ascending: false, nullsFirst: true }),
  );
}

async function loadPost(db: Client, slug: string): Promise<Post | null> {
  return one(await db.from("posts").select("*").eq("slug", slug).maybeSingle());
}

// ---- Cached published reads (anon client, tagged so admin saves can expire them). ----

async function cachedHome(): Promise<HomeData> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("max");
  return loadHome(createPublicClient());
}

async function cachedProject(slug: string): Promise<ProjectDetail | null> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("max");
  return loadProject(createPublicClient(), slug);
}

async function cachedPosts(): Promise<Post[]> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("max");
  return loadPosts(createPublicClient());
}

async function cachedPost(slug: string): Promise<Post | null> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("max");
  return loadPost(createPublicClient(), slug);
}

// ---- Public API ----

export async function getHomeData(): Promise<HomeData> {
  return (await isDraft()) ? loadHome(await getContentClient()) : cachedHome();
}

export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  return (await isDraft()) ? loadProject(await getContentClient(), slug) : cachedProject(slug);
}

// `tag` is an optional filter; the blog page filters on the client so the route stays static.
export async function getPosts(tag?: string): Promise<Post[]> {
  const all = (await isDraft()) ? await loadPosts(await getContentClient()) : await cachedPosts();
  return tag ? all.filter((p) => p.tags.includes(tag)) : all;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return (await isDraft()) ? loadPost(await getContentClient(), slug) : cachedPost(slug);
}

// Used by generateStaticParams (build time, no request), so it always reads published rows.
export async function getAllSlugs(): Promise<{ projects: SlugRow[]; posts: SlugRow[] }> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("max");
  const db = createPublicClient();
  const [projects, posts] = await Promise.all([
    db.from("projects").select("slug,updated_at,title_th,title_en,summary_th,summary_en"),
    db.from("posts").select("slug,updated_at,title_th,title_en,content_th,content_en"),
  ]);
  return { projects: rows(projects) as SlugRow[], posts: rows(posts) as SlugRow[] };
}
