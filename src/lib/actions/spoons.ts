"use server";

import { revalidatePath } from "next/cache";
import { dateInChallengeTz } from "@/lib/challenge";
import { resolveActiveChallengeId } from "@/lib/active-challenge";
import { isChallengeComplete } from "@/lib/challenge-dates";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, RepaymentStatus, SpoonEntry } from "@/lib/supabase/types";

function spoonBalance(entries: Array<Pick<SpoonEntry, "type" | "quantity">>): number {
  return entries.reduce((sum, entry) => {
    if (entry.type === "earned") return sum + entry.quantity;
    if (entry.type === "redeemed") return sum - entry.quantity;
    return sum + entry.quantity;
  }, 0);
}

export async function requestRepaymentAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expired. Sign in again.", code: "AUTH_EXPIRED" };

  const challengeId = await resolveActiveChallengeId(supabase, user.id);
  if (!challengeId) return { ok: false, error: "Join a challenge first.", code: "NO_CHALLENGE" };

  const { data: challenge } = await supabase
    .from("challenges")
    .select("end_date")
    .eq("id", challengeId)
    .maybeSingle();
  if (!challenge) return { ok: false, error: "Join a challenge first.", code: "NO_CHALLENGE" };

  if (!isChallengeComplete(challenge.end_date, dateInChallengeTz())) {
    return { ok: false, error: "Repayment opens after the challenge ends.", code: "CHALLENGE_ACTIVE" };
  }

  const debtor = String(formData.get("debtor_user_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const cost = Number(formData.get("spoon_cost") ?? 0);
  if (!debtor || !title || cost < 1) {
    return { ok: false, error: "Title and a spoon cost of at least 1 are required.", code: "VALIDATION" };
  }
  if (debtor === user.id) {
    return { ok: false, error: "Choose another member.", code: "VALIDATION" };
  }

  const { data: debtorMembership } = await supabase
    .from("challenge_members")
    .select("id")
    .eq("challenge_id", challengeId)
    .eq("user_id", debtor)
    .maybeSingle();
  if (!debtorMembership) {
    return { ok: false, error: "That person is not in this challenge.", code: "NOT_MEMBER" };
  }

  const { data: entries } = await supabase
    .from("spoon_entries")
    .select("type, quantity")
    .eq("challenge_id", challengeId)
    .eq("user_id", debtor);
  if (spoonBalance((entries ?? []) as Array<Pick<SpoonEntry, "type" | "quantity">>) <= 0) {
    return { ok: false, error: "That member does not owe spoons.", code: "NO_DEBT" };
  }

  const { error } = await supabase.from("spoon_repayments").insert({
    challenge_id: challengeId,
    debtor_user_id: debtor,
    requested_by_user_id: user.id,
    title,
    description: description || null,
    spoon_cost: cost,
  });
  if (error) return { ok: false, error: error.message, code: "REPAYMENT_FAILED" };

  revalidatePath("/spoons");
  return { ok: true, data: undefined };
}

export async function advanceRepaymentAction(
  repaymentId: string,
  next: Extract<RepaymentStatus, "accepted" | "completed" | "confirmed" | "cancelled">,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expired. Sign in again.", code: "AUTH_EXPIRED" };

  const { data: row } = await supabase.from("spoon_repayments").select("*").eq("id", repaymentId).single();
  if (!row) return { ok: false, error: "Repayment not found.", code: "NOT_FOUND" };

  const now = new Date().toISOString();
  const patch: Record<string, string> = { status: next };
  if (next === "accepted") patch.accepted_at = now;
  if (next === "completed") patch.completed_at = now;
  if (next === "confirmed") patch.confirmed_at = now;

  const { error } = await supabase.from("spoon_repayments").update(patch).eq("id", repaymentId);
  if (error) return { ok: false, error: error.message, code: "REPAYMENT_FAILED" };

  if (next === "confirmed") {
    const { error: spoonError } = await supabase.from("spoon_entries").insert({
      challenge_id: row.challenge_id,
      user_id: row.debtor_user_id,
      type: "redeemed",
      quantity: row.spoon_cost,
    });
    if (spoonError) return { ok: false, error: spoonError.message, code: "REPAYMENT_FAILED" };
  }

  revalidatePath("/spoons");
  return { ok: true, data: undefined };
}
