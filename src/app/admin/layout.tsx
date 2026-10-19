import type { Metadata } from "next";
import { kanit } from "@/app/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "หลังบ้าน",
  robots: { index: false, follow: false },
};

// Same night theme and Kanit face as the public site; data-admin scopes the form styles in admin-panel.css.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" data-theme="night" data-admin="" className={`${kanit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
