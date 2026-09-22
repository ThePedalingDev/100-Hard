"use client";

import { useRouter } from "next/navigation";
import { setActiveChallengeAction } from "@/lib/actions/challenge";
import { InviteShare } from "@/components/invite-share";
import { Button, Plate } from "@/components/plate";
import { SpoonIcon } from "@/components/icons";
import { formatStampDate } from "@/lib/challenge";
import { challengeLifecycleStatus } from "@/lib/challenge-dates";
import { usePlatePending } from "@/components/route-progress";
import type { MembershipSummary } from "@/lib/data";

export type RosterMember = MembershipSummary["members"][number] & { avatarUrl: string | null };

export type RosterMembership = Omit<MembershipSummary, "members"> & {
  members: RosterMember[];
};

export function ChallengeRoster({
  memberships,
  activeId,
  today,
}: {
  memberships: RosterMembership[];
  activeId: string | null;
  today: string;
}) {
  const router = useRouter();
  const { pending, start, leave } = usePlatePending();

  if (memberships.length === 0) {
    return (
      <Plate>
        <p className="text-sm leading-6 text-steel">No challenges yet. Create one or join with a code.</p>
      </Plate>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {memberships.map((membership) => {
        const { challenge } = membership;
        const active = challenge.id === activeId;
        const status = challengeLifecycleStatus(challenge.start_date, challenge.end_date, today);
        return (
          <Plate key={challenge.id} as="article" className={active ? "plate-proof" : undefined}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[18px] leading-none">{challenge.name}</h2>
                <p className="mt-2 text-sm leading-6 text-steel">
                  {formatStampDate(challenge.start_date)} — {formatStampDate(challenge.end_date)}
                </p>
              </div>
              <p className="stamp shrink-0 text-[11px] text-mark">{active ? "Active" : labelFor(status)}</p>
            </div>
            <ul className="mt-4 space-y-3">
              {membership.members.map((member) => (
                <li key={member.profile.id} className="flex items-center gap-3">
                  {member.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.avatarUrl}
                      alt=""
                      className="size-10 rounded-plate border border-steel/40 object-cover"
                    />
                  ) : (
                    <span className="stamp grid size-10 place-items-center rounded-plate border border-steel/40 text-[11px] text-mark">
                      {member.profile.display_name.slice(0, 1)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] leading-none font-semibold tracking-[-0.03em]">
                      {member.profile.display_name}
                    </p>
                    <p className="stamp mt-1 inline-flex items-center gap-2 text-[11px] text-steel">
                      {member.stats.perfectDays} perfect
                      <span className="inline-flex items-center gap-1 text-mark">
                        <SpoonIcon className="size-3.5" />
                        {member.stats.spoons}
                      </span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <InviteShare code={challenge.invite_code} />
            </div>
            {!active ? (
              <Button
                className="mt-4 w-full"
                variant="ghost"
                pending={pending}
                onClick={() => {
                  if (pending) return;
                  start(async () => {
                    const result = await setActiveChallengeAction(challenge.id);
                    if (result.ok) leave(result.next ?? "/dashboard", router);
                  });
                }}
              >
                Switch to this challenge
              </Button>
            ) : null}
          </Plate>
        );
      })}
    </div>
  );
}

function labelFor(status: string) {
  if (status === "pending") return "Pending";
  if (status === "complete") return "Complete";
  return "Open";
}
