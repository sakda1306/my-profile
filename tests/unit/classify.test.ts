import { describe, expect, it } from "vitest";
import { classifyUpload } from "@/lib/media/classify";
import { fitWithin } from "@/lib/media/resize";

describe("classifyUpload", () => {
  it("rejects heic", () =>
    expect(classifyUpload({ type: "image/heic", size: 1 })).toEqual({
      error: expect.stringContaining("HEIC"),
    }));
  it("rejects big pdf", () =>
    expect(classifyUpload({ type: "application/pdf", size: 11 * 1024 * 1024 })).toHaveProperty("error"));
  it("accepts png and pdf", () => {
    expect(classifyUpload({ type: "image/png", size: 5 })).toEqual({ kind: "image" });
    expect(classifyUpload({ type: "application/pdf", size: 5 })).toEqual({ kind: "pdf" });
  });
});

describe("fitWithin", () => {
  it("scales down", () => expect(fitWithin(4000, 3000)).toEqual({ w: 1600, h: 1200 }));
  it("keeps small", () => expect(fitWithin(800, 600)).toEqual({ w: 800, h: 600 }));
});
