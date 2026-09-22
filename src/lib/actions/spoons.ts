"use server";

import { revalidatePath } from "next/cache";
import { isChallengeComplete } from "@/lib/challenge";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, RepaymentStatus } from "@/lib/supabase/types";

export async function requestRepaymentAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expired. Sign in again.", code: "AUTH_EXPIRED" };
  if (!isChallengeComplete()) {
    return { ok: false, error: "Repayment opens after 31 December.", code: "CHALLENGE_ACTIVE" };
  }

  const { data: membership } = await supabase
    .from("challenge_members")
    .select("challenge_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) return { ok: false, error: "Join a challenge first.", code: "NO_CHALLENGE" };

  const debtor = String(formData.get("debtor_user_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const cost = Number(formData.get("spoon_cost") ?? 0);
  if (!debtor || !title || cost < 1) {
    return { ok: false, error: "Title and a spoon cost of at least 1 are required.", code: "VALIDATION" };
  }

  const { error } = await supabase.from("spoon_repayments").insert({
    challenge_id: membership.challenge_id,
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
