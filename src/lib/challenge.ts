export const CHALLENGE_TIMEZONE = "Africa/Johannesburg";
export const CHALLENGE_START = "2026-09-22";
export const CHALLENGE_END = "2026-12-31";
export const CHALLENGE_NAME = "100 Hard";

export type DayStatus = "pending" | "perfect" | "failed";

export function dateInChallengeTz(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CHALLENGE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function daysBetweenInclusive(start: string, end: string): number {
  const ms = parseIsoDate(end).getTime() - parseIsoDate(start).getTime();
  return Math.floor(ms / 86_400_000) + 1;
}

export function compareIsoDates(a: string, b: string): number {
  return a.localeCompare(b);
}

export function isChallengeComplete(today = dateInChallengeTz()): boolean {
  return compareIsoDates(today, CHALLENGE_END) > 0;
}

export function isBeforeStart(today = dateInChallengeTz()): boolean {
  return compareIsoDates(today, CHALLENGE_START) < 0;
}

export function clampToChallenge(iso: string): string {
  if (compareIsoDates(iso, CHALLENGE_START) < 0) return CHALLENGE_START;
  if (compareIsoDates(iso, CHALLENGE_END) > 0) return CHALLENGE_END;
  return iso;
}

export function totalChallengeDays(): number {
  return daysBetweenInclusive(CHALLENGE_START, CHALLENGE_END);
}

export function elapsedChallengeDays(today = dateInChallengeTz()): number {
  if (isBeforeStart(today)) return 0;
  const last = compareIsoDates(today, CHALLENGE_END) > 0 ? CHALLENGE_END : today;
  return daysBetweenInclusive(CHALLENGE_START, last);
}

export function daysRemaining(today = dateInChallengeTz()): number {
  if (isChallengeComplete(today)) return 0;
  if (isBeforeStart(today)) return daysBetweenInclusive(CHALLENGE_START, CHALLENGE_END);
  return daysBetweenInclusive(today, CHALLENGE_END);
}

export function formatStampDate(iso: string): string {
  const date = parseIsoDate(iso);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(iso: string): string {
  const date = parseIsoDate(iso);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatStampClock(isoTimestamp: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: CHALLENGE_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(isoTimestamp));
}

export function monthKey(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

export function monthLabel(iso: string): string {
  const date = parseIsoDate(monthKey(iso));
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export function weekdayIndexMonday(iso: string): number {
  const day = parseIsoDate(iso).getUTCDay();
  return day === 0 ? 6 : day - 1;
}

export function startOfWeekMonday(iso: string): string {
  return addDays(iso, -weekdayIndexMonday(iso));
}

export function weekDates(iso: string): string[] {
  const start = startOfWeekMonday(iso);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function weekRangeLabel(startIso: string, endIso: string): string {
  const startDate = parseIsoDate(startIso);
  const endDate = parseIsoDate(endIso);
  const year = startIso.slice(0, 4);
  if (startIso.slice(0, 7) === endIso.slice(0, 7)) {
    const month = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", month: "short" }).format(startDate);
    return `${startDate.getUTCDate()}–${endDate.getUTCDate()} ${month} ${year}`;
  }
  return `${formatShortDate(startIso)} – ${formatShortDate(endIso)}, ${year}`;
}

export function inviteCode(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function raceProgress(perfectDays: number, today = dateInChallengeTz()): number {
  const elapsed = Math.max(elapsedChallengeDays(today), 1);
  return Math.min(perfectDays / elapsed, 1);
}

export function raceLaneProgress(perfectDays: number): number {
  return Math.min(perfectDays / totalChallengeDays(), 1);
}
