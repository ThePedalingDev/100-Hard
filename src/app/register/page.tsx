import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="auth-shell mx-auto flex w-full max-w-lg flex-col items-stretch justify-start">
      <AuthForm mode="register" />
    </main>
  );
}
