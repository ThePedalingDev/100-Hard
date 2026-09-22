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

export function completionPercent(completed: number, possible: number): number {
  if (possible <= 0) return 0;
  return Math.round((completed / possible) * 1000) / 10;
}

export function currentStreak(statuses: { date: string; status: DayStatus }[], today: string): number {
  const byDate = new Map(statuses.map((row) => [row.date, row.status]));
  let cursor = today;
  let streak = 0;
  while (true) {
    const status = byDate.get(cursor);
    if (status !== "perfect") break;
    streak += 1;
    const previous = previousDay(cursor);
    if (!previous) break;
    cursor = previous;
  }
  return streak;
}

export function longestStreak(statuses: { date: string; status: DayStatus }[]): number {
  const ordered = [...statuses].sort((a, b) => a.date.localeCompare(b.date));
  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const row of ordered) {
    if (row.status !== "perfect") {
      run = 0;
      previous = row.date;
      continue;
    }
    if (previous && nextDay(previous) === row.date) {
      run += 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
    previous = row.date;
  }
  return best;
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
