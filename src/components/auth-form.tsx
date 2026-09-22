"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAction, registerAction, resetPasswordAction } from "@/lib/actions/auth";
import { PlateMark } from "@/components/art";
import { Button, Field, Plate, TextInput } from "@/components/plate";
import { useToast } from "@/components/toast";
import { usePlatePending } from "@/components/route-progress";

export function AuthForm({ mode }: { mode: "login" | "register" | "forgot" }) {
  const router = useRouter();
  const toast = useToast();
  const { pending, start, leave } = usePlatePending();

  return (
    <Plate className="mx-auto w-full max-w-md">
      <div className="mb-1 flex items-center gap-3">
        <PlateMark size={48} />
        <h1 className="text-[32px] leading-none">100 Hard</h1>
      </div>
      <p className="mt-2 text-sm text-steel">
        {mode === "login"
          ? "Sign in to the private two-person challenge."
          : mode === "register"
            ? "Create an account for the private two-person challenge."
            : "Reset the password for this private challenge."}{" "}
        Ends <span className="tabular font-bold text-offwhite">31 December 2026</span>.
      </p>
      <form
        className="mt-6 space-y-4"
        aria-busy={pending}
        onSubmit={(event) => {
          event.preventDefault();
          if (pending) return;
          const formData = new FormData(event.currentTarget);
          start(async () => {
            const result =
              mode === "login"
                ? await loginAction(formData)
                : mode === "register"
                  ? await registerAction(formData)
                  : await resetPasswordAction(formData);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            if (result.next) {
              leave(result.next, router);
              return;
            }
            if (mode === "forgot") {
              toast.success("If that email exists, a reset link is on its way.");
            }
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
        <Button type="submit" pending={pending} className="w-full">
          {mode === "login" ? "Enter the plate" : mode === "register" ? "Register" : "Send reset link"}
        </Button>
      </form>
      <div className="mt-5 space-y-2 text-sm text-steel">
        {mode !== "login" ? (
          <p>
            Already in?{" "}
            <Link className="inline-flex min-h-11 items-center py-1 text-offwhite underline underline-offset-4" href="/login">
              Sign in
            </Link>
          </p>
        ) : null}
        {mode !== "register" ? (
          <p>
            New here?{" "}
            <Link className="inline-flex min-h-11 items-center py-1 text-offwhite underline underline-offset-4" href="/register">
              Create an account
            </Link>
          </p>
        ) : null}
        {mode !== "forgot" ? (
          <p>
            Forgot password?{" "}
            <Link className="inline-flex min-h-11 items-center py-1 text-offwhite underline underline-offset-4" href="/forgot-password">
              Reset it
            </Link>
          </p>
        ) : null}
      </div>
    </Plate>
  );
}
