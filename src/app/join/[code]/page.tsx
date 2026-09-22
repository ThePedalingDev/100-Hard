"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { joinChallengeAction } from "@/lib/actions/challenge";
import { Button, ErrorBanner, Plate } from "@/components/plate";
import { usePlatePending } from "@/components/route-progress";

export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { pending, start, leave } = usePlatePending();

  return (
    <main className="auth-shell mx-auto flex max-w-lg items-center">
      <Plate className="w-full">
        <h1 className="text-[32px] leading-none">Join 100 Hard</h1>
        <p className="mt-2 text-sm text-steel">Invite code {code}</p>
        <Button
          className="mt-6 w-full"
          pending={pending}
          onClick={() => {
            if (pending) return;
            const formData = new FormData();
            formData.set("invite_code", code);
            start(async () => {
              const result = await joinChallengeAction(formData);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              leave(result.next ?? "/dashboard", router);
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
