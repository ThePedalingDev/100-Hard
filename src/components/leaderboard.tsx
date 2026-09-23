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
  const leader = [...members].sort((a, b) => b.stats.perfectDays - a.stats.perfectDays)[0];

  return (
    <Plate>
      <div className="race-board-head mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[18px] leading-none text-offwhite">Leaderboard</h2>
          <p className="mt-2 text-sm text-steel">
            {leader
              ? `${leader.profile.id === userId ? "You lead" : leader.profile.display_name} with ${leader.stats.perfectDays} perfect day${leader.stats.perfectDays === 1 ? "" : "s"}`
              : "Perfect days decide the head-to-head"}
          </p>
        </div>
        <p className="stamp tabular text-[11px] text-steel">
          {totalDays} days · Start to End
        </p>
      </div>
      <RaceRack members={members} totalDays={totalDays} userId={userId} avatars={avatars} />
    </Plate>
  );
}
