import type { CSSProperties } from "react";
import { SpoonIcon } from "@/components/icons";
import type { MemberView } from "@/lib/data";

type ScaleMark = {
  day: number;
  percent: number;
  label: string;
  edge: "start" | "mid" | "end";
};

function ticks(totalDays: number): ScaleMark[] {
  const length = Math.max(totalDays, 1);
  const marks: ScaleMark[] = [{ day: 1, percent: 0, label: "Start", edge: "start" }];
  for (let day = 25; day < length; day += 25) {
    const percent = (day / length) * 100;
    if (percent >= 92) continue;
    marks.push({ day, percent, label: `${day}`, edge: "mid" });
  }
  marks.push({ day: length, percent: 100, label: "End", edge: "end" });
  return marks;
}

function pinLeft(perfectDays: number, totalDays: number) {
  const percent = (perfectDays / Math.max(totalDays, 1)) * 100;
  return `${Math.min(Math.max(percent, 6), 94)}%`;
}

export function RaceRack({
  members,
  totalDays,
  userId,
  avatars,
}: {
  members: MemberView[];
  totalDays: number;
  userId?: string;
  avatars?: Map<string, string | null>;
}) {
  const scale = ticks(totalDays);
  const ranked = [...members].sort((a, b) => {
    const byDays = b.stats.perfectDays - a.stats.perfectDays;
    if (byDays !== 0) return byDays;
    return a.profile.display_name.localeCompare(b.profile.display_name);
  });

  return (
    <div className="space-y-5">
      <div className="relative h-4 px-6">
        {scale.map((mark) => (
          <p
            key={mark.day}
            className={`stamp absolute top-0 text-[10px] text-steel ${
              mark.edge === "start" ? "left-0" : mark.edge === "end" ? "right-0" : "-translate-x-1/2"
            }`}
            style={mark.edge === "mid" ? { left: `${mark.percent}%` } : undefined}
          >
            {mark.label}
          </p>
        ))}
      </div>
      {ranked.map((member, index) => {
        const mine = member.profile.id === userId;
        const avatar = avatars?.get(member.profile.id) ?? null;
        return (
          <div key={member.profile.id} className="space-y-2">
            <div className="flex items-end justify-between gap-3">
              <p className="min-w-0 truncate text-[16px] leading-none font-semibold tracking-[-0.03em]">
                <span className="stamp mr-2 text-[11px] text-steel">{index + 1}</span>
                {mine ? "You" : member.profile.display_name}
              </p>
              <p className="stamp shrink-0 tabular text-[11px] text-steel">
                {member.stats.perfectDays} perfect
              </p>
            </div>
            <div className="relative h-11 rounded-plate border border-steel/35 bg-graphite">
              <div className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-steel/40" />
              {scale.map((mark) => (
                <span
                  key={mark.day}
                  className="absolute top-1.5 bottom-1.5 w-px bg-signal/70"
                  style={{ left: `${Math.min(Math.max(mark.percent, 2), 98)}%` }}
                  aria-hidden="true"
                />
              ))}
              <div
                className="pin-rail"
                style={{ "--pin-x": pinLeft(member.stats.perfectDays, totalDays) } as CSSProperties}
              >
                <div
                  className={`pin-slide absolute top-1/2 size-9 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-plate border-2 bg-iron ${
                    mine ? "z-10 border-brass" : "border-steel/55"
                  }`}
                  title={`${member.profile.display_name}: ${member.stats.perfectDays} perfect`}
                >
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar} alt="" width={36} height={36} className="size-full object-cover" />
                  ) : (
                    <span className="stamp flex size-full items-center justify-center text-[11px] text-mark">
                      {member.profile.display_name.slice(0, 1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-steel">
              <p className="stamp text-[11px]">{member.stats.streak} day streak</p>
              <p className="stamp inline-flex items-center gap-1 text-[11px] text-mark">
                <SpoonIcon className="size-3.5" />
                {member.stats.spoons}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
