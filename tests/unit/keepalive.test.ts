import { beforeEach, describe, expect, it, vi } from "vitest";

const limit = vi.fn();
vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: () => ({ from: () => ({ select: () => ({ limit }) }) }),
}));

import { GET } from "@/app/api/keepalive/route";

const req = (auth?: string) =>
  new Request("http://localhost/api/keepalive", {
    headers: auth ? { authorization: auth } : {},
  });

describe("GET /api/keepalive", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    limit.mockReset();
    limit.mockResolvedValue({ data: [{ id: "1" }], error: null });
  });

  it("returns 401 without header", async () => {
    expect((await GET(req())).status).toBe(401);
  });

  it("returns 401 with wrong secret", async () => {
    expect((await GET(req("Bearer nope"))).status).toBe(401);
  });

  it("returns 401 when CRON_SECRET is unset", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await GET(req("Bearer "))).status).toBe(401);
  });

  it("returns 200 ok with the right secret", async () => {
    const res = await GET(req("Bearer s3cret"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("returns 500 when the query fails", async () => {
    limit.mockResolvedValue({ data: null, error: { message: "boom" } });
    expect((await GET(req("Bearer s3cret"))).status).toBe(500);
  });
});
