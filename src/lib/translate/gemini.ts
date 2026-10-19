import "server-only";
import { z } from "zod";
import type { Locale } from "@/lib/locale/pick";

export class TranslateError extends Error {
  constructor(message = "Translation failed") {
    super(message);
    this.name = "TranslateError";
  }
}
export class QuotaError extends TranslateError {
  constructor() {
    super("Translation quota exceeded");
    this.name = "QuotaError";
  }
}

const DEFAULT_MODEL = "gemini-flash-latest";
const TIMEOUT_MS = 30_000;
const LANGUAGE: Record<Locale, string> = { th: "Thai", en: "English" };

export function isTranslateEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

const responseSchema = z.array(z.string());

function buildPrompt(texts: string[], from: Locale, to: Locale): string {
  return [
    `Translate each string in the JSON array below from ${LANGUAGE[from]} to ${LANGUAGE[to]}.`,
    "Return only a JSON array of strings, in the same order and with the same length.",
    "Do not translate technical terms, program names or library names (for example FastAPI, RAG, FAISS, Docker); keep them as written.",
    "Keep leading and trailing whitespace of each string.",
    "",
    JSON.stringify(texts),
  ].join("\n");
}

export async function translateStrings(
  texts: string[],
  from: Locale,
  to: Locale,
): Promise<string[]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new TranslateError("GEMINI_API_KEY is not set");
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(texts, from, to) }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new TranslateError("Translation request failed");
  }
  if (res.status === 429) throw new QuotaError();
  if (!res.ok) throw new TranslateError(`Translation request failed (${res.status})`);

  try {
    const body = await res.json();
    const raw: unknown = body?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof raw !== "string") throw new Error("empty");
    const parsed = responseSchema.parse(JSON.parse(raw));
    if (parsed.length !== texts.length) throw new Error("length");
    return parsed;
  } catch {
    throw new TranslateError("Unexpected translation response");
  }
}
