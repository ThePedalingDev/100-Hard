import { redirect } from "next/navigation";
import { AdminDesk, type AdminAccount } from "@/components/admin-desk";
import { PageHeader } from "@/components/plate";
import { isAdminEmail } from "@/lib/admin";
import { loadAppContext, requireUser, signedUrl } from "@/lib/data";
import type { Challenge } from "@/lib/supabase/types";

type RpcAccount = {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  active_challenge_id: string | null;
};

export default async function AdminPage() {
  const context = await loadAppContext();
  if (!context) redirect("/login");
  if (!isAdminEmail(context.email)) redirect("/dashboard");

  const { supabase } = await requireUser();
  const [{ data: rpcAccounts }, { data: challenges }, { data: profiles }, { data: memberships }] = await Promise.all([
    supabase.rpc("admin_list_accounts"),
    supabase.from("challenges").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, display_name, avatar_path, diet_commitment, created_at, updated_at"),
    supabase.from("challenge_members").select("user_id, challenge_id"),
  ]);

  const typedChallenges = (challenges ?? []) as Challenge[];
  const challengeName = new Map(typedChallenges.map((row) => [row.id, row.name]));
  const profileById = new Map(
    (
      (profiles ?? []) as Array<{
        id: string;
        display_name: string;
        avatar_path: string | null;
        diet_commitment: string | null;
      }>
    ).map((row) => [row.id, row]),
  );
  const challengesByUser = new Map<string, string[]>();
  for (const row of memberships ?? []) {
    const userId = row.user_id as string;
    const current = challengesByUser.get(userId) ?? [];
    current.push(row.challenge_id as string);
    challengesByUser.set(userId, current);
  }

  const accounts: AdminAccount[] = await Promise.all(
    ((rpcAccounts ?? []) as RpcAccount[]).map(async (account) => {
      const profile = profileById.get(account.id);
      const challengeIds = challengesByUser.get(account.id) ?? [];
      return {
        id: account.id,
        email: account.email,
        display_name: profile?.display_name ?? account.display_name,
        created_at: account.created_at,
        avatarUrl: await signedUrl(profile?.avatar_path ?? null, "avatars"),
        diet_commitment: profile?.diet_commitment ?? null,
        active_challenge_id: account.active_challenge_id,
        challenges: challengeIds.map((id) => ({
          id,
          name: challengeName.get(id) ?? "Unnamed challenge",
          active: id === account.active_challenge_id,
        })),
      };
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Admin" kicker="Accounts and challenges" />
      <AdminDesk accounts={accounts} challenges={typedChallenges} />
    </div>
  );
}
