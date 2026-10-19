import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { logoutAction } from "@/app/admin/login/actions";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin/profile", label: "โปรไฟล์" },
  { href: "/admin/sections", label: "หมวด" },
  { href: "/admin/skills", label: "ความสามารถ" },
  { href: "/admin/projects", label: "โปรเจกต์" },
  { href: "/admin/certificates", label: "ใบประกาศ" },
  { href: "/admin/posts", label: "บทความ" },
];

// Convention: the layout check alone does not protect pages (layout and page
// render in parallel). Every panel page and data loader must call
// requireAdmin(), and every server action must call requireAdminAction().
// Reads cookies, so it must stay inside a Suspense boundary (cacheComponents).
async function Guard({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b border-current/20 p-4">
        <Link href="/admin" className="font-semibold">
          หลังบ้าน
        </Link>
        <nav className="flex flex-wrap gap-4">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <a href="/th" target="_blank" rel="noopener noreferrer">
            ดูหน้าเว็บ
          </a>
        </nav>
        <form action={logoutAction} className="ml-auto">
          <button type="submit">ออกจากระบบ</button>
        </form>
      </header>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<p className="p-6">กำลังโหลด...</p>}>
      <Guard>{children}</Guard>
    </Suspense>
  );
}
