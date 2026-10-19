// Pure particle math for the poster's embers and smoke. The canvas components only draw.

export type Rgb = { r: number; g: number; b: number };

export type Ember = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  phase: number;
  streak: boolean;
};

export type Puff = {
  x: number;
  y: number;
  size: number;
  rot: number;
  vr: number;
  vx: number;
  vy: number;
  alpha: number;
  maxAlpha: number;
  phase: number;
  sprite: number;
};

export type Pointer = { x: number; y: number } | null;

const PUSH_RADIUS_SQ = 9000;

/** Parses "#rgb", "#rrggbb" or "rgb(r g b)" / "rgb(r, g, b)"; falls back when unparseable. */
export function parseColor(value: string, fallback: Rgb): Rgb {
  const v = value.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].replace(/./g, (c) => c + c) : hex[1];
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
  }
  const rgb = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i.exec(v);
  if (rgb) return { r: +rgb[1], g: +rgb[2], b: +rgb[3] };
  return fallback;
}

export function rgba(c: Rgb, a: number): string {
  return `rgba(${c.r},${c.g},${c.b},${Math.max(0, Math.min(1, a))})`;
}

/** How many particles to run: fewer on narrow screens, a few static ones when motion is reduced. */
export function particleCount(base: number, width: number, reducedMotion: boolean): number {
  const scaled = width < 768 ? Math.round(base * 0.45) : base;
  return reducedMotion ? Math.min(scaled, Math.round(base * 0.3)) : scaled;
}

export function spawnEmber(w: number, h: number, rand: () => number, anywhere: boolean): Ember {
  return {
    x: rand() * w,
    y: anywhere ? rand() * h : h + 10,
    r: rand() * 1.8 + 0.6,
    vy: -(rand() * 0.7 + 0.35),
    vx: (rand() - 0.5) * 0.3,
    life: 0,
    max: rand() * 380 + 260,
    phase: rand() * Math.PI * 2,
    streak: rand() < 0.18,
  };
}

/** Advances one ember a frame; the pointer pushes nearby embers away. Returns false once it should respawn. */
export function stepEmber(p: Ember, pointer: Pointer): boolean {
  p.life++;
  p.phase += 0.05;
  if (pointer) {
    const dx = p.x - pointer.x;
    const dy = p.y - pointer.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < PUSH_RADIUS_SQ) {
      const f = ((PUSH_RADIUS_SQ - d2) / PUSH_RADIUS_SQ) * 0.06;
      p.vx += (dx / 90) * f;
      p.vy += (dy / 90) * f;
    }
  }
  p.vx *= 0.985;
  p.x += p.vx + Math.sin(p.phase) * 0.25;
  p.y += p.vy;
  return p.life <= p.max && p.y > -20;
}

/** Fade in over the first 10% of life, out over the rest, with a flicker. */
export function emberAlpha(p: Ember): number {
  const t = p.life / p.max;
  const envelope = t < 0.1 ? t / 0.1 : 1 - (t - 0.1) / 0.9;
  return Math.max(0, envelope * (0.6 + Math.sin(p.phase * 3) * 0.4));
}

export function spawnPuff(
  w: number,
  h: number,
  rand: () => number,
  anywhere: boolean,
  opts: { size: number; alpha: number; wind: number; sprites: number },
): Puff {
  const size = (rand() * 0.5 + 0.5) * opts.size * Math.max(w, 400);
  return {
    x: rand() * w,
    y: anywhere ? rand() * h : h + size * 0.4,
    size,
    rot: rand() * Math.PI * 2,
    vr: (rand() - 0.5) * 0.0016,
    vx: (rand() - 0.5) * 0.18 + opts.wind,
    vy: -(rand() * 0.18 + 0.06),
    alpha: 0,
    maxAlpha: rand() * opts.alpha + opts.alpha * 0.4,
    phase: rand() * Math.PI * 2,
    sprite: Math.floor(rand() * opts.sprites),
  };
}

/** Drifts one puff a frame. Returns false once it has left the area. */
export function stepPuff(p: Puff, w: number): boolean {
  p.x += p.vx;
  p.y += p.vy;
  p.rot += p.vr;
  p.phase += 0.004;
  p.alpha = Math.min(p.maxAlpha, p.alpha + 0.002);
  return p.y > -p.size / 2 && p.x > -p.size && p.x < w + p.size;
}
