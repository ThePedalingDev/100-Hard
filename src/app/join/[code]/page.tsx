"use client";

import { use, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinChallengeAction } from "@/lib/actions/challenge";
import { Button, ErrorBanner, Plate } from "@/components/plate";

export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg items-center px-4 py-10">
      <Plate className="w-full">
        <h1 className="stamp text-[32px] leading-none">Join 100 Hard</h1>
        <p className="mt-2 text-sm text-steel">Invite code {code}</p>
        <Button
          className="mt-6 w-full"
          disabled={pending}
          onClick={() => {
            const formData = new FormData();
            formData.set("invite_code", code);
            start(async () => {
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
          Join this challenge
        </Button>
        {error ? <div className="mt-4"><ErrorBanner message={error} /></div> : null}
      </Plate>
    </main>
  );
}
