import { SpoonIcon } from "@/components/icons";
import { Plate } from "@/components/plate";
import { lanePercent } from "@/lib/data";
import type { MemberView } from "@/lib/data";

function Lane({
  member,
  avatarUrl,
}: {
  member: MemberView;
  avatarUrl: string | null;
}) {
  const left = `${Math.min(Math.max(lanePercent(member.stats.perfectDays), 4), 92)}%`;

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <p className="stamp text-[13px] text-offwhite">{member.profile.display_name}</p>
        <p className="stamp text-[11px] text-steel">{member.stats.perfectDays} perfect</p>
      </div>
      <div className="relative h-10 border border-steel/30 bg-graphite">
        <div className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-steel/50" />
        <div
          className="absolute top-1/2 size-9 -translate-x-1/2 -translate-y-1/2 overflow-hidden border border-brass bg-iron transition-[left] duration-300 ease-out"
          style={{ left, borderRadius: 8 }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" width={36} height={36} className="size-full object-cover" />
          ) : (
            <span className="stamp flex size-full items-center justify-center text-[12px] text-brass">
              {member.profile.display_name.slice(0, 1)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between text-steel">
        <p className="stamp text-[11px]">{member.stats.streak} day streak</p>
        <p className="stamp inline-flex items-center gap-1 text-[11px] text-brass">
          <SpoonIcon className="size-3.5" />
          {member.stats.spoons}
        </p>
      </div>
    </div>
  );
}

export function HeadToHead({
  me,
  other,
  avatars,
}: {
  me: MemberView;
  other: MemberView | null;
  avatars: { me: string | null; other: string | null };
}) {
  return (
    <Plate>
      <div className="mb-4 flex items-end justify-between">
        <h2 className="stamp text-[15px] text-offwhite">Head to head</h2>
        <p className="stamp text-[11px] text-steel">31 Dec</p>
      </div>
      <div className="space-y-6">
        <Lane member={me} avatarUrl={avatars.me} />
        {other ? <Lane member={other} avatarUrl={avatars.other} /> : (
          <p className="text-sm text-steel">Invite your partner to put the second pin on the rack.</p>
        )}
      </div>
    </Plate>
  );
}
