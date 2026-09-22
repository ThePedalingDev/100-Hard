"use server";

import { revalidatePath } from "next/cache";
import { resolveActiveChallengeId } from "@/lib/active-challenge";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/supabase/types";

export async function sendChatAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expired. Sign in again.", code: "AUTH_EXPIRED" };

  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 1 || body.length > 500) {
    return { ok: false, error: "Write 1 to 500 characters.", code: "VALIDATION" };
  }

  const challengeId = await resolveActiveChallengeId(supabase, user.id);
  if (!challengeId) return { ok: false, error: "Join a challenge first.", code: "NO_CHALLENGE" };

  const { error } = await supabase.from("chat_messages").insert({
    challenge_id: challengeId,
    user_id: user.id,
    body,
  });
  if (error) return { ok: false, error: error.message, code: "CHAT_FAILED" };

  revalidatePath("/social");
  return { ok: true, data: undefined };
}
