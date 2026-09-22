import { redirect } from "next/navigation";
import { AdminDesk, type AdminAccount } from "@/components/admin-desk";
import { PageHeader } from "@/components/plate";
import { isAdminEmail } from "@/lib/admin";
import { loadAppContext, requireUser } from "@/lib/data";
import type { Challenge } from "@/lib/supabase/types";

export default async function AdminPage() {
  const context = await loadAppContext();
  if (!context) redirect("/login");
  if (!isAdminEmail(context.email)) redirect("/dashboard");

  const { supabase } = await requireUser();
  const { data: accounts } = await supabase.rpc("admin_list_accounts");
  const { data: challenges } = await supabase
    .from("challenges")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Admin" kicker="Accounts and challenges" />
      <AdminDesk
        accounts={(accounts ?? []) as AdminAccount[]}
        challenges={(challenges ?? []) as Challenge[]}
      />
    </div>
  );
}
