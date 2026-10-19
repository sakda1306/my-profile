"use client";

export default function AdminError({ retry }: { error: Error; retry: () => void }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">เกิดข้อผิดพลาด</h1>
      <p className="mt-2 text-muted">
        ทำรายการไม่สำเร็จ อาจเพราะล็อกอินหมดอายุ ลองใหม่อีกครั้ง หากยังไม่ได้ให้ล็อกอินใหม่
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 rounded-card bg-accent px-4 py-2 text-on-accent"
      >
        ลองใหม่
      </button>
    </main>
  );
}
