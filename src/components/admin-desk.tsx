"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteChallengeAdminAction, updateChallengeAdminAction } from "@/lib/actions/admin";
import { Button, ErrorBanner, Field, Plate, TextInput } from "@/components/plate";
import { usePlatePending } from "@/components/route-progress";
import type { Challenge } from "@/lib/supabase/types";

export type AdminAccount = {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  active_challenge_id: string | null;
};

export function AdminDesk({
  accounts,
  challenges,
}: {
  accounts: AdminAccount[];
  challenges: Challenge[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { pending, start } = usePlatePending();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {error ? <ErrorBanner message={error} /> : null}
      <Plate>
        <h2 className="text-[18px] leading-none">Accounts</h2>
        {accounts.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-steel">No accounts yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {accounts.map((account) => (
              <li key={account.id} className="border-t border-steel/20 pt-4 first:border-t-0 first:pt-0">
                <p className="text-[16px] leading-none font-semibold tracking-[-0.03em]">
                  {account.display_name ?? "No display name"}
                </p>
                <p className="mt-2 text-sm leading-6 text-steel">{account.email ?? "No email"}</p>
                <p className="stamp mt-1 text-[11px] text-steel">
                  {new Date(account.created_at).toISOString().slice(0, 10)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Plate>
      {challenges.length === 0 ? (
        <Plate>
          <p className="text-sm leading-6 text-steel">No challenges in the ledger.</p>
        </Plate>
      ) : null}
      {challenges.map((challenge) => (
        <Plate key={challenge.id} as="article">
          <h2 className="text-[18px] leading-none">{challenge.name}</h2>
          <p className="stamp mt-2 text-[11px] text-steel">{challenge.invite_code}</p>
          <form
            className="mt-4 space-y-4"
            aria-busy={pending}
            onSubmit={(event) => {
              event.preventDefault();
              if (pending) return;
              const formData = new FormData(event.currentTarget);
              start(async () => {
                setError(null);
                const result = await updateChallengeAdminAction(formData);
                if (!result.ok) setError(result.error);
                else router.refresh();
              });
            }}
          >
            <input type="hidden" name="challenge_id" value={challenge.id} />
            <Field label="Name" htmlFor={`name-${challenge.id}`}>
              <TextInput id={`name-${challenge.id}`} name="name" required defaultValue={challenge.name} />
            </Field>
            <Field label="Start date" htmlFor={`start-${challenge.id}`}>
              <TextInput
                id={`start-${challenge.id}`}
                name="start_date"
                type="date"
                required
                defaultValue={challenge.start_date}
              />
            </Field>
            <Field label="End date" htmlFor={`end-${challenge.id}`}>
              <TextInput
                id={`end-${challenge.id}`}
                name="end_date"
                type="date"
                required
                defaultValue={challenge.end_date}
              />
            </Field>
            <Button type="submit" pending={pending} className="w-full">
              Save challenge
            </Button>
          </form>
          {confirmId === challenge.id ? (
            <form
              className="mt-3"
              onSubmit={(event) => {
                event.preventDefault();
                if (pending) return;
                const formData = new FormData();
                formData.set("challenge_id", challenge.id);
                start(async () => {
                  setError(null);
                  const result = await deleteChallengeAdminAction(formData);
                  if (!result.ok) setError(result.error);
                  else router.refresh();
                  setConfirmId(null);
                });
              }}
            >
              <Button type="submit" variant="danger" pending={pending} className="w-full">
                Confirm delete
              </Button>
            </form>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="mt-3 w-full"
              pending={pending}
              onClick={() => setConfirmId(challenge.id)}
            >
              Delete challenge
            </Button>
          )}
        </Plate>
      ))}
    </div>
  );
}
