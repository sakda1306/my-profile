import { describe, expect, it } from "vitest";
import { mediaUrl } from "@/lib/media/url";

describe("mediaUrl", () => {
  it("null", () => expect(mediaUrl(null)).toBeNull());
  it("http passthrough", () => expect(mediaUrl("https://a.com/x.png")).toBe("https://a.com/x.png"));
  it("builds public url", () =>
    expect(mediaUrl("projects/a.webp")).toBe(
      "https://test.supabase.co/storage/v1/object/public/media/projects/a.webp",
    ));
});
