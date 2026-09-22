import { SpoonIcon } from "@/components/icons";
import { Plate } from "@/components/plate";
import type { MemberView } from "@/lib/data";

export function Leaderboard({
  members,
  userId,
}: {
  members: MemberView[];
  userId: string;
}) {
  const ranked = [...members].sort((a, b) => {
    const byDays = b.stats.perfectDays - a.stats.perfectDays;
    if (byDays !== 0) return byDays;
    return a.profile.display_name.localeCompare(b.profile.display_name);
  });

  return (
    <Plate>
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-[18px] leading-none text-offwhite">Leaderboard</h2>
        <p className="stamp text-[11px] text-steel">Perfect days</p>
      </div>
      <ol className="space-y-3">
        {ranked.map((member, index) => {
          const mine = member.profile.id === userId;
          return (
            <li
              key={member.profile.id}
              className={`flex items-center justify-between gap-3 rounded-plate border px-3 py-3 ${
                mine ? "border-brass" : "border-steel/20"
              }`}
            >
              <div className="min-w-0">
                <p className="stamp text-[11px] text-steel">{index + 1}</p>
                <p className="mt-1 truncate text-[16px] leading-none font-semibold tracking-[-0.03em]">
                  {mine ? "You" : member.profile.display_name}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="stamp tabular text-[16px] leading-none">{member.stats.perfectDays}</p>
                <p className="stamp mt-1 inline-flex items-center gap-1 text-[11px] text-brass">
                  <SpoonIcon className="size-3.5" />
                  {member.stats.spoons}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </Plate>
  );
}
