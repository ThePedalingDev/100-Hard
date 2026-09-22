"use server";

import { revalidatePath } from "next/cache";
import { CHALLENGE_NAME, CHALLENGE_TIMEZONE, dateInChallengeTz, inviteCode } from "@/lib/challenge";
import {
  MAX_CHALLENGE_MEMBERS,
  challengeLifecycleStatus,
  validateChallengeRange,
} from "@/lib/challenge-dates";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/supabase/types";

export async function createChallengeAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expired. Sign in again.", code: "AUTH_EXPIRED" };

  const name = String(formData.get("name") ?? CHALLENGE_NAME).trim() || CHALLENGE_NAME;
  const today = dateInChallengeTz();
  const start = String(formData.get("start_date") ?? "").trim();
  const end = String(formData.get("end_date") ?? "").trim();
  const dates = validateChallengeRange(start, end, today);
  if (!dates.ok) return dates;
  const code = inviteCode();

  const { data: challenge, error } = await supabase
    .from("challenges")
    .insert({
      name,
      start_date: start,
      end_date: end,
      timezone: CHALLENGE_TIMEZONE,
      created_by: user.id,
      invite_code: code,
      status: challengeLifecycleStatus(start, end, today),
    })
    .select("id")
    .single();

  if (error || !challenge) {
    return { ok: false, error: error?.message ?? "Could not create the challenge.", code: "CHALLENGE_CREATE_FAILED" };
  }

  const { error: memberError } = await supabase.from("challenge_members").insert({
    challenge_id: challenge.id,
    user_id: user.id,
  });
  if (memberError) {
    return { ok: false, error: memberError.message, code: "CHALLENGE_JOIN_FAILED" };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ active_challenge_id: challenge.id })
    .eq("id", user.id);
  if (profileError) {
    return { ok: false, error: profileError.message, code: "PROFILE_UPDATE_FAILED" };
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/onboarding/challenge");
  return { ok: true, data: undefined, next: "/dashboard" };
}

export async function joinChallengeAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expired. Sign in again.", code: "AUTH_EXPIRED" };

  const code = String(formData.get("invite_code") ?? "").trim().toLowerCase();
  if (!code) {
    return { ok: false, error: "Invite code is required.", code: "VALIDATION" };
  }

  const { data: inviteRows, error: inviteError } = await supabase.rpc("get_challenge_by_invite_code", {
    p_code: code,
  });

  if (inviteError) {
    return {
      ok: false,
      error: "Could not verify that invite. Try again.",
      code: "INVITE_LOOKUP_FAILED",
    };
  }

  const challenge = inviteRows?.[0] ?? null;
  if (!challenge) {
    return { ok: false, error: "That invite is expired or invalid.", code: "INVITE_EXPIRED" };
  }

  const { data: existing } = await supabase
    .from("challenge_members")
    .select("id")
    .eq("challenge_id", challenge.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    if (Number(challenge.member_count ?? 0) >= MAX_CHALLENGE_MEMBERS) {
      return { ok: false, error: "This challenge is full.", code: "CHALLENGE_FULL" };
    }

    const { error: joinError } = await supabase.from("challenge_members").insert({
      challenge_id: challenge.id,
      user_id: user.id,
    });
    if (joinError) {
      if (/full|unique|duplicate|challenge_full/i.test(joinError.message)) {
        return { ok: false, error: "This challenge is full.", code: "CHALLENGE_FULL" };
      }
      return { ok: false, error: joinError.message, code: "CHALLENGE_JOIN_FAILED" };
    }
  }

  const today = dateInChallengeTz();
  await supabase
    .from("challenges")
    .update({ status: challengeLifecycleStatus(challenge.start_date, challenge.end_date, today) })
    .eq("id", challenge.id);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ active_challenge_id: challenge.id })
    .eq("id", user.id);
  if (profileError) {
    return { ok: false, error: profileError.message, code: "PROFILE_UPDATE_FAILED" };
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/onboarding/challenge");
  return { ok: true, data: undefined, next: "/dashboard" };
}

export async function setActiveChallengeAction(challengeId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expired. Sign in again.", code: "AUTH_EXPIRED" };

  const { data: membership } = await supabase
    .from("challenge_members")
    .select("id")
    .eq("challenge_id", challengeId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) {
    return { ok: false, error: "You are not in that challenge.", code: "NOT_MEMBER" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ active_challenge_id: challengeId })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message, code: "PROFILE_UPDATE_FAILED" };

  revalidatePath("/", "layout");
  return { ok: true, data: undefined, next: "/dashboard" };
}
