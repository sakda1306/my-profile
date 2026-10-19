"use client";

import { useRef } from "react";
import { parseColor, particleCount, rgba, spawnPuff, stepPuff, type Puff, type Rgb } from "@/lib/fx/particles";
import { useCanvasLoop } from "./useCanvasLoop";

type Props = {
  className?: string;
  /** Puffs on a wide screen. */
  count?: number;
  /** Puff size as a share of the area's width. */
  size?: number;
  /** Peak opacity of a puff. */
  alpha?: number;
  /** Sideways drift per frame. */
  wind?: number;
};

const SPRITE = 256;

// One soft puff texture: many overlapping radial blobs in the given tint.
function makeSprite(tint: Rgb, rand: () => number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = SPRITE;
  const x = c.getContext("2d");
  if (!x) return c;
  for (let i = 0; i < 26; i++) {
    const px = SPRITE / 2 + (rand() - 0.5) * SPRITE * 0.45;
    const py = SPRITE / 2 + (rand() - 0.5) * SPRITE * 0.45;
    const pr = SPRITE * (0.12 + rand() * 0.22);
    const g = x.createRadialGradient(px, py, 0, px, py, pr);
    g.addColorStop(0, rgba(tint, 0.22));
    g.addColorStop(1, rgba(tint, 0));
    x.fillStyle = g;
    x.beginPath();
    x.arc(px, py, pr, 0, Math.PI * 2);
    x.fill();
  }
  return c;
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return { r: Math.round(a.r + (b.r - a.r) * t), g: Math.round(a.g + (b.g - a.g) * t), b: Math.round(a.b + (b.b - a.b) * t) };
}

// Slow drifting smoke tinted from the --color-smoke and --color-indigo tokens.
export function SmokeCanvas({ className = "", count = 16, size = 0.35, alpha = 0.35, wind = 0 }: Props) {
  const puffs = useRef<Puff[]>([]);
  const sprites = useRef<HTMLCanvasElement[]>([]);

  const ref = useCanvasLoop({
    setup: (api) => {
      const smoke = parseColor(api.token("--color-smoke"), { r: 122, g: 140, b: 255 });
      const indigo = parseColor(api.token("--color-indigo"), { r: 42, g: 47, b: 143 });
      const fg = parseColor(api.token("--color-fg"), { r: 238, g: 241, b: 255 });
      if (sprites.current.length === 0) {
        sprites.current = [smoke, mix(smoke, fg, 0.4), mix(smoke, indigo, 0.5)].map((tint) => makeSprite(tint, Math.random));
      }
      const opts = { size, alpha, wind, sprites: sprites.current.length };
      const n = particleCount(count, api.width, api.reducedMotion);
      puffs.current = Array.from({ length: n }, () => spawnPuff(api.width, api.height, Math.random, true, opts));
    },
    frame: ({ ctx, width, height, reducedMotion }) => {
      ctx.clearRect(0, 0, width, height);
      const opts = { size, alpha, wind, sprites: sprites.current.length };
      const list = puffs.current;
      for (let i = 0; i < list.length; i++) {
        const p = list[i];
        if (reducedMotion) p.alpha = p.maxAlpha;
        else if (!stepPuff(p, width)) {
          list[i] = spawnPuff(width, height, Math.random, false, opts);
          continue;
        }
        const breathe = 1 + Math.sin(p.phase) * 0.06;
        ctx.save();
        ctx.globalAlpha = p.alpha * (0.75 + Math.sin(p.phase * 1.7) * 0.25);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(breathe, breathe);
        ctx.drawImage(sprites.current[p.sprite], -p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    },
  });

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none h-full w-full ${className}`} />;
}
