import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient, createAnonClient, createServiceClient } from "./setup";

const tag = `rls-test-${Date.now()}`;
let anon: SupabaseClient;
let admin: SupabaseClient;
let service: SupabaseClient;

const skillIds: string[] = [];
const postIds: string[] = [];
const sectionIds: string[] = [];
const uploadedPaths: string[] = [];

beforeAll(async () => {
  anon = createAnonClient();
  admin = await createAdminClient();
  service = createServiceClient();
});

afterAll(async () => {
  // Cleanup uses the service role so it works even if a test failed midway.
  if (skillIds.length) await service.from("skills").delete().in("id", skillIds);
  if (postIds.length) await service.from("posts").delete().in("id", postIds);
  if (sectionIds.length) await service.from("sections").delete().in("id", sectionIds);
  if (uploadedPaths.length) await service.storage.from("media").remove(uploadedPaths);
});

describe("RLS", () => {
  it("anon cannot insert skills", async () => {
    const { data, error } = await anon
      .from("skills")
      .insert({ name: `${tag}-anon`, category: "tool" })
      .select();
    if (data?.length) skillIds.push(...data.map((r) => r.id));
    expect(error).not.toBeNull();
  });

  it("anon sees only visible skills", async () => {
    const { data, error } = await admin
      .from("skills")
      .insert([
        { name: `${tag}-visible`, category: "tool", is_visible: true },
        { name: `${tag}-hidden`, category: "tool", is_visible: false },
      ])
      .select();
    expect(error).toBeNull();
    skillIds.push(...(data ?? []).map((r) => r.id));

    const { data: seen, error: readError } = await anon
      .from("skills")
      .select("name")
      .like("name", `${tag}%`);
    expect(readError).toBeNull();
    const names = (seen ?? []).map((r) => r.name);
    expect(names).toContain(`${tag}-visible`);
    expect(names).not.toContain(`${tag}-hidden`);
  });

  it("anon cannot read draft posts", async () => {
    const { data, error } = await admin
      .from("posts")
      .insert([
        { slug: `${tag}-draft`, status: "draft" },
        { slug: `${tag}-pub`, status: "published", published_at: new Date().toISOString() },
      ])
      .select();
    expect(error).toBeNull();
    postIds.push(...(data ?? []).map((r) => r.id));

    const { data: seen } = await anon.from("posts").select("slug").like("slug", `${tag}%`);
    const slugs = (seen ?? []).map((r) => r.slug);
    expect(slugs).toContain(`${tag}-pub`);
    expect(slugs).not.toContain(`${tag}-draft`);
  });

  it("anon cannot upload to media", async () => {
    const path = `${tag}/anon.txt`;
    const { error } = await anon.storage
      .from("media")
      .upload(path, new Blob(["x"], { type: "text/plain" }));
    uploadedPaths.push(path);
    expect(error).not.toBeNull();
  });

  it("admin cannot delete system section", async () => {
    const { data, error } = await service
      .from("sections")
      .insert({ type: "rich_text", slug: `${tag}-system`, is_system: true })
      .select()
      .single();
    expect(error).toBeNull();
    sectionIds.push(data!.id);

    const { data: deleted, error: delError } = await admin
      .from("sections")
      .delete()
      .eq("id", data!.id)
      .select();
    expect(delError).toBeNull();
    expect(deleted).toHaveLength(0);

    const { data: still } = await service.from("sections").select("id").eq("id", data!.id);
    expect(still).toHaveLength(1);
  });

  it("admin can insert and delete skill", async () => {
    const { data, error } = await admin
      .from("skills")
      .insert({ name: `${tag}-admin`, category: "language" })
      .select()
      .single();
    expect(error).toBeNull();
    skillIds.push(data!.id);

    const { data: deleted, error: delError } = await admin
      .from("skills")
      .delete()
      .eq("id", data!.id)
      .select();
    expect(delError).toBeNull();
    expect(deleted).toHaveLength(1);
  });
});
