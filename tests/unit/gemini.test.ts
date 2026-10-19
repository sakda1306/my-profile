import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isTranslateEnabled,
  QuotaError,
  translateStrings,
  TranslateError,
} from "@/lib/translate/gemini";
import { translateAction } from "@/app/admin/actions/translate";

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdminAction: vi.fn(async () => ({ supabase: {}, userId: "u" })),
}));

const geminiBody = (text: string) => ({ candidates: [{ content: { parts: [{ text }] } }] });
let fetchMock: ReturnType<typeof vi.fn>;
function mockFetch(status: number, body: unknown) {
  fetchMock.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("GEMINI_API_KEY", "test-key");
  vi.stubEnv("GEMINI_MODEL", "test-model");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("translateStrings", () => {
  it("returns translations and sends key header and json mime type", async () => {
    mockFetch(200, geminiBody('["Hello"]'));
    await expect(translateStrings(["สวัสดี"], "th", "en")).resolves.toEqual(["Hello"]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/test-model:generateContent",
    );
    expect(init.headers["x-goog-api-key"]).toBe("test-key");
    const cfg = JSON.parse(init.body).generationConfig;
    expect(cfg.responseMimeType).toBe("application/json");
    expect(cfg.thinkingConfig.thinkingBudget).toBe(0);
  });

  it("falls back to the default model when GEMINI_MODEL is empty", async () => {
    vi.stubEnv("GEMINI_MODEL", "");
    mockFetch(200, geminiBody('["Hello"]'));
    await translateStrings(["ก"], "th", "en");
    expect(fetchMock.mock.calls[0][0]).toContain("/models/gemini-flash-latest:generateContent");
  });

  it("rejects non-json output", async () => {
    mockFetch(200, geminiBody("not json"));
    await expect(translateStrings(["ก"], "th", "en")).rejects.toThrow(TranslateError);
  });

  it("rejects a wrong length array", async () => {
    mockFetch(200, geminiBody('["a","b"]'));
    await expect(translateStrings(["ก"], "th", "en")).rejects.toThrow(TranslateError);
  });

  it("throws QuotaError on 429", async () => {
    mockFetch(429, {});
    await expect(translateStrings(["ก"], "th", "en")).rejects.toThrow(QuotaError);
  });

  it("throws TranslateError on other http errors and network failures", async () => {
    mockFetch(500, {});
    await expect(translateStrings(["ก"], "th", "en")).rejects.toThrow(TranslateError);
    fetchMock.mockRejectedValueOnce(new Error("timeout"));
    await expect(translateStrings(["ก"], "th", "en")).rejects.toThrow(TranslateError);
  });
});

describe("isTranslateEnabled", () => {
  it("reflects the key", () => {
    expect(isTranslateEnabled()).toBe(true);
    vi.stubEnv("GEMINI_API_KEY", "");
    expect(isTranslateEnabled()).toBe(false);
  });
});

describe("translateAction", () => {
  it("translates text", async () => {
    mockFetch(200, geminiBody('["Hello"]'));
    await expect(translateAction({ kind: "text", text: "สวัสดี" }, "th", "en")).resolves.toEqual({
      ok: true,
      data: { text: "Hello" },
    });
  });

  it("translates a doc", async () => {
    mockFetch(200, geminiBody('["Hi"]'));
    const r = await translateAction(
      { kind: "doc", doc: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "ดี" }] }] } },
      "th",
      "en",
    );
    expect(r).toMatchObject({ ok: true });
    expect(r.ok && r.data?.doc?.content?.[0].content?.[0].text).toBe("Hi");
  });

  it("returns empty input unchanged without calling the API", async () => {
    await expect(translateAction({ kind: "text", text: "  " }, "th", "en")).resolves.toEqual({
      ok: true,
      data: { text: "  " },
    });
    const empty = { type: "doc" as const };
    await expect(translateAction({ kind: "doc", doc: empty }, "th", "en")).resolves.toEqual({
      ok: true,
      data: { doc: empty },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps errors to Thai messages", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    await expect(translateAction({ kind: "text", text: "ก" }, "th", "en")).resolves.toEqual({
      ok: false,
      error: "ยังไม่ได้ตั้งค่า GEMINI_API_KEY",
    });
    vi.stubEnv("GEMINI_API_KEY", "k");
    mockFetch(429, {});
    await expect(translateAction({ kind: "text", text: "ก" }, "th", "en")).resolves.toEqual({
      ok: false,
      error: "โควต้าการแปลหมดแล้ว ลองใหม่ภายหลังหรือพิมพ์เอง",
    });
    mockFetch(500, {});
    await expect(translateAction({ kind: "text", text: "ก" }, "th", "en")).resolves.toEqual({
      ok: false,
      error: "แปลไม่สำเร็จ ลองอีกครั้ง",
    });
  });
});
