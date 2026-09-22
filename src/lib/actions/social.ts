"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/supabase/types";

export async function toggleLikeAction(checkinId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expired. Sign in again.", code: "AUTH_EXPIRED" };

  const { data: checkin } = await supabase
    .from("daily_checkins")
    .select("user_id")
    .eq("id", checkinId)
    .single();

  if (!checkin || checkin.user_id === user.id) {
    return { ok: false, error: "You can only like your partner's day.", code: "LIKE_OWN_CARD" };
  }

  const { data: existing } = await supabase
    .from("daily_likes")
    .select("id")
    .eq("daily_checkin_id", checkinId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("daily_likes").delete().eq("id", existing.id);
    if (error) return { ok: false, error: error.message, code: "LIKE_FAILED" };
  } else {
    const { error } = await supabase.from("daily_likes").insert({
      daily_checkin_id: checkinId,
      user_id: user.id,
    });
    if (error) return { ok: false, error: error.message, code: "LIKE_FAILED" };
  }

  revalidatePath("/dashboard");
  return { ok: true, data: undefined };
}

export async function addCommentAction(checkinId: string, body: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expired. Sign in again.", code: "AUTH_EXPIRED" };

  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Comment cannot be empty.", code: "VALIDATION" };

  const { data: checkin } = await supabase
    .from("daily_checkins")
    .select("user_id")
    .eq("id", checkinId)
    .single();
  if (!checkin || checkin.user_id === user.id) {
    return { ok: false, error: "Comment on your partner's card.", code: "COMMENT_OWN_CARD" };
  }

  const { error } = await supabase.from("daily_comments").insert({
    daily_checkin_id: checkinId,
    user_id: user.id,
    body: trimmed,
  });
  if (error) return { ok: false, error: error.message, code: "COMMENT_FAILED" };

  revalidatePath("/dashboard");
  return { ok: true, data: undefined };
}

export async function editCommentAction(commentId: string, body: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expired. Sign in again.", code: "AUTH_EXPIRED" };

  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Comment cannot be empty.", code: "VALIDATION" };

  const { error } = await supabase
    .from("daily_comments")
    .update({ body: trimmed, updated_at: new Date().toISOString() })
    .eq("id", commentId)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message, code: "COMMENT_FAILED" };

  revalidatePath("/dashboard");
  return { ok: true, data: undefined };
}

export async function deleteCommentAction(commentId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expired. Sign in again.", code: "AUTH_EXPIRED" };

  const { error } = await supabase.from("daily_comments").delete().eq("id", commentId).eq("user_id", user.id);
  if (error) return { ok: false, error: error.message, code: "COMMENT_FAILED" };

  revalidatePath("/dashboard");
  return { ok: true, data: undefined };
}
