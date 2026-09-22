"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createChallengeAction, joinChallengeAction } from "@/lib/actions/challenge";
import { Button, ErrorBanner, Field, Plate, TextInput } from "@/components/plate";

export default function OnboardingChallengePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-5 px-4 py-10">
      <Plate>
        <h1 className="stamp text-[32px] leading-none">Open the challenge</h1>
        <p className="mt-2 text-sm text-steel">
          First person creates it. Second person joins with the invite code. Two members only.
        </p>
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            start(async () => {
              setError(null);
              const result = await createChallengeAction(formData);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              if (result.next) {
                router.push(result.next);
                router.refresh();
              }
            });
          }}
        >
          <Field label="Challenge name" htmlFor="name">
            <TextInput id="name" name="name" defaultValue="100 Hard" />
          </Field>
          <p className="text-sm text-steel">22 September 2026 — 31 December 2026 · Africa/Johannesburg</p>
          <Button type="submit" disabled={pending} className="w-full">
            Create challenge
          </Button>
        </form>
      </Plate>
      <Plate>
        <h2 className="stamp text-[22px]">Join with a code</h2>
        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            start(async () => {
              setError(null);
              const result = await joinChallengeAction(formData);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              if (result.next) {
                router.push(result.next);
                router.refresh();
              }
            });
          }}
        >
          <Field label="Invite code" htmlFor="invite_code">
            <TextInput id="invite_code" name="invite_code" required />
          </Field>
          <Button type="submit" variant="ghost" disabled={pending} className="w-full">
            Join
          </Button>
        </form>
      </Plate>
      {error ? <ErrorBanner message={error} /> : null}
    </main>
  );
}
