import { describe, expect, it } from "vitest";
import {
  LOCALES,
  hasOwnContent,
  isEmptyValue,
  otherLocale,
  pick,
} from "@/lib/locale/pick";

const DOC_WITH_TEXT = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "x" }] }],
};

describe("locale helpers", () => {
  it("exposes locales and the opposite locale", () => {
    expect(LOCALES).toEqual(["th", "en"]);
    expect(otherLocale("th")).toBe("en");
    expect(otherLocale("en")).toBe("th");
  });

  describe("pick", () => {
    it("returns the requested locale when present", () => {
      expect(pick({ title_th: "สวัสดี", title_en: "Hello" }, "title", "en")).toEqual({
        value: "Hello",
        lang: "en",
        isFallback: false,
      });
    });

    it("falls back to the other locale when the requested one is blank", () => {
      expect(pick({ title_th: "สวัสดี", title_en: "  " }, "title", "en")).toEqual({
        value: "สวัสดี",
        lang: "th",
        isFallback: true,
      });
    });

    it("returns null without fallback when both are empty", () => {
      expect(pick({ title_th: null, title_en: null }, "title", "th")).toEqual({
        value: null,
        lang: "th",
        isFallback: false,
      });
    });
  });

  describe("isEmptyValue", () => {
    it("treats null, undefined and blank strings as empty", () => {
      expect(isEmptyValue(null)).toBe(true);
      expect(isEmptyValue(undefined)).toBe(true);
      expect(isEmptyValue("   ")).toBe(true);
      expect(isEmptyValue("a")).toBe(false);
    });

    it("treats a doc without text nodes as empty", () => {
      expect(isEmptyValue({ type: "doc", content: [{ type: "paragraph" }] })).toBe(true);
    });

    it("treats a doc with a text node as non-empty", () => {
      expect(isEmptyValue(DOC_WITH_TEXT)).toBe(false);
    });
  });

  describe("hasOwnContent", () => {
    it("is false when any field in that locale is empty", () => {
      expect(
        hasOwnContent(
          { title_th: "ก", content_th: null, title_en: "A", content_en: DOC_WITH_TEXT },
          ["title", "content"],
          "th",
        ),
      ).toBe(false);
    });

    it("is true when all fields in that locale are filled", () => {
      expect(
        hasOwnContent(
          { title_th: "ก", content_th: DOC_WITH_TEXT, title_en: "A", content_en: null },
          ["title", "content"],
          "th",
        ),
      ).toBe(true);
    });
  });
});
