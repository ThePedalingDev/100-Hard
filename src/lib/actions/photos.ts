"use server";

import { revalidatePath } from "next/cache";
import { resolveActiveChallengeId } from "@/lib/active-challenge";
import { monthKey } from "@/lib/challenge";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/supabase/types";

export async function uploadPhotoAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expired. Sign in again.", code: "AUTH_EXPIRED" };

  const challengeId = await resolveActiveChallengeId(supabase, user.id);
  if (!challengeId) return { ok: false, error: "Join a challenge first.", code: "NO_CHALLENGE" };
  const membership = { challenge_id: challengeId };

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image under 10 MB.", code: "VALIDATION" };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, error: "Image must be 10 MB or smaller.", code: "IMAGE_TOO_LARGE" };
  }

  const month = monthKey(String(formData.get("month") ?? new Date().toISOString().slice(0, 10)));
  const path = `${membership.challenge_id}/${user.id}/${month.slice(0, 7)}.webp`;

  const { error: uploadError } = await supabase.storage.from("progress").upload(path, file, {
    upsert: true,
    contentType: "image/webp",
  });
  if (uploadError) {
    return { ok: false, error: uploadError.message, code: "PHOTO_UPLOAD_FAILED" };
  }

  const { error } = await supabase.from("progress_photos").upsert(
    {
      challenge_id: membership.challenge_id,
      user_id: user.id,
      month,
      storage_path: path,
      caption: String(formData.get("caption") ?? "").trim() || null,
    },
    { onConflict: "challenge_id,user_id,month" },
  );
  if (error) {
    return { ok: false, error: error.message, code: "PHOTO_SAVE_FAILED" };
  }

  revalidatePath("/photos");
  return { ok: true, data: undefined };
}
