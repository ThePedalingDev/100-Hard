import { dateInChallengeTz } from "@/lib/challenge";
import type { ChatMessage } from "@/lib/supabase/types";

export const DAY_COMPLETE_PREFIX = "[sys:day_complete:";

export function dayCompleteBody(date: string) {
  return `${DAY_COMPLETE_PREFIX}${date}]`;
}

export function isDayCompleteMessage(body: string) {
  return body.startsWith(DAY_COMPLETE_PREFIX) && body.endsWith("]");
}

export function dayCompleteDate(body: string): string | null {
  if (!isDayCompleteMessage(body)) return null;
  return body.slice(DAY_COMPLETE_PREFIX.length, -1);
}

export function dayCompleteLabel(displayName: string) {
  return `${displayName} completed their day`;
}

export type SystemChatMessage = ChatMessage & {
  kind: "day_complete";
  date: string;
};

export function asSystemMessage(row: ChatMessage): SystemChatMessage | null {
  const date = dayCompleteDate(row.body);
  if (!date) return null;
  return { ...row, kind: "day_complete", date };
}

export function messageChallengeDate(row: ChatMessage): string {
  const system = asSystemMessage(row);
  if (system) return system.date;
  return dateInChallengeTz(new Date(row.created_at));
}

export function dismissedStorageKey(userId: string) {
  return `100hard:dismissed-chat:${userId}`;
}

export function readDismissedIds(userId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(dismissedStorageKey(userId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((item): item is string => typeof item === "string"));
  } catch {
    return new Set();
  }
}

export function writeDismissedIds(userId: string, ids: Set<string>) {
  window.localStorage.setItem(dismissedStorageKey(userId), JSON.stringify([...ids]));
}
