import { Plate } from "@/components/plate";
import { RaceRack } from "@/components/race-rack";
import type { MemberView } from "@/lib/data";

export function Leaderboard({
  members,
  userId,
  totalDays,
  avatars,
}: {
  members: MemberView[];
  userId: string;
  totalDays: number;
  avatars?: Map<string, string | null>;
}) {
  return (
    <Plate>
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-[18px] leading-none text-offwhite">Leaderboard</h2>
        <p className="stamp text-[11px] text-steel">Start to End</p>
      </div>
      <RaceRack members={members} totalDays={totalDays} userId={userId} avatars={avatars} />
    </Plate>
  );
}
