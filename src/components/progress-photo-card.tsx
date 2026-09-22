"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deletePhotoAction } from "@/lib/actions/photos";
import { Button, Plate } from "@/components/plate";
import { useToast } from "@/components/toast";

export function ProgressPhotoCard({
  id,
  monthLabel,
  owner,
  url,
  caption,
  canRemove,
}: {
  id: string;
  monthLabel: string;
  owner: string | undefined;
  url: string | null;
  caption: string | null;
  canRemove: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();

  return (
    <Plate as="article">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[16px] leading-none font-semibold tracking-[-0.03em]">{monthLabel}</p>
          <p className="mt-2 text-sm leading-6 text-steel">{owner}</p>
        </div>
        {canRemove ? (
          <Button
            type="button"
            variant="danger"
            size="compact"
            pending={pending}
            className="shrink-0"
            onClick={() => {
              if (pending) return;
              start(async () => {
                const result = await deletePhotoAction(id);
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                toast.success("Plate removed");
                router.refresh();
              });
            }}
          >
            Remove
          </Button>
        ) : null}
      </div>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="mt-4 aspect-[4/3] w-full rounded-plate border border-steel/30 object-cover"
        />
      ) : (
        <p className="mt-3 text-sm text-failure">Could not open this photo.</p>
      )}
      {caption ? <p className="mt-2 text-sm">{caption}</p> : null}
    </Plate>
  );
}
