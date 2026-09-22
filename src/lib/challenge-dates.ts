import { compareIsoDates, daysBetweenInclusive } from "@/lib/challenge";
import type { ActionResult, ChallengeStatus } from "@/lib/supabase/types";

export const MAX_CHALLENGE_MEMBERS = 12;

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function validateChallengeRange(
  start: string,
  end: string,
  today: string,
): ActionResult {
  if (!ISO.test(start) || !ISO.test(end)) {
    return { ok: false, error: "Use calendar dates.", code: "VALIDATION" };
  }
  if (compareIsoDates(start, today) < 0) {
    return { ok: false, error: "Start must be today or later.", code: "START_IN_PAST" };
  }
  if (compareIsoDates(end, start) <= 0) {
    return { ok: false, error: "End must be after start.", code: "END_NOT_AFTER_START" };
  }
  return { ok: true, data: undefined };
}

export function isChallengeComplete(endDate: string, today: string): boolean {
  return compareIsoDates(today, endDate) > 0;
}

export function clampToChallengeRange(iso: string, startDate: string, endDate: string): string {
  if (compareIsoDates(iso, startDate) < 0) return startDate;
  if (compareIsoDates(iso, endDate) > 0) return endDate;
  return iso;
}

export function daysRemainingFor(startDate: string, endDate: string, today: string): number {
  if (isChallengeComplete(endDate, today)) return 0;
  if (compareIsoDates(today, startDate) < 0) return daysBetweenInclusive(startDate, endDate);
  return daysBetweenInclusive(today, endDate);
}

export function challengeLifecycleStatus(startDate: string, endDate: string, today: string): ChallengeStatus {
  if (compareIsoDates(today, startDate) < 0) return "pending";
  if (compareIsoDates(today, endDate) > 0) return "complete";
  return "active";
}
