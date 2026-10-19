import { describe, expect, it } from "vitest";
import { docToPlain, plainToDoc } from "@/lib/richtext/plain";

describe("plain richtext", () => {
  it("empty text gives null", () => expect(plainToDoc("  \n ")).toBeNull());
  it("splits paragraphs on blank lines", () => {
    const doc = plainToDoc("a\nb\n\nc");
    expect(doc).toEqual({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "a\nb" }] },
        { type: "paragraph", content: [{ type: "text", text: "c" }] },
      ],
    });
  });
  it("round trips", () => expect(docToPlain(plainToDoc("a\n\nb"))).toBe("a\n\nb"));
  it("handles null and junk", () => {
    expect(docToPlain(null)).toBe("");
    expect(docToPlain("x")).toBe("");
  });
});
