import { LoginForm } from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="grid flex-1 place-items-center p-6">
      <div className="w-full max-w-sm space-y-6 rounded-poster border border-border bg-surface p-7 shadow-poster backdrop-blur">
        <div className="space-y-2 text-center">
          <p className="hero-heading text-4xl font-black uppercase leading-none tracking-tight">Sakda</p>
          <h1 className="text-lg font-semibold">เข้าสู่ระบบหลังบ้าน</h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
