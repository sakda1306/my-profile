import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { logoutAction } from "@/app/admin/login/actions";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Convention: the layout check alone does not protect pages (layout and page
// render in parallel). Every panel page and data loader must call
// requireAdmin(), and every server action must call requireAdminAction().
// Reads cookies, so it must stay inside a Suspense boundary (cacheComponents).
async function Guard({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="z-20 flex shrink-0 flex-col gap-4 border-b border-border bg-night-deep/70 p-4 backdrop-blur md:sticky md:top-0 md:h-svh md:w-64 md:gap-8 md:border-b-0 md:border-r md:p-6">
        <div className="flex items-center justify-between gap-3 md:block">
          <Link href="/admin" className="block">
            <span className="hero-heading block text-2xl font-black uppercase leading-none tracking-tight md:text-3xl">
              Sakda
            </span>
            <span className="mt-1 inline-block rounded-full bg-ember/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-ember">
              หลังบ้าน
            </span>
          </Link>
          <div className="flex items-center gap-1 md:hidden">
            <SiteLinks compact />
          </div>
        </div>
        <AdminNav />
        <div className="mt-auto hidden flex-col gap-1 border-t border-border pt-4 md:flex">
          <SiteLinks />
        </div>
      </aside>
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </div>
    </div>
  );
}

// "View site" and "Log out", as icon buttons on phones and full rows in the side menu.
function SiteLinks({ compact = false }: { compact?: boolean }) {
  const row = compact
    ? "grid size-9 place-items-center rounded-full text-muted hover:bg-ghost hover:text-fg"
    : "flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-muted transition hover:bg-ghost hover:text-fg";
  return (
    <>
      <a href="/th" target="_blank" rel="noopener noreferrer" className={row} title="ดูหน้าเว็บ">
        <AdminIcon name="external" className="size-[18px]" />
        {compact ? <span className="sr-only">ดูหน้าเว็บ</span> : "ดูหน้าเว็บ"}
      </a>
      <form action={logoutAction}>
        <button type="submit" className={row} title="ออกจากระบบ">
          <AdminIcon name="logout" className="size-[18px]" />
          {compact ? <span className="sr-only">ออกจากระบบ</span> : "ออกจากระบบ"}
        </button>
      </form>
    </>
  );
}

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<p className="p-6 text-muted">กำลังโหลด...</p>}>
      <Guard>{children}</Guard>
    </Suspense>
  );
}
