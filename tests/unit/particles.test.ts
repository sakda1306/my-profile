import { describe, expect, it } from "vitest";
import {
  emberAlpha,
  parseColor,
  particleCount,
  spawnEmber,
  spawnPuff,
  stepEmber,
  stepPuff,
} from "@/lib/fx/particles";

const FALLBACK = { r: 1, g: 2, b: 3 };
const half = () => 0.5;

describe("parseColor", () => {
  it("reads 6- and 3-digit hex", () => {
    expect(parseColor("#ff8a2b", FALLBACK)).toEqual({ r: 255, g: 138, b: 43 });
    expect(parseColor(" #fff ", FALLBACK)).toEqual({ r: 255, g: 255, b: 255 });
  });
  it("reads rgb() in both syntaxes", () => {
    expect(parseColor("rgb(10 20 30 / 0.5)", FALLBACK)).toEqual({ r: 10, g: 20, b: 30 });
    expect(parseColor("rgba(10, 20, 30, 1)", FALLBACK)).toEqual({ r: 10, g: 20, b: 30 });
  });
  it("falls back on anything else", () => {
    expect(parseColor("", FALLBACK)).toBe(FALLBACK);
    expect(parseColor("orange", FALLBACK)).toBe(FALLBACK);
  });
});

describe("particleCount", () => {
  it("keeps the base count on wide screens", () => expect(particleCount(100, 1280, false)).toBe(100));
  it("cuts the count on phones", () => expect(particleCount(100, 375, false)).toBe(45));
  it("keeps only a few when motion is reduced", () => expect(particleCount(100, 1280, true)).toBe(30));
});

describe("embers", () => {
  it("spawn below the area unless asked to fill it", () => {
    expect(spawnEmber(800, 600, half, false).y).toBe(610);
    expect(spawnEmber(800, 600, half, true).y).toBe(300);
  });
  it("rise every frame", () => {
    const p = spawnEmber(800, 600, half, true);
    const y0 = p.y;
    stepEmber(p, null);
    expect(p.y).toBeLessThan(y0);
  });
  it("are pushed away from the pointer", () => {
    const p = spawnEmber(800, 600, half, true);
    p.vx = 0;
    stepEmber(p, { x: p.x - 20, y: p.y });
    expect(p.vx).toBeGreaterThan(0);
  });
  it("ask to respawn when their life ends or they leave the top", () => {
    const p = spawnEmber(800, 600, half, true);
    p.life = p.max;
    expect(stepEmber(p, null)).toBe(false);
    const q = spawnEmber(800, 600, half, true);
    q.y = -30;
    expect(stepEmber(q, null)).toBe(false);
  });
  it("fade in, then out, and never go negative", () => {
    const p = spawnEmber(800, 600, half, true);
    p.life = 0;
    expect(emberAlpha(p)).toBe(0);
    p.life = p.max * 2;
    expect(emberAlpha(p)).toBe(0);
  });
});

describe("smoke puffs", () => {
  const opts = { size: 0.5, alpha: 0.5, wind: 0, sprites: 3 };
  it("drift upward and fade in up to their max alpha", () => {
    const p = spawnPuff(800, 600, half, true, opts);
    const y0 = p.y;
    for (let i = 0; i < 1000; i++) stepPuff(p, 800);
    expect(p.y).toBeLessThan(y0);
    expect(p.alpha).toBe(p.maxAlpha);
  });
  it("ask to respawn after leaving the top", () => {
    const p = spawnPuff(800, 600, half, true, opts);
    p.y = -p.size;
    expect(stepPuff(p, 800)).toBe(false);
  });
});
