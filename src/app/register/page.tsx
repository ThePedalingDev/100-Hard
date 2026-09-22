import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="auth-shell mx-auto flex max-w-lg items-center">
      <AuthForm mode="register" />
    </main>
  );
}
