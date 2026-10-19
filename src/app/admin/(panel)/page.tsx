import Link from "next/link";
import { AdminIcon, type AdminIconName } from "@/components/admin/AdminIcon";
import { requireAdmin } from "@/lib/auth/require-admin";

// Every admin page reads the session per request, so navigations block on the server.
export const instant = false;

type Card = {
  href: string;
  label: string;
  hint: string;
  icon: AdminIconName;
  table?: "sections" | "skills" | "projects" | "certificates" | "posts";
};

const CARDS: Card[] = [
  { href: "/admin/profile", label: "โปรไฟล์", hint: "ชื่อ ประวัติ รูปหน้าแรก ช่องทางติดต่อ", icon: "profile" },
  { href: "/admin/sections", label: "หมวด", hint: "ลำดับและการแสดงผลของแต่ละส่วน", icon: "sections", table: "sections" },
  { href: "/admin/skills", label: "ความสามารถ", hint: "ภาษา เฟรมเวิร์ก และเครื่องมือ", icon: "skills", table: "skills" },
  { href: "/admin/projects", label: "โปรเจกต์", hint: "ผลงาน รูปภาพ และลิงก์", icon: "projects", table: "projects" },
  { href: "/admin/certificates", label: "ใบประกาศ", hint: "เกียรติบัตรและใบรับรอง", icon: "certificates", table: "certificates" },
  { href: "/admin/posts", label: "บทความ", hint: "เขียนและเผยแพร่บล็อก", icon: "posts", table: "posts" },
];

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();
  const counts = await Promise.all(
    CARDS.map(async (c) => {
      if (!c.table) return null;
      const { count } = await supabase.from(c.table).select("id", { count: "exact", head: true });
      return count ?? 0;
    }),
  );

  return (
    <main className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-widest text-ember">ยินดีต้อนรับกลับมา</p>
        <h1 className="hero-heading text-4xl font-black uppercase leading-none tracking-tight md:text-6xl">แดชบอร์ด</h1>
        <p className="text-muted">เลือกส่วนที่ต้องการแก้ไข การเปลี่ยนแปลงจะขึ้นบนหน้าเว็บทันทีที่บันทึก</p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c, i) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-poster border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-smoke/50 hover:shadow-poster"
            >
              <span aria-hidden="true" className="poster-bg pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-60" />
              <span className="relative flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-indigo/60 text-ember-hot">
                  <AdminIcon name={c.icon} />
                </span>
                {counts[i] !== null ? (
                  <span className="text-4xl font-black leading-none text-ice">{counts[i]}</span>
                ) : null}
              </span>
              <span className="relative">
                <span className="block text-lg font-semibold">{c.label}</span>
                <span className="mt-1 block text-sm text-muted">{c.hint}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
