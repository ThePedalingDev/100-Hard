import { AvatarImg } from "@/components/avatar-img";
import {
  challengeDayNumber,
  type ChallengeMilestone,
} from "@/lib/challenge-dates";
import { statsDayStatus } from "@/lib/scoring";
import type { DailyCheckin, Profile } from "@/lib/supabase/types";

export type PersonStatus = {
  id: string;
  name: string;
  avatarUrl: string | null;
  status: "perfect" | "failed" | "pending";
};

export type CalendarPerson = {
  id: string;
  profile: Profile;
  avatarUrl: string | null;
};

export type CalendarRow = Pick<
  DailyCheckin,
  | "user_id"
  | "challenge_date"
  | "status"
  | "diet_complete"
  | "workout_1_complete"
  | "workout_2_complete"
  | "outdoor_complete"
  | "water_complete"
  | "bible_complete"
  | "finalized_at"
>;

function wordFor(status: PersonStatus["status"]) {
  if (status === "perfect") return "Perfect";
  if (status === "failed") return "Failed";
  return "Pending";
}

function ringTone(status: PersonStatus["status"]) {
  if (status === "perfect") return "bg-success";
  if (status === "failed") return "bg-failure";
  return "bg-steel";
}

function ringWidth(size: PinSize) {
  if (size === "xl") return "p-[5px]";
  if (size === "lg") return "p-1";
  return "p-0.5";
}

function ringInnerRadius(size: PinSize) {
  if (size === "xl") return "rounded-[2px]";
  if (size === "lg") return "rounded-[4px]";
  return "rounded-[5px]";
}

export function milestoneCellLabel(milestone: ChallengeMilestone) {
  if (milestone.kind === "start") return "St";
  if (milestone.kind === "end") return "En";
  return String(milestone.day);
}

export function settleStatus(
  status: PersonStatus["status"],
  iso: string,
  today: string,
): PersonStatus["status"] {
  if (status === "perfect") return "perfect";
  if (status === "failed" || iso < today) return "failed";
  return "pending";
}

export type CellCompletion = "failed" | "perfect" | "partial" | "pending";

export function cellCompletion(people: PersonStatus[]): CellCompletion {
  const statuses = people.map((person) => person.status);
  if (statuses.some((status) => status === "failed")) return "failed";
  if (statuses.length > 0 && statuses.every((status) => status === "perfect")) return "perfect";
  if (statuses.some((status) => status === "perfect")) return "partial";
  return "pending";
}

export function cellSurface(
  people: PersonStatus[],
  today: boolean,
  milestone: ChallengeMilestone | undefined,
) {
  const completion = cellCompletion(people);
  const fill =
    completion === "failed"
      ? "bg-failure/28"
      : completion === "perfect"
        ? "bg-success/32"
        : completion === "partial"
          ? "bg-success/18"
          : "bg-graphite";
  const edge = today
    ? "border-brass ring-1 ring-brass/45"
    : milestone
      ? "border-signal"
      : completion === "failed"
        ? "border-failure/70"
        : completion === "perfect"
          ? "border-success/75"
          : completion === "partial"
            ? "border-success/50"
            : "border-steel/35";
  return `${fill} ${edge} calendar-cell-${completion}`;
}

export function cellDayTone(completion: CellCompletion) {
  if (completion === "perfect") return "text-success";
  if (completion === "failed") return "text-failure";
  if (completion === "partial") return "text-success/80";
  return "";
}

export function peopleForDate(
  iso: string,
  inChallenge: boolean,
  today: string,
  people: CalendarPerson[],
  rows: CalendarRow[],
): PersonStatus[] {
  if (!inChallenge) return [];
  return people.map(({ id, profile, avatarUrl }) => {
    const row = rows.find((item) => item.user_id === id && item.challenge_date === iso);
    const derived = row
      ? statsDayStatus(row)
      : iso < today
        ? "failed"
        : "pending";
    return {
      id,
      name: profile.display_name,
      avatarUrl,
      status: settleStatus(derived as PersonStatus["status"], iso, today),
    };
  });
}

export type PinSize = "sm" | "md" | "lg" | "xl";

export function pinSizeForMembers(count: number, view: "month" | "week"): PinSize {
  if (view === "week") {
    if (count <= 2) return "xl";
    if (count <= 4) return "lg";
    return "md";
  }
  if (count <= 2) return "lg";
  if (count <= 4) return "md";
  return "sm";
}

export function monthCellClassForMembers(count: number) {
  if (count <= 2) return "min-h-[6.5rem] md:min-h-[8.5rem]";
  if (count <= 4) return "min-h-[5.75rem] md:min-h-[7.25rem]";
  return "min-h-[4.75rem] md:min-h-[6.5rem]";
}

export function pinGapForMembers(count: number) {
  return count <= 4 ? "gap-1" : "gap-0.5";
}

export function FacePin({
  person,
  size = "sm",
}: {
  person: PersonStatus;
  size?: PinSize;
}) {
  const word = wordFor(person.status);
  const sizeClass =
    size === "xl"
      ? "size-10 md:size-11"
      : size === "lg"
        ? "size-8 md:size-9"
        : size === "md"
          ? "size-6 md:size-7"
          : "size-4 md:size-5";
  const textClass =
    size === "xl"
      ? "text-xs md:text-sm"
      : size === "lg"
        ? "text-[11px] md:text-xs"
        : size === "md"
          ? "text-[9px] md:text-[10px]"
          : "text-[8px] md:text-[10px]";

  return (
    <span
      title={`${person.name}: ${word}`}
      className={`relative inline-flex shrink-0 rounded-plate ${ringWidth(size)} ${ringTone(person.status)} ${sizeClass}`}
    >
      <span className={`flex size-full bg-iron p-px ${ringInnerRadius(size)}`}>
        <span className="size-full overflow-hidden rounded-[2px] bg-graphite">
          {person.avatarUrl ? (
            <AvatarImg
              src={person.avatarUrl}
              name={person.name}
              className="size-full object-cover"
              fallbackClassName={`stamp flex size-full items-center justify-center text-mark ${textClass}`}
            />
          ) : (
            <span className={`stamp flex size-full items-center justify-center text-mark ${textClass}`}>
              {person.name.slice(0, 1)}
            </span>
          )}
        </span>
      </span>
      <span className="sr-only">{`${person.name} ${word}`}</span>
    </span>
  );
}

export function CalendarLegend({ milestones }: { milestones: ChallengeMilestone[] }) {
  return (
    <div className="mt-5 flex flex-col gap-3 text-sm text-steel md:flex-row md:items-center md:justify-between">
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-flex size-5 rounded-plate bg-success p-[3px] md:size-6" aria-hidden="true">
            <span className="size-full rounded-[4px] bg-graphite" />
          </span>
          Perfect
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-flex size-5 rounded-plate bg-failure p-[3px] md:size-6" aria-hidden="true">
            <span className="size-full rounded-[4px] bg-graphite" />
          </span>
          Failed
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-flex size-5 rounded-plate bg-steel p-[3px] md:size-6" aria-hidden="true">
            <span className="size-full rounded-[4px] bg-graphite" />
          </span>
          Pending
        </li>
      </ul>
      <p className="stamp text-[11px] text-mark">{milestones.map((item) => item.label).join(" · ")}</p>
    </div>
  );
}

export function weekdayName(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short" }).format(date);
}

export function dayNumberLabel(iso: string, challengeStart: string): string | null {
  if (iso < challengeStart) return null;
  return String(challengeDayNumber(iso, challengeStart));
}
