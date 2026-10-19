"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminIcon, type AdminIconName } from "./AdminIcon";

export const ADMIN_NAV: { href: string; label: string; icon: AdminIconName }[] = [
  { href: "/admin", label: "แดชบอร์ด", icon: "home" },
  { href: "/admin/profile", label: "โปรไฟล์", icon: "profile" },
  { href: "/admin/sections", label: "หมวด", icon: "sections" },
  { href: "/admin/skills", label: "ความสามารถ", icon: "skills" },
  { href: "/admin/projects", label: "โปรเจกต์", icon: "projects" },
  { href: "/admin/certificates", label: "ใบประกาศ", icon: "certificates" },
  { href: "/admin/posts", label: "บทความ", icon: "posts" },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

// Side menu on wide screens, a scrolling row of pills on phones.
export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="เมนูหลังบ้าน" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] md:mx-0 md:flex-col md:overflow-visible md:px-0 md:pb-0">
      {ADMIN_NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded-full px-4 py-2 text-sm transition md:rounded-xl md:py-2.5 ${
              active
                ? "bg-gradient-to-r from-indigo to-smoke/70 text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.15)]"
                : "text-muted hover:bg-ghost hover:text-fg"
            }`}
          >
            <AdminIcon name={item.icon} className={`size-[18px] ${active ? "text-ember-hot" : ""}`} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
