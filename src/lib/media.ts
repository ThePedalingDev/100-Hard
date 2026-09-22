import type { SupabaseClient } from "@supabase/supabase-js";

export type MediaBucket = "avatars" | "progress";

const AVATAR_SIGNED_OPTIONS = {
  transform: {
    width: 96,
    height: 96,
    resize: "cover" as const,
    quality: 80,
  },
};

export function mediaSrc(path: string | null, bucket: MediaBucket) {
  if (!path) return null;
  const safe = path
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `/api/media/${bucket}/${safe}`;
}

export async function createMediaSignedUrl(
  supabase: SupabaseClient,
  path: string,
  bucket: MediaBucket,
  expiresIn = 3600,
) {
  const options = bucket === "avatars" ? AVATAR_SIGNED_OPTIONS : undefined;
  return supabase.storage.from(bucket).createSignedUrl(path, expiresIn, options);
}
