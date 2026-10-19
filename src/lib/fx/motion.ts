// Pure math behind the scroll and pointer motion, kept apart from React so it can be tested.

/** Marquee rows move by this many px for the current scroll position (0.3 of the distance scrolled into view). */
export function marqueeOffset(scrollY: number, sectionTop: number, viewportHeight: number): number {
  return (scrollY - sectionTop + viewportHeight) * 0.3;
}

/** Stacked cards shrink a little more the deeper they sit under the cards that follow. */
export function stackScale(index: number, total: number): number {
  return 1 - (total - 1 - index) * 0.03;
}

/** The slice of scroll progress (0..1) during which character i of n lights up. */
export function charRange(i: number, n: number): [number, number] {
  if (n <= 0) return [0, 1];
  return [i / n, (i + 1) / n];
}

/**
 * Splits text into user-perceived characters, so Thai vowels and tone marks stay on their
 * base consonant instead of being animated (and positioned) on their own.
 */
export function graphemes(text: string, locale = "th"): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter(locale, { granularity: "grapheme" });
    return Array.from(seg.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/**
 * Magnet pull: once the pointer is within `padding` px of the element's box, move the element
 * toward the pointer by (distance from centre / strength). Outside that zone, rest at 0,0.
 */
export function magnetOffset(
  pointer: { x: number; y: number },
  box: { left: number; top: number; width: number; height: number },
  padding: number,
  strength: number,
): { x: number; y: number; active: boolean } {
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;
  const dx = pointer.x - cx;
  const dy = pointer.y - cy;
  const inside = Math.abs(dx) < box.width / 2 + padding && Math.abs(dy) < box.height / 2 + padding;
  if (!inside) return { x: 0, y: 0, active: false };
  return { x: dx / strength, y: dy / strength, active: true };
}

/** Repeats a list so a scrolling row never runs out of tiles. */
export function tripled<T>(items: T[]): T[] {
  return [...items, ...items, ...items];
}
