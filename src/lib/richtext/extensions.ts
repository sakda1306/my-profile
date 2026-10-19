import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";

// One extension set for the editor (browser) and for rendering (server), so both agree on
// what a document may contain. StarterKit already bundles Link, so Link is configured here.
export function richTextExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      link: {
        openOnClick: false,
        autolink: true,
        protocols: ["http", "https", "mailto"],
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      },
    }),
    Image.configure({ HTMLAttributes: { loading: "lazy", alt: "" } }),
  ];
}
