import { createClient } from "@/lib/supabase/server";

type Client = Awaited<ReturnType<typeof createClient>>;

export async function resolveActiveChallengeId(supabase: Client, userId: string): Promise<string | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("active_challenge_id")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.active_challenge_id) {
    const { data: membership } = await supabase
      .from("challenge_members")
      .select("challenge_id")
      .eq("challenge_id", profile.active_challenge_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (membership) return membership.challenge_id;
  }

  const { data: latest } = await supabase
    .from("challenge_members")
    .select("challenge_id")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return latest?.challenge_id ?? null;
}
