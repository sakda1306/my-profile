import { describe, expect, it } from "vitest";
import {
  applyTexts,
  extractTexts,
  TranslationShapeError,
  type TiptapDoc,
} from "@/lib/richtext/texts";

const doc: TiptapDoc = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "สวัสดี" }] },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "ใช้ " },
        { type: "text", text: "pip install", marks: [{ type: "code" }] },
      ],
    },
    { type: "codeBlock", content: [{ type: "text", text: 'print("hi")' }] },
  ],
};

describe("richtext texts", () => {
  it("extracts translatable text, skipping code", () => {
    expect(extractTexts(doc)).toEqual(["สวัสดี", "ใช้ "]);
  });

  it("applies translated texts to a copy", () => {
    const out = applyTexts(doc, ["Hello", "Use "]);
    const c = out.content!;
    expect(c[0]).toMatchObject({ type: "heading", attrs: { level: 2 }, content: [{ text: "Hello" }] });
    expect(c[1].content![1].text).toBe("pip install");
    expect(c[2].content![0].text).toBe('print("hi")');
    expect(doc.content![0].content![0].text).toBe("สวัสดี");
  });

  it("throws when the count does not match", () => {
    expect(() => applyTexts(doc, ["only one"])).toThrow(TranslationShapeError);
    expect(() => applyTexts(doc, ["a", "b", "c"])).toThrow(TranslationShapeError);
  });

  it("handles an empty doc", () => {
    expect(extractTexts({ type: "doc" })).toEqual([]);
    expect(applyTexts({ type: "doc" }, [])).toEqual({ type: "doc" });
  });
});
