"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { marqueeOffset, tripled } from "@/lib/fx/motion";

export type MarqueeTile = { key: string; src: string | null; label: string };

function Tile({ tile }: { tile: MarqueeTile }) {
  return (
    <div className="relative h-[200px] w-[310px] shrink-0 overflow-hidden rounded-2xl bg-surface md:h-[270px] md:w-[420px]">
      {tile.src ? (
        <Image src={tile.src} alt={tile.label} fill sizes="420px" className="object-cover" loading="lazy" />
      ) : (
        // No image yet: an indigo-to-ember card with the project name.
        <div className="poster-bg flex h-full w-full items-end p-6">
          <span className="hero-heading text-2xl font-black uppercase leading-tight md:text-3xl">{tile.label}</span>
        </div>
      )}
    </div>
  );
}

// Two rows of tiles that slide in opposite directions as the page scrolls.
export function Marquee({ tiles }: { tiles: MarqueeTile[] }) {
  const section = useRef<HTMLElement>(null);
  const rowA = useRef<HTMLDivElement>(null);
  const rowB = useRef<HTMLDivElement>(null);
  const half = Math.ceil(tiles.length / 2);
  const first = tiles.slice(0, half);
  const second = tiles.length > 1 ? tiles.slice(half) : tiles;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = section.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const offset = marqueeOffset(window.scrollY, top, window.innerHeight);
      if (rowA.current) rowA.current.style.transform = `translateX(${offset - 200}px)`;
      if (rowB.current) rowB.current.style.transform = `translateX(${-(offset - 200)}px)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (tiles.length === 0) return null;
  return (
    <section ref={section} aria-hidden="true" className="overflow-hidden pb-10 pt-24 sm:pt-32 md:pt-40">
      <div className="flex flex-col gap-3">
        <div ref={rowA} className="flex w-max gap-3 [margin-left:-50%]" style={{ willChange: "transform" }}>
          {tripled(first).map((t, i) => (
            <Tile key={`${t.key}-${i}`} tile={t} />
          ))}
        </div>
        <div ref={rowB} className="flex w-max gap-3 [margin-left:-50%]" style={{ willChange: "transform" }}>
          {tripled(second).map((t, i) => (
            <Tile key={`${t.key}-${i}`} tile={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
