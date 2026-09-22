import { Plate } from "@/components/plate";
import { RaceRack } from "@/components/race-rack";
import type { MemberView } from "@/lib/data";

export function HeadToHead({
  me,
  other,
  avatars,
  totalDays,
}: {
  me: MemberView;
  other: MemberView | null;
  avatars: { me: string | null; other: string | null };
  totalDays: number;
}) {
  const map = new Map<string, string | null>([[me.profile.id, avatars.me]]);
  if (other) map.set(other.profile.id, avatars.other);
  const members = other ? [me, other] : [me];

  return (
    <Plate>
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-[18px] leading-none text-offwhite">Head to head</h2>
        <p className="stamp text-[11px] text-steel">Start to End</p>
      </div>
      <RaceRack members={members} totalDays={totalDays} userId={me.profile.id} avatars={map} />
      {other ? null : (
        <p className="mt-4 text-sm text-steel">Invite your partner to put the second pin on the rack.</p>
      )}
    </Plate>
  );
}
