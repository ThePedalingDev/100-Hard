import Link from "next/link";
import { ProfileChallengePills } from "@/components/profile-challenge-pills";
import { MemberStatsGrid } from "@/components/member-stats-grid";
import { Plate, StatusMark } from "@/components/plate";
import type { MemberView } from "@/lib/data";
import { todayDisplayStatus } from "@/lib/scoring";

export function MemberPlate({
  member,
  mine,
  avatarUrl,
  challengeStart,
}: {
  member: MemberView;
  mine: boolean;
  avatarUrl: string | null;
  challengeStart: string;
}) {
  const todayStatus = todayDisplayStatus(member.checkin);

  return (
    <Plate as="article">
      <div className="flex items-start gap-4">
        <div
          className={`size-20 shrink-0 overflow-hidden rounded-plate border bg-graphite ${
            mine ? "border-brass" : "border-steel/40"
          }`}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="stamp flex size-full items-center justify-center text-[18px] text-mark">
              {member.profile.display_name.slice(0, 1)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="truncate text-[18px] leading-none">{member.profile.display_name}</h2>
            {mine ? <p className="stamp shrink-0 text-[11px] text-mark">You</p> : null}
          </div>
          <div className="mt-3 flex flex-col gap-3">
            <ProfileChallengePills stats={member.stats} />
            <StatusMark status={todayStatus} />
          </div>
        </div>
      </div>

      {member.profile.diet_commitment ? (
        <p className="mt-5 text-sm leading-6 text-steel">{member.profile.diet_commitment}</p>
      ) : null}

      <MemberStatsGrid stats={member.stats} challengeStart={challengeStart} mine={mine} />

      <Link
        href="/calendar"
        className="stamp-press mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-plate border border-steel/50 px-5 text-[15px] font-bold tracking-[-0.01em] hover:border-club"
      >
        View days
      </Link>
    </Plate>
  );
}
