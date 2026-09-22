"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CHALLENGE_END,
  CHALLENGE_NAME,
  CHALLENGE_START,
  CHALLENGE_TIMEZONE,
  inviteCode,
} from "@/lib/challenge";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/supabase/types";

export async function createChallengeAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expired. Sign in again.", code: "AUTH_EXPIRED" };

  const name = String(formData.get("name") ?? CHALLENGE_NAME).trim() || CHALLENGE_NAME;
  const code = inviteCode();

  const { data: challenge, error } = await supabase
    .from("challenges")
    .insert({
      name,
      start_date: CHALLENGE_START,
      end_date: CHALLENGE_END,
      timezone: CHALLENGE_TIMEZONE,
      created_by: user.id,
      invite_code: code,
      status: "pending",
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

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/onboarding/challenge");
  redirect("/dashboard");
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

  const { data: challenge, error } = await supabase
    .from("challenges")
    .select("id")
    .eq("invite_code", code)
    .maybeSingle();

  if (error || !challenge) {
    return { ok: false, error: "That invite is expired or invalid.", code: "INVITE_EXPIRED" };
  }

  const { count } = await supabase
    .from("challenge_members")
    .select("id", { count: "exact", head: true })
    .eq("challenge_id", challenge.id);

  if ((count ?? 0) >= 2) {
    return { ok: false, error: "This challenge is full.", code: "CHALLENGE_FULL" };
  }

  const { error: joinError } = await supabase.from("challenge_members").insert({
    challenge_id: challenge.id,
    user_id: user.id,
  });
  if (joinError) {
    if (/full|unique|duplicate/i.test(joinError.message)) {
      return { ok: false, error: "This challenge is full.", code: "CHALLENGE_FULL" };
    }
    return { ok: false, error: joinError.message, code: "CHALLENGE_JOIN_FAILED" };
  }

  await supabase.from("challenges").update({ status: "active" }).eq("id", challenge.id);

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/onboarding/challenge");
  redirect("/dashboard");
}
