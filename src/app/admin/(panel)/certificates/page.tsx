import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { CertificateList } from "./CertificateList";

export default async function CertificatesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("certificates")
    .select("id, title_th, title_en, issuer, is_visible")
    .order("sort_order", { ascending: true });
  const items = (data ?? []).map((c) => ({
    id: c.id,
    title: c.title_th || c.title_en,
    issuer: c.issuer,
    is_visible: c.is_visible,
  }));

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">ใบประกาศ</h1>
        <Link href="/admin/certificates/new">เพิ่มใบประกาศ</Link>
      </div>
      {items.length === 0 ? (
        <p className="text-muted">ยังไม่มีรายการ</p>
      ) : (
        <CertificateList items={items} />
      )}
    </main>
  );
}
