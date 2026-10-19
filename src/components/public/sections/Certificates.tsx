import { useTranslations } from "next-intl";
import { Frame } from "./Frame";
import { Localized } from "@/components/public/Localized";
import { MediaImage } from "@/components/public/MediaImage";
import { formatDate, safeHref } from "@/lib/content/format";
import type { Certificate, Section } from "@/lib/content/queries";
import { pick, type Locale } from "@/lib/locale/pick";
import { mediaUrl } from "@/lib/media/url";

export function Certificates({
  section,
  certificates,
  locale,
}: {
  section: Section;
  certificates: Certificate[];
  locale: Locale;
}) {
  const t = useTranslations();
  if (certificates.length === 0) return null;
  return (
    <Frame section={section} locale={locale} fallbackTitle={t("sections.certificates")}>
      <ul className="grid gap-4 md:grid-cols-2">
        {certificates.map((c) => {
          const link = safeHref(c.credential_url);
          const file = mediaUrl(c.file_path);
          return (
            <li key={c.id} className="overflow-hidden rounded-card border border-border bg-surface">
              <MediaImage path={c.image_path} alt={String(pick(c, "title", locale).value ?? "")} />
              <div className="space-y-1 p-4">
                <h3 className="font-semibold">
                  <Localized row={c} field="title" locale={locale} />
                </h3>
                <p className="text-sm text-muted">
                  {c.issuer}
                  {c.issued_on ? ` | ${formatDate(c.issued_on, locale)}` : ""}
                </p>
                <div className="flex gap-3 text-sm">
                  {link ? (
                    <a href={link} rel="noopener noreferrer" className="text-accent underline">
                      {t("certificate.credential")}
                    </a>
                  ) : null}
                  {file ? (
                    <a href={file} className="text-accent underline">
                      {t("certificate.file")}
                    </a>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Frame>
  );
}
