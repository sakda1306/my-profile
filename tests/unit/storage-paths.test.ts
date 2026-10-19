import { describe, expect, it } from "vitest";
import { collectStoragePaths } from "@/lib/admin/storage-paths";
import { PUBLIC_MEDIA_URL } from "@/lib/media/url";

const docWithImage = (src: string) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "image", attrs: { src } }] }],
});

describe("collectStoragePaths", () => {
  it("collects file columns and embedded images", () => {
    expect(
      collectStoragePaths(
        {
          cover_path: "projects/a.webp",
          repo_url: "x",
          body_th: docWithImage(PUBLIC_MEDIA_URL + "projects/b.webp"),
          body_en: docWithImage("https://other.com/c.png"),
        },
        { files: ["cover_path"], richtext: ["body_th", "body_en"] },
      ),
    ).toEqual(["projects/a.webp", "projects/b.webp"]);
  });
  it("skips http values and nulls", () => {
    expect(
      collectStoragePaths(
        { avatar_path: "https://avatars.githubusercontent.com/u/1", x: null },
        { files: ["avatar_path", "x"], richtext: [] },
      ),
    ).toEqual([]);
  });
});
