"use server";

import { revalidatePath } from "next/cache";
import { resolveActiveChallengeId } from "@/lib/active-challenge";
import { dateInChallengeTz } from "@/lib/challenge";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, DailyCheckin } from "@/lib/supabase/types";

const booleanKeys = [
  "diet_complete",
  "workout_1_complete",
  "workout_2_complete",
  "outdoor_complete",
  "water_complete",
  "bible_complete",
] as const;

const textKeys = [
  "diet_note",
  "workout_note",
  "water_note",
  "bible_reference",
  "bible_note",
  "day_note",
  "failure_reason",
] as const;

type BooleanKey = (typeof booleanKeys)[number];
type TextKey = (typeof textKeys)[number];

async function ownOpenCheckin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: { message: "Session expired. Sign in again.", code: "AUTH_EXPIRED" } as const };

  const challengeId = await resolveActiveChallengeId(supabase, user.id);
  if (!challengeId) return { error: { message: "Join a challenge first.", code: "NO_CHALLENGE" } as const };
  const membership = { challenge_id: challengeId };

  const today = dateInChallengeTz();
  const { data: existing } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("challenge_id", membership.challenge_id)
    .eq("user_id", user.id)
    .eq("challenge_date", today)
    .maybeSingle();

  if (existing?.finalized_at) {
    return { error: { message: "This day is locked.", code: "DAY_LOCKED" } as const, supabase, user, membership, existing };
  }

  if (existing) {
    return { supabase, user, membership, existing: existing as DailyCheckin };
  }

  const { data: created, error } = await supabase
    .from("daily_checkins")
    .insert({
      challenge_id: membership.challenge_id,
      user_id: user.id,
      challenge_date: today,
    })
    .select("*")
    .single();

  if (error || !created) {
    return { error: { message: error?.message ?? "Could not open today.", code: "CHECKIN_CREATE_FAILED" } as const };
  }

  return { supabase, user, membership, existing: created as DailyCheckin };
}

export async function toggleCheckAction(key: BooleanKey, value: boolean): Promise<ActionResult> {
  if (!booleanKeys.includes(key)) {
    return { ok: false, error: "Unknown requirement.", code: "VALIDATION" };
  }

  const opened = await ownOpenCheckin();
  if ("error" in opened && opened.error && !opened.existing) {
    return { ok: false, error: opened.error.message, code: opened.error.code };
  }
  if (!opened.existing || !opened.supabase) {
    return { ok: false, error: opened.error?.message ?? "Could not update today.", code: opened.error?.code ?? "CHECKIN_SAVE_FAILED" };
  }
  if (opened.existing.finalized_at) {
    return { ok: false, error: "This day is locked.", code: "DAY_LOCKED" };
  }

  const { error } = await opened.supabase
    .from("daily_checkins")
    .update({ [key]: value, updated_at: new Date().toISOString() })
    .eq("id", opened.existing.id)
    .eq("user_id", opened.user!.id);

  if (error) {
    return { ok: false, error: error.message, code: "CHECKIN_SAVE_FAILED" };
  }

  revalidatePath("/dashboard");
  return { ok: true, data: undefined };
}

export async function saveNoteAction(key: TextKey, value: string): Promise<ActionResult> {
  if (!textKeys.includes(key)) {
    return { ok: false, error: "Unknown note field.", code: "VALIDATION" };
  }

  const opened = await ownOpenCheckin();
  if (!opened.existing || !opened.supabase || !opened.user) {
    return { ok: false, error: opened.error?.message ?? "Could not save note.", code: opened.error?.code ?? "CHECKIN_SAVE_FAILED" };
  }

  if (opened.existing.finalized_at && key !== "failure_reason") {
    return { ok: false, error: "This day is locked.", code: "DAY_LOCKED" };
  }

  if (key === "day_note" && value.length > 500) {
    return { ok: false, error: "Daily note is limited to 500 characters.", code: "VALIDATION" };
  }

  const { error } = await opened.supabase
    .from("daily_checkins")
    .update({ [key]: value || null, updated_at: new Date().toISOString() })
    .eq("id", opened.existing.id)
    .eq("user_id", opened.user.id);

  if (error) {
    return { ok: false, error: error.message, code: "CHECKIN_SAVE_FAILED" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  return { ok: true, data: undefined };
}

export async function saveFailureReasonAction(checkinId: string, value: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expired. Sign in again.", code: "AUTH_EXPIRED" };

  const { error } = await supabase
    .from("daily_checkins")
    .update({ failure_reason: value || null, updated_at: new Date().toISOString() })
    .eq("id", checkinId)
    .eq("user_id", user.id)
    .eq("status", "failed");

  if (error) {
    return { ok: false, error: error.message, code: "CHECKIN_SAVE_FAILED" };
  }

  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}
