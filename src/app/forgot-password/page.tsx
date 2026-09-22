import { AuthForm } from "@/components/auth-form";

export default function ForgotPasswordPage() {
  return (
    <main className="auth-shell mx-auto flex w-full max-w-lg flex-col items-stretch justify-start">
      <AuthForm mode="forgot" />
    </main>
  );
}
