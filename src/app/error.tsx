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
    <main className="mx-auto flex min-h-dvh max-w-lg items-center px-4 py-10">
      <Plate className="w-full">
        <h1 className="stamp text-[32px] leading-none">Could not load the plate</h1>
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
