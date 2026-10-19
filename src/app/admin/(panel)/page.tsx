import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminDashboardPage() {
  await requireAdmin();
  return (
    <main>
      <h1 className="text-2xl font-semibold">แดชบอร์ด</h1>
      <p>เลือกเมนูด้านบนเพื่อจัดการเนื้อหา</p>
    </main>
  );
}
