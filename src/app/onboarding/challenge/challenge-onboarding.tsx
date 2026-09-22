"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createChallengeAction, joinChallengeAction } from "@/lib/actions/challenge";
import { Button, ErrorBanner, Field, Plate, TextInput } from "@/components/plate";
import { usePlatePending } from "@/components/route-progress";

export function ChallengeOnboarding({ today }: { today: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { pending, start, leave } = usePlatePending();

  return (
    <main className="auth-shell mx-auto flex max-w-lg flex-col justify-center gap-5">
      <Plate>
        <h1 className="text-[32px] leading-none">Open the challenge</h1>
        <p className="mt-2 text-sm text-steel">
          Create a challenge with your own start and end dates, or join with a code. Up to 12 members. You can belong to more than one.
        </p>
        <form
          className="mt-5 space-y-4"
          aria-busy={pending}
          onSubmit={(event) => {
            event.preventDefault();
            if (pending) return;
            const formData = new FormData(event.currentTarget);
            start(async () => {
              setError(null);
              const result = await createChallengeAction(formData);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              leave(result.next ?? "/dashboard", router);
            });
          }}
        >
          <Field label="Challenge name" htmlFor="name">
            <TextInput id="name" name="name" defaultValue="100 Hard" />
          </Field>
          <Field label="Start date" htmlFor="start_date">
            <TextInput id="start_date" name="start_date" type="date" required defaultValue={today} />
          </Field>
          <Field label="End date" htmlFor="end_date">
            <TextInput id="end_date" name="end_date" type="date" required />
          </Field>
          <p className="text-sm leading-6 text-steel">Timezone Africa/Johannesburg. Start today or later. End after start.</p>
          <Button type="submit" pending={pending} className="w-full">
            Create challenge
          </Button>
        </form>
      </Plate>
      <Plate id="join">
        <h2 className="text-[22px] leading-none">Join with a code</h2>
        <form
          className="mt-4 space-y-4"
          aria-busy={pending}
          onSubmit={(event) => {
            event.preventDefault();
            if (pending) return;
            const formData = new FormData(event.currentTarget);
            start(async () => {
              setError(null);
              const result = await joinChallengeAction(formData);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              leave(result.next ?? "/dashboard", router);
            });
          }}
        >
          <Field label="Invite code" htmlFor="invite_code">
            <TextInput id="invite_code" name="invite_code" required />
          </Field>
          <Button type="submit" variant="ghost" pending={pending} className="w-full">
            Join
          </Button>
        </form>
      </Plate>
      {error ? <ErrorBanner message={error} /> : null}
    </main>
  );
}
