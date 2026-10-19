import { describe, expect, it } from "vitest";
import { charRange, graphemes, magnetOffset, marqueeOffset, stackScale, tripled } from "@/lib/fx/motion";

describe("marqueeOffset", () => {
  it("is 0.3 of how far the section has scrolled into view", () => {
    expect(marqueeOffset(1000, 900, 800)).toBeCloseTo(270);
    expect(marqueeOffset(0, 800, 800)).toBe(0);
  });
});

describe("stackScale", () => {
  it("keeps the last card full size and shrinks earlier ones by 3% each", () => {
    expect(stackScale(2, 3)).toBe(1);
    expect(stackScale(1, 3)).toBeCloseTo(0.97);
    expect(stackScale(0, 3)).toBeCloseTo(0.94);
  });
});

describe("charRange", () => {
  it("splits progress evenly across characters", () => {
    expect(charRange(0, 4)).toEqual([0, 0.25]);
    expect(charRange(3, 4)).toEqual([0.75, 1]);
  });
  it("survives empty text", () => expect(charRange(0, 0)).toEqual([0, 1]));
});

describe("graphemes", () => {
  it("keeps Thai vowels and tone marks on their consonant", () => {
    expect(graphemes("ศักดิ์")).toEqual(["ศั", "ก", "ดิ์"]);
  });
  it("splits Latin text per letter", () => expect(graphemes("Hi!")).toEqual(["H", "i", "!"]));
});

describe("magnetOffset", () => {
  const box = { left: 100, top: 100, width: 200, height: 200 };
  it("pulls toward the pointer by distance / strength inside the zone", () => {
    expect(magnetOffset({ x: 260, y: 200 }, box, 150, 3)).toEqual({ x: 20, y: 0, active: true });
  });
  it("rests outside the padding zone", () => {
    expect(magnetOffset({ x: 600, y: 200 }, box, 150, 3)).toEqual({ x: 0, y: 0, active: false });
  });
});

describe("tripled", () => {
  it("repeats the list three times", () => expect(tripled([1, 2])).toEqual([1, 2, 1, 2, 1, 2]));
});
