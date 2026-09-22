"use server";

import { revalidatePath } from "next/cache";
import { isAdminEmail } from "@/lib/admin";
import { challengeLifecycleStatus, validateAdminChallengeRange } from "@/lib/challenge-dates";
import { dateInChallengeTz } from "@/lib/challenge";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/supabase/types";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Session expired. Sign in again.", code: "AUTH_EXPIRED" };
  if (!isAdminEmail(user.email)) {
    return { ok: false as const, error: "Admin only.", code: "FORBIDDEN" };
  }
  return { ok: true as const, supabase, user };
}

export async function updateChallengeAdminAction(formData: FormData): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const challengeId = String(formData.get("challenge_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const start = String(formData.get("start_date") ?? "").trim();
  const end = String(formData.get("end_date") ?? "").trim();
  if (!challengeId || !name) {
    return { ok: false, error: "Name is required.", code: "VALIDATION" };
  }
  const dates = validateAdminChallengeRange(start, end);
  if (!dates.ok) return dates;

  const { error } = await gate.supabase
    .from("challenges")
    .update({
      name,
      start_date: start,
      end_date: end,
      status: challengeLifecycleStatus(start, end, dateInChallengeTz()),
    })
    .eq("id", challengeId);
  if (error) return { ok: false, error: error.message, code: "CHALLENGE_UPDATE_FAILED" };

  revalidatePath("/", "layout");
  revalidatePath("/admin");
  return { ok: true, data: undefined };
}

export async function deleteChallengeAdminAction(formData: FormData): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const challengeId = String(formData.get("challenge_id") ?? "").trim();
  if (!challengeId) return { ok: false, error: "Choose a challenge.", code: "VALIDATION" };

  const { error } = await gate.supabase.from("challenges").delete().eq("id", challengeId);
  if (error) return { ok: false, error: error.message, code: "CHALLENGE_DELETE_FAILED" };

  revalidatePath("/", "layout");
  revalidatePath("/admin");
  return { ok: true, data: undefined };
}
