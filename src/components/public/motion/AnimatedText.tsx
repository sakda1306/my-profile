"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useMemo, useRef } from "react";
import { charRange, graphemes } from "@/lib/fx/motion";

function Char({
  char,
  range,
  progress,
}: {
  char: string;
  range: [number, number];
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <span className="relative">
      <span className="invisible">{char}</span>
      <motion.span data-fade="" className="absolute inset-0 motion-reduce:!opacity-100" style={{ opacity }}>
        {char}
      </motion.span>
    </span>
  );
}

// Lights the paragraph up character by character as it scrolls through the viewport.
// Reduced motion is handled in CSS so the server and client markup always match.
export function AnimatedText({ text, locale, className = "" }: { text: string; locale: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.2"] });
  const chars = useMemo(() => graphemes(text, locale), [text, locale]);

  return (
    <p ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">
        {chars.map((c, i) => (
          <Char key={i} char={c} range={charRange(i, chars.length)} progress={scrollYProgress} />
        ))}
      </span>
    </p>
  );
}
