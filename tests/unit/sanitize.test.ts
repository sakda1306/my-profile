import { describe, expect, it } from "vitest";
import { renderRichText } from "@/lib/richtext/render";
import { sanitizeDoc } from "@/lib/richtext/sanitize";
import type { TiptapDoc, TiptapNode } from "@/lib/richtext/texts";

function docWith(inline: TiptapNode[], blocks: TiptapNode[] = []): TiptapDoc {
  return { type: "doc", content: [{ type: "paragraph", content: inline }, ...blocks] };
}
const link = (href: string, text = "x"): TiptapNode => ({
  type: "text",
  text,
  marks: [{ type: "link", attrs: { href } }],
});

describe("renderRichText", () => {
  it("strips unsafe links and images but keeps safe links", () => {
    const bad = docWith(
      [link("javascript:alert(1)"), link("https://ok.dev", "y")],
      [{ type: "image", attrs: { src: "data:image/png;base64,AAA" } }],
    );
    const html = renderRichText(bad);
    expect(html).not.toContain("javascript:");
    expect(html).toContain('href="https://ok.dev"');
    expect(html).not.toContain("data:image");
  });
  it("returns empty string for null", () => expect(renderRichText(null)).toBe(""));
  it("keeps https images", () => {
    const html = renderRichText(
      docWith([], [{ type: "image", attrs: { src: "https://cdn.example.com/a.webp" } }]),
    );
    expect(html).toContain('src="https://cdn.example.com/a.webp"');
  });
  it("renders code blocks with a language class", () => {
    const html = renderRichText({
      type: "doc",
      content: [
        {
          type: "codeBlock",
          attrs: { language: "ts" },
          content: [{ type: "text", text: "const a = 1" }],
        },
      ],
    });
    expect(html).toContain("language-ts");
    expect(html).toContain("const a = 1");
  });
  it("escapes raw html in text", () => {
    const html = renderRichText(docWith([{ type: "text", text: "<script>alert(1)</script>" }]));
    expect(html).not.toContain("<script>");
  });
});

describe("sanitizeDoc", () => {
  it("removes a javascript link mark but keeps its text", () => {
    const out = sanitizeDoc(docWith([link(" JaVaScript:alert(1)", "keep")]));
    expect(out.content?.[0].content?.[0]).toEqual({ type: "text", text: "keep" });
  });
  it("keeps http, https and mailto links", () => {
    for (const href of ["http://a.dev", "https://a.dev", "mailto:a@b.dev"]) {
      const out = sanitizeDoc(docWith([link(href)]));
      expect(out.content?.[0].content?.[0].marks?.[0].attrs?.href).toBe(href);
    }
  });
  it("removes images with non-http src", () => {
    const out = sanitizeDoc(
      docWith([], [{ type: "image", attrs: { src: "javascript:1" } }, { type: "image" }]),
    );
    expect(out.content).toHaveLength(1);
  });
  it("does not mutate the input", () => {
    const d = docWith([link("javascript:x")]);
    const before = JSON.stringify(d);
    sanitizeDoc(d);
    expect(JSON.stringify(d)).toBe(before);
  });
});
