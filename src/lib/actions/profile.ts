"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/supabase/types";

export async function saveProfileAction(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Session expired. Sign in again.", code: "AUTH_EXPIRED" };

    const displayName = String(formData.get("display_name") ?? "").trim();
    const dietCommitment = String(formData.get("diet_commitment") ?? "").trim();
    if (!displayName || !dietCommitment) {
      return { ok: false, error: "Display name and diet commitment are required.", code: "VALIDATION" };
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: displayName,
      diet_commitment: dietCommitment,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return { ok: false, error: error.message, code: "PROFILE_SAVE_FAILED" };
    }

    revalidatePath("/", "layout");
    return { ok: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save profile.";
    return { ok: false, error: message, code: "PROFILE_SAVE_FAILED" };
  }
}

export async function uploadAvatarAction(formData: FormData): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Session expired. Sign in again.", code: "AUTH_EXPIRED" };

    const file = formData.get("avatar");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "Choose an image under 10 MB.", code: "VALIDATION" };
    }
    if (file.size > 10 * 1024 * 1024) {
      return { ok: false, error: "Image must be 10 MB or smaller.", code: "IMAGE_TOO_LARGE" };
    }

    const path = `${user.id}/avatar.webp`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
      contentType: "image/webp",
    });
    if (error) {
      return { ok: false, error: error.message, code: "AVATAR_UPLOAD_FAILED" };
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ avatar_path: path, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (profileError) {
      return { ok: false, error: profileError.message, code: "PROFILE_SAVE_FAILED" };
    }

    revalidatePath("/", "layout");
    return { ok: true, data: path };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not upload avatar.";
    return { ok: false, error: message, code: "AVATAR_UPLOAD_FAILED" };
  }
}
