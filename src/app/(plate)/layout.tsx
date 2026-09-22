import { redirect } from "next/navigation";
import { AppNav } from "@/components/nav";
import { Plate } from "@/components/plate";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { loadAppContext } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PlateLayout({ children }: { children: React.ReactNode }) {
  const context = await loadAppContext();
  if (!context) redirect("/login");

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-4 pb-24 pt-6 md:pb-10">
      <AppNav />
      <RealtimeRefresh challengeId={context.challenge?.id} />
      {context.loadError ? (
        <Plate>
          <h1 className="stamp text-[32px] leading-none">Could not load the plate</h1>
          <p className="mt-2 text-sm leading-6 text-steel">
            The challenge data did not load. Sign out and back in, or try again.
          </p>
        </Plate>
      ) : (
        children
      )}
    </div>
  );
}
