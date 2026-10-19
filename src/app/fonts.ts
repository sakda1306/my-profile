import { Kanit } from "next/font/google";

// Site and admin face (Thai and Latin), from the light body text up to the black display headings.
export const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});
