import { Cards } from "./sections/Cards";
import { Certificates } from "./sections/Certificates";
import { Contact } from "./sections/Contact";
import { Gallery } from "./sections/Gallery";
import { Hero } from "./sections/Hero";
import { LatestPosts } from "./sections/LatestPosts";
import { Projects } from "./sections/Projects";
import { RichText } from "./sections/RichText";
import { Skills } from "./sections/Skills";
import { Timeline } from "./sections/Timeline";
import type { HomeData } from "@/lib/content/queries";
import type { Locale } from "@/lib/locale/pick";

export function SectionRenderer({ data, locale }: { data: HomeData; locale: Locale }) {
  return (
    <>
      {data.sections.map((section) => {
        const items = data.itemsBySection[section.id] ?? [];
        switch (section.type) {
          case "hero":
            return (
              <Hero
                key={section.id}
                profile={data.profile}
                locale={locale}
                projects={data.projects}
                imagesByProject={data.imagesByProject}
                skills={data.skills}
              />
            );
          case "skills":
            return <Skills key={section.id} section={section} skills={data.skills} locale={locale} />;
          case "projects":
            return (
              <Projects
                key={section.id}
                section={section}
                projects={data.projects}
                imagesByProject={data.imagesByProject}
                locale={locale}
              />
            );
          case "certificates":
            return <Certificates key={section.id} section={section} certificates={data.certificates} locale={locale} />;
          case "latest_posts":
            return <LatestPosts key={section.id} section={section} posts={data.posts} locale={locale} />;
          case "contact":
            return <Contact key={section.id} section={section} profile={data.profile} locale={locale} />;
          case "rich_text":
            return <RichText key={section.id} section={section} locale={locale} />;
          case "gallery":
            return <Gallery key={section.id} section={section} items={items} locale={locale} />;
          case "cards":
            return <Cards key={section.id} section={section} items={items} locale={locale} />;
          case "timeline":
            return <Timeline key={section.id} section={section} items={items} locale={locale} />;
          default:
            return null;
        }
      })}
    </>
  );
}
