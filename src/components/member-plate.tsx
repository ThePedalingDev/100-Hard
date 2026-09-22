import Link from "next/link";
import { SpoonIcon } from "@/components/icons";
import { Plate, StatusMark } from "@/components/plate";
import type { MemberView } from "@/lib/data";

export function MemberPlate({
  member,
  mine,
  avatarUrl,
}: {
  member: MemberView;
  mine: boolean;
  avatarUrl: string | null;
}) {
  const todayStatus = member.checkin?.finalized_at ? member.checkin.status : "pending";

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
            <span className="stamp flex size-full items-center justify-center text-[18px] text-brass">
              {member.profile.display_name.slice(0, 1)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="truncate text-[18px] leading-none">{member.profile.display_name}</h2>
            {mine ? <p className="stamp shrink-0 text-[11px] text-brass">You</p> : null}
          </div>
          <div className="mt-3">
            <StatusMark status={todayStatus} />
          </div>
        </div>
      </div>

      {member.profile.diet_commitment ? (
        <p className="mt-5 text-sm leading-6 text-steel">{member.profile.diet_commitment}</p>
      ) : null}

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-steel/20 pt-5">
        <Stat value={member.stats.perfectDays} label="Perfect days" />
        <Stat value={`${member.stats.completion}%`} label="Completion" />
        <Stat value={member.stats.streak} label="Current streak" />
        <Stat value={member.stats.longest} label="Longest streak" />
        <div>
          <dt className="stamp text-[11px] text-steel">Spoons</dt>
          <dd className="stamp mt-2 flex items-center gap-1 text-[32px] leading-none tabular text-brass">
            <SpoonIcon className="size-5" />
            {member.stats.spoons}
          </dd>
        </div>
      </dl>

      <Link
        href="/calendar"
        className="stamp-press mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-plate border border-steel/50 px-5 text-[15px] font-bold tracking-[-0.01em] hover:border-club"
      >
        View days
      </Link>
    </Plate>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <dt className="stamp text-[11px] text-steel">{label}</dt>
      <dd className="stamp mt-2 text-[32px] leading-none tabular">{value}</dd>
    </div>
  );
}
