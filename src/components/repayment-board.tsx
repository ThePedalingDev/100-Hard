"use client";

import { useState, useTransition } from "react";
import { advanceRepaymentAction, requestRepaymentAction } from "@/lib/actions/spoons";
import { Button, ErrorBanner, Field, Plate, TextArea, TextInput } from "@/components/plate";
import type { SpoonRepayment } from "@/lib/supabase/types";

export function RepaymentBoard({
  finished,
  userId,
  partnerId,
  partnerName,
  repayments,
}: {
  finished: boolean;
  userId: string;
  partnerId: string | null;
  partnerName: string;
  repayments: SpoonRepayment[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <section className="space-y-3">
      <h2 className="stamp text-[18px]">Repayment</h2>
      {!finished ? (
        <Plate>
          <p className="text-sm text-steel">Repayment opens after 31 December. Until then the ledger only records the debt.</p>
        </Plate>
      ) : (
        <Plate>
          <p className="stamp text-[14px]">Time to pay the spoons</p>
          {partnerId ? (
            <form
              className="mt-4 space-y-3"
              aria-busy={pending}
              onSubmit={(event) => {
                event.preventDefault();
                if (pending) return;
                const formData = new FormData(event.currentTarget);
                start(async () => {
                  setError(null);
                  const result = await requestRepaymentAction(formData);
                  if (!result.ok) setError(result.error);
                });
              }}
            >
              <input type="hidden" name="debtor_user_id" value={partnerId} />
              <Field label={`Ask ${partnerName} to repay`} htmlFor="title">
                <TextInput id="title" name="title" required placeholder="Make breakfast" />
              </Field>
              <Field label="Description" htmlFor="description">
                <TextArea id="description" name="description" rows={2} />
              </Field>
              <Field label="Spoon cost" htmlFor="spoon_cost">
                <TextInput id="spoon_cost" name="spoon_cost" type="number" min={1} defaultValue={1} required />
              </Field>
              <Button type="submit" pending={pending}>
                Request repayment
              </Button>
            </form>
          ) : (
            <p className="mt-2 text-sm text-steel">Need a partner to request repayment.</p>
          )}
        </Plate>
      )}
      {repayments.map((row) => (
        <Plate key={row.id} as="article">
          <p className="stamp text-[14px]">{row.title}</p>
          <p className="mt-1 text-sm text-steel">
            Cost {row.spoon_cost} · {row.status}
          </p>
          {row.description ? <p className="mt-2 text-sm">{row.description}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {row.status === "requested" && row.debtor_user_id === userId ? (
              <Button
                pending={pending}
                onClick={() => {
                  if (pending) return;
                  start(async () => {
                    const result = await advanceRepaymentAction(row.id, "accepted");
                    if (!result.ok) setError(result.error);
                  });
                }}
              >
                Accept
              </Button>
            ) : null}
            {row.status === "accepted" && row.debtor_user_id === userId ? (
              <Button
                pending={pending}
                onClick={() => {
                  if (pending) return;
                  start(async () => {
                    const result = await advanceRepaymentAction(row.id, "completed");
                    if (!result.ok) setError(result.error);
                  });
                }}
              >
                Mark done
              </Button>
            ) : null}
            {row.status === "completed" && row.requested_by_user_id === userId ? (
              <Button
                pending={pending}
                onClick={() => {
                  if (pending) return;
                  start(async () => {
                    const result = await advanceRepaymentAction(row.id, "confirmed");
                    if (!result.ok) setError(result.error);
                  });
                }}
              >
                Confirm
              </Button>
            ) : null}
          </div>
        </Plate>
      ))}
      {error ? <ErrorBanner message={error} /> : null}
    </section>
  );
}
