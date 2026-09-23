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

function pinPercent(perfectDays: number, totalDays: number) {
  return Math.min(Math.max((perfectDays / Math.max(totalDays, 1)) * 100, 4), 96);
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
  const leaderDays = ranked[0]?.stats.perfectDays ?? 0;

  return (
    <div className="race-rack space-y-4">
      <div className="race-scale" aria-hidden="true">
        <div className="race-scale-track">
          {scale.map((mark) => (
            <span
              key={mark.day}
              className={`race-scale-tick ${mark.edge === "start" ? "is-start" : mark.edge === "end" ? "is-end" : ""}`}
              style={mark.edge === "mid" ? { left: `${mark.percent}%` } : undefined}
            />
          ))}
        </div>
        <div className="race-scale-labels">
          {scale.map((mark) => (
            <p
              key={mark.day}
              className={`stamp race-scale-label ${mark.edge === "start" ? "is-start" : mark.edge === "end" ? "is-end" : ""}`}
              style={mark.edge === "mid" ? { left: `${mark.percent}%` } : undefined}
            >
              {mark.label}
            </p>
          ))}
        </div>
      </div>

      <ol className="race-lanes space-y-4">
        {ranked.map((member, index) => {
          const mine = member.profile.id === userId;
          const avatar = avatars?.get(member.profile.id) ?? null;
          const progress = pinPercent(member.stats.perfectDays, totalDays);
          const leading = member.stats.perfectDays === leaderDays && leaderDays > 0;

          return (
            <li key={member.profile.id} className={`race-lane${mine ? " is-you" : ""}${leading ? " is-leading" : ""}`}>
              <div className="race-lane-head">
                <div className="race-lane-meta">
                  <span className="race-rank stamp tabular">{index + 1}</span>
                  <p className="race-name truncate">{mine ? "You" : member.profile.display_name}</p>
                </div>
                <p className="stamp race-perfect tabular">{member.stats.perfectDays} perfect</p>
              </div>

              <div
                className="race-track"
                style={{ "--race-progress": `${progress}%` } as CSSProperties}
                aria-label={`${member.profile.display_name}: ${member.stats.perfectDays} of ${totalDays} perfect days`}
              >
                <div className="race-track-fill" aria-hidden="true" />
                {scale.map((mark) => (
                  <span
                    key={mark.day}
                    className="race-track-tick"
                    style={{ left: `${Math.min(Math.max(mark.percent, 2), 98)}%` }}
                    aria-hidden="true"
                  />
                ))}
                <div
                  className="pin-rail"
                  style={{ "--pin-x": `${progress}%` } as CSSProperties}
                >
                  <div
                    className={`pin-slide race-pin${mine ? " is-you" : ""}${leading ? " is-leading" : ""}`}
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

              <div className="race-lane-foot">
                <p className="stamp race-streak tabular">{member.stats.streak} day streak</p>
                <p className="stamp race-spoons inline-flex items-center gap-1 tabular">
                  <SpoonIcon className="size-3.5" />
                  {member.stats.spoons}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
