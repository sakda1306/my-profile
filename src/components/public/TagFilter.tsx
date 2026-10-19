"use client";

import { useSearchParams } from "next/navigation";

// Renders nothing but a style rule: hides post cards that lack the ?tag= value.
// Cards stay in the server-rendered HTML, so the list is present without JavaScript.
export function TagFilter() {
  const tag = useSearchParams().get("tag");
  if (!tag) return null;
  const safe = JSON.stringify(`|${tag.replace(/[|<>\\]/g, "")}|`);
  const link = JSON.stringify(tag.replace(/[<>\\]/g, ""));
  return (
    <style>{`#post-list > li:not([data-tags*=${safe}]) { display: none; } [data-tag-link=${link}] { font-weight: 700; text-decoration: underline; }`}</style>
  );
}
