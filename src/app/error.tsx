"use client";

import { useTransition } from "react";
import { Button, Plate } from "@/components/plate";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [pending, start] = useTransition();

  return (
    <main className="auth-shell mx-auto flex max-w-lg items-center">
      <Plate className="w-full">
        <h1 className="text-[32px] leading-none">Could not load the plate</h1>
        <p className="mt-2 text-sm text-steel">
          The server failed while rendering this screen. Try again.
        </p>
        <Button
          type="button"
          className="mt-6 w-full"
          pending={pending}
          onClick={() => start(() => reset())}
        >
          Try again
        </Button>
      </Plate>
    </main>
  );
}
