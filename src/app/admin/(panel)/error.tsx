"use client";

export default function AdminError({ retry }: { error: Error; retry: () => void }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl font-black tracking-tight md:text-4xl">เกิดข้อผิดพลาด</h1>
      <p className="mt-2 text-muted">
        ทำรายการไม่สำเร็จ อาจเพราะล็อกอินหมดอายุ ลองใหม่อีกครั้ง หากยังไม่ได้ให้ล็อกอินใหม่
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 rounded-full bg-accent px-6 py-2.5 font-semibold text-on-accent transition hover:brightness-110"
      >
        ลองใหม่
      </button>
    </main>
  );
}
