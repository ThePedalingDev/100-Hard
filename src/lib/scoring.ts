import type { DayStatus } from "@/lib/challenge";

export type CheckinFields = {
  diet_complete: boolean;
  workout_1_complete: boolean;
  workout_2_complete: boolean;
  outdoor_complete: boolean;
  water_complete: boolean;
  bible_complete: boolean;
  status: DayStatus;
};

export type ScoredCategory = "diet" | "workout" | "water" | "bible";

export function isWorkoutComplete(fields: Pick<CheckinFields, "workout_1_complete" | "workout_2_complete" | "outdoor_complete">): boolean {
  return fields.workout_1_complete && fields.workout_2_complete && fields.outdoor_complete;
}

export function isPerfect(fields: CheckinFields): boolean {
  return (
    fields.diet_complete &&
    isWorkoutComplete(fields) &&
    fields.water_complete &&
    fields.bible_complete
  );
}

export function completedCategories(fields: CheckinFields): number {
  return [
    fields.diet_complete,
    isWorkoutComplete(fields),
    fields.water_complete,
    fields.bible_complete,
  ].filter(Boolean).length;
}

export function missedCategories(fields: CheckinFields): ScoredCategory[] {
  const missed: ScoredCategory[] = [];
  if (!fields.diet_complete) missed.push("diet");
  if (!isWorkoutComplete(fields)) missed.push("workout");
  if (!fields.water_complete) missed.push("water");
  if (!fields.bible_complete) missed.push("bible");
  return missed;
}

export function categoryLabel(category: ScoredCategory): string {
  switch (category) {
    case "diet":
      return "Diet";
    case "workout":
      return "Workout";
    case "water":
      return "Water";
    case "bible":
      return "Bible reading";
  }
}

export function deriveStatus(fields: CheckinFields, finalized: boolean): DayStatus {
  if (!finalized) return "pending";
  return isPerfect(fields) ? "perfect" : "failed";
}

/** Status used for perfect-day totals and streaks: open perfect days count immediately. */
export function statsDayStatus(
  row: CheckinFields & { status: DayStatus; finalized_at?: string | null },
): DayStatus {
  if (row.finalized_at) return row.status;
  if (isPerfect(row)) return "perfect";
  return "pending";
}

export type TodayDisplayStatus = "perfect" | "failed" | "pending" | "complete";

export function todayDisplayStatus(
  checkin: (CheckinFields & { finalized_at?: string | null; status?: DayStatus }) | null | undefined,
): TodayDisplayStatus {
  if (!checkin) return "pending";
  if (checkin.finalized_at) {
    return checkin.status === "perfect" ? "perfect" : "failed";
  }
  if (isPerfect(checkin)) return "complete";
  return "pending";
}

/** UI status for any day card/history row (Done while open, Perfect once finalized). */
export function checkinDisplayStatus(
  checkin: (CheckinFields & { finalized_at?: string | null; status: DayStatus }) | null | undefined,
): TodayDisplayStatus {
  return todayDisplayStatus(checkin);
}

export type TodayRingMetric = {
  id: ScoredCategory;
  label: string;
  current: number;
  total: number;
  progress: number;
};

export function todayRingMetrics(
  checkin: CheckinFields | null | undefined,
): TodayRingMetric[] {
  const empty = (id: ScoredCategory, label: string, total: number): TodayRingMetric => ({
    id,
    label,
    current: 0,
    total,
    progress: 0,
  });

  if (!checkin) {
    return [
      empty("diet", "Diet", 1),
      empty("workout", "Workout", 3),
      empty("water", "Water", 1),
      empty("bible", "Bible", 1),
    ];
  }

  const workoutDone = [
    checkin.workout_1_complete,
    checkin.workout_2_complete,
    checkin.outdoor_complete,
  ].filter(Boolean).length;

  return [
    {
      id: "diet",
      label: "Diet",
      current: checkin.diet_complete ? 1 : 0,
      total: 1,
      progress: checkin.diet_complete ? 1 : 0,
    },
    {
      id: "workout",
      label: "Workout",
      current: workoutDone,
      total: 3,
      progress: workoutDone / 3,
    },
    {
      id: "water",
      label: "Water",
      current: checkin.water_complete ? 1 : 0,
      total: 1,
      progress: checkin.water_complete ? 1 : 0,
    },
    {
      id: "bible",
      label: "Bible",
      current: checkin.bible_complete ? 1 : 0,
      total: 1,
      progress: checkin.bible_complete ? 1 : 0,
    },
  ];
}

export function completionPercent(completed: number, possible: number): number {
  if (possible <= 0) return 0;
  return Math.round((completed / possible) * 1000) / 10;
}

export function perfectDayDates(statuses: { date: string; status: DayStatus }[]): string[] {
  return statuses
    .filter((row) => row.status === "perfect")
    .map((row) => row.date)
    .sort((a, b) => b.localeCompare(a));
}

export function currentStreak(statuses: { date: string; status: DayStatus }[], today: string): number {
  return currentStreakDates(statuses, today).length;
}

export function currentStreakDates(
  statuses: { date: string; status: DayStatus }[],
  today: string,
): string[] {
  const byDate = new Map(statuses.map((row) => [row.date, row.status]));
  const todayStatus = byDate.get(today);

  let cursor = today;
  if (todayStatus === undefined || todayStatus === "pending") {
    const yesterday = previousDay(today);
    if (!yesterday) return [];
    cursor = yesterday;
  } else if (todayStatus === "failed") {
    return [];
  }

  const dates: string[] = [];
  while (true) {
    const status = byDate.get(cursor);
    if (status !== "perfect") break;
    dates.push(cursor);
    const previous = previousDay(cursor);
    if (!previous) break;
    cursor = previous;
  }
  return dates;
}

export function longestStreak(statuses: { date: string; status: DayStatus }[]): number {
  return longestStreakDates(statuses).length;
}

export function longestStreakDates(statuses: { date: string; status: DayStatus }[]): string[] {
  const ordered = [...statuses].sort((a, b) => a.date.localeCompare(b.date));
  let best: string[] = [];
  let run: string[] = [];
  let previous: string | null = null;

  for (const row of ordered) {
    if (row.status !== "perfect") {
      run = [];
      previous = row.date;
      continue;
    }
    if (previous && nextDay(previous) === row.date) {
      run.push(row.date);
    } else {
      run = [row.date];
    }
    if (run.length > best.length) best = [...run];
    previous = row.date;
  }

  return best.sort((a, b) => b.localeCompare(a));
}

function previousDay(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day - 1));
  return date.toISOString().slice(0, 10);
}

function nextDay(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + 1));
  return date.toISOString().slice(0, 10);
}
