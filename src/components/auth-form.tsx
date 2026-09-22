"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { loginAction, registerAction, resetPasswordAction } from "@/lib/actions/auth";
import { Button, ErrorBanner, Field, Plate, TextInput } from "@/components/plate";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthForm({ mode }: { mode: "login" | "register" | "forgot" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <Plate className="mx-auto w-full max-w-md">
      <div className="mb-1 flex items-start justify-between gap-3">
        <h1 className="stamp text-[32px] leading-none">100 Hard</h1>
        <ThemeToggle />
      </div>
      <p className="mt-2 text-sm text-steel">
        {mode === "login"
          ? "Sign in to the private two-person challenge."
          : mode === "register"
            ? "Create an account for the private two-person challenge."
            : "Reset the password for this private challenge."}{" "}
        Ends <span className="stamp tabular text-offwhite">31 December 2026</span>.
      </p>
      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          start(async () => {
            setError(null);
            setNotice(null);
            const result =
              mode === "login"
                ? await loginAction(formData)
                : mode === "register"
                  ? await registerAction(formData)
                  : await resetPasswordAction(formData);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            if (result.next) {
              router.push(result.next);
              router.refresh();
              return;
            }
            if (mode === "forgot") setNotice("If that email exists, a reset link is on its way.");
          });
        }}
      >
        <Field label="Email" htmlFor="email">
          <TextInput id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        {mode !== "forgot" ? (
          <Field label="Password" htmlFor="password">
            <TextInput
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={mode === "register" ? 8 : undefined}
            />
          </Field>
        ) : null}
        {error ? <ErrorBanner message={error} /> : null}
        {notice ? <p className="text-sm text-success">{notice}</p> : null}
        <Button type="submit" disabled={pending} className="w-full">
          {mode === "login" ? "Enter the plate" : mode === "register" ? "Register" : "Send reset link"}
        </Button>
      </form>
      <div className="mt-5 space-y-2 text-sm text-steel">
        {mode !== "login" ? (
          <p>
            Already in? <Link className="text-offwhite underline underline-offset-4" href="/login">Sign in</Link>
          </p>
        ) : null}
        {mode !== "register" ? (
          <p>
            New here? <Link className="text-offwhite underline underline-offset-4" href="/register">Create an account</Link>
          </p>
        ) : null}
        {mode !== "forgot" ? (
          <p>
            Forgot password? <Link className="text-offwhite underline underline-offset-4" href="/forgot-password">Reset it</Link>
          </p>
        ) : null}
      </div>
    </Plate>
  );
}
