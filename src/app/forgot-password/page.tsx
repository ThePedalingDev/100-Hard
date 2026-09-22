import { AuthForm } from "@/components/auth-form";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg items-center px-4 py-10">
      <AuthForm mode="forgot" />
    </main>
  );
}
