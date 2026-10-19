import { Kanit, Noto_Sans_Thai } from "next/font/google";

// Admin panel face.
export const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
});

// Public site face (Thai and Latin), from the light body text up to the black display headings.
export const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});
