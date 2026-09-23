import Link from "next/link";
import { ProfileChallengePills } from "@/components/profile-challenge-pills";
import { Plate, StatusMark } from "@/components/plate";
import { formatShortDate, formatStampClock, formatStampDate } from "@/lib/challenge";
import type { MemberView } from "@/lib/data";
import { todayDisplayStatus, todayRingMetrics, type TodayRingMetric } from "@/lib/scoring";

const RING_LAYOUT: Array<{ id: TodayRingMetric["id"]; radius: number; stroke: number; tone: string }> = [
  { id: "diet", radius: 54, stroke: 8, tone: "activity-ring-diet" },
  { id: "workout", radius: 44, stroke: 8, tone: "activity-ring-workout" },
  { id: "water", radius: 34, stroke: 8, tone: "activity-ring-water" },
  { id: "bible", radius: 26, stroke: 8, tone: "activity-ring-bible" },
];

export function MemberRings({
  members,
  viewerId,
  avatars,
  date,
  isToday,
}: {
  members: MemberView[];
  viewerId: string;
  avatars: Map<string, string | null>;
  date: string;
  isToday: boolean;
}) {
  const others = [...members]
    .filter((member) => member.profile.id !== viewerId)
    .sort((a, b) => {
      const byDays = b.stats.perfectDays - a.stats.perfectDays;
      if (byDays !== 0) return byDays;
      return a.profile.display_name.localeCompare(b.profile.display_name);
    });
  const me = members.find((member) => member.profile.id === viewerId);
  const rack = me ? [...others, me] : others;

  return (
    <Plate>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[18px] leading-none">Activity rings</h2>
          <p className="stamp mt-2 text-[11px] text-steel">{isToday ? "Today" : formatStampDate(date)}</p>
        </div>
        <Link
          href="/profile/members"
          className="stamp-press inline-flex min-h-12 shrink-0 items-center rounded-plate border border-steel/40 px-4 text-[15px] font-bold tracking-[-0.01em] text-steel hover:border-club hover:text-offwhite"
        >
          Members
        </Link>
      </div>

      {rack.length === 0 ? (
        <p className="text-sm leading-6 text-steel">Invite someone from Profile to see their rings.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {rack.map((member) => (
            <MemberRing
              key={member.profile.id}
              member={member}
              mine={member.profile.id === viewerId}
              avatarUrl={avatars.get(member.profile.id) ?? null}
              date={date}
            />
          ))}
        </ul>
      )}
    </Plate>
  );
}

function MemberRing({
  member,
  mine,
  avatarUrl,
  date,
}: {
  member: MemberView;
  mine: boolean;
  avatarUrl: string | null;
  date: string;
}) {
  const status = todayDisplayStatus(member.checkin);
  const metrics = todayRingMetrics(member.checkin);
  const byId = new Map(metrics.map((metric) => [metric.id, metric]));

  return (
    <li>
      <article className="activity-member-card rounded-plate border border-steel/35 bg-well px-4 py-4 md:px-5">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="truncate text-[16px] leading-none font-semibold tracking-[-0.03em]">
              {mine ? "You" : member.profile.display_name}
            </h3>
            <ProfileChallengePills stats={member.stats} className="mt-2" />
          </div>
          <StatusMark status={status} />
        </div>

        <div className="activity-member-body">
          <ActivityRings metrics={metrics} mine={mine} avatarUrl={avatarUrl} />
          <dl className="activity-member-legend">
            {RING_LAYOUT.map(({ id, tone }) => {
              const metric = byId.get(id);
              if (!metric) return null;
              return (
                <div key={id} className="activity-legend-row">
                  <dt className={`stamp text-[11px] ${tone}`}>{metric.label}</dt>
                  <dd className={`tabular text-[15px] leading-none font-semibold tracking-[-0.02em] ${tone}`}>
                    {metric.current}
                    <span className="text-steel font-medium">/{metric.total}</span>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>

        <p className="stamp mt-3 tabular text-[11px] text-steel">
          {formatShortDate(date)}
          {member.checkin?.updated_at
            ? ` · ${formatStampClock(member.checkin.updated_at)}`
            : " · No stamp yet"}
          {" · "}
          {member.stats.completion}% challenge · {member.stats.perfectDays} perfect days
        </p>
      </article>
    </li>
  );
}

function ActivityRings({
  metrics,
  mine,
  avatarUrl,
}: {
  metrics: TodayRingMetric[];
  mine: boolean;
  avatarUrl: string | null;
}) {
  const byId = new Map(metrics.map((metric) => [metric.id, metric]));

  return (
    <div className="activity-rings" aria-hidden="true">
      <svg className="activity-rings-svg" viewBox="0 0 128 128">
        {RING_LAYOUT.map(({ id, radius, stroke, tone }) => {
          const progress = Math.min(Math.max(byId.get(id)?.progress ?? 0, 0), 1);
          const dashoffset = 100 - progress * 100;
          return (
            <g key={id} transform="rotate(-90 64 64)">
              <circle
                className="activity-ring-track"
                cx={64}
                cy={64}
                r={radius}
                strokeWidth={stroke}
                pathLength={100}
              />
              <circle
                className={`activity-ring-meter ${tone}`}
                cx={64}
                cy={64}
                r={radius}
                strokeWidth={stroke}
                pathLength={100}
                strokeDasharray="100"
                strokeDashoffset={dashoffset}
              />
            </g>
          );
        })}
      </svg>
      <div className={`activity-rings-core ${mine ? "is-you" : ""}`}>
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="size-full object-cover" />
        ) : (
          <span className="stamp text-[11px] text-mark">100</span>
        )}
      </div>
    </div>
  );
}
