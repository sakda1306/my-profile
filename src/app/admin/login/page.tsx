import { LoginForm } from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto w-full max-w-sm p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">เข้าสู่ระบบหลังบ้าน</h1>
      <LoginForm />
    </main>
  );
}
