import { Frame } from "./Frame";
import { FallbackBadge } from "@/components/public/FallbackBadge";
import { RichTextView } from "@/components/public/RichTextView";
import type { Section } from "@/lib/content/queries";
import { pick, type Locale } from "@/lib/locale/pick";
import type { TiptapDoc } from "@/lib/richtext/texts";

export function RichText({ section, locale }: { section: Section; locale: Locale }) {
  const body = pick(section, "body", locale);
  if (!body.value) return null;
  return (
    <Frame section={section} locale={locale} fallbackTitle="">
      <RichTextView doc={body.value as TiptapDoc} />
      {body.isFallback ? <FallbackBadge /> : null}
    </Frame>
  );
}
