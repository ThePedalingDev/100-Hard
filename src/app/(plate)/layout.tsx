import { redirect } from "next/navigation";
import { AppNav } from "@/components/nav";
import { PageEnter } from "@/components/page-enter";
import { Plate } from "@/components/plate";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { SocialNoticesProvider } from "@/components/social-notices-provider";
import { loadAppContext, loadSystemChatNotices } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PlateLayout({ children }: { children: React.ReactNode }) {
  const context = await loadAppContext();
  if (!context) redirect("/login");

  const systemNotices = context.challenge
    ? await loadSystemChatNotices(context.challenge.id, context.userId)
    : [];

  return (
    <SocialNoticesProvider userId={context.userId} messages={systemNotices}>
      <div className="plate-frame">
        <AppNav />
        <div className="plate-scroll">
          <div className="content-shell">
            <RealtimeRefresh challengeId={context.challenge?.id} />
            <PageEnter>
              {context.loadError ? (
                <Plate>
                  <h1 className="text-[32px] leading-none">Could not load the plate</h1>
                  <p className="mt-2 text-sm leading-6 text-steel">
                    The challenge data did not load. Sign out and back in, or try again.
                  </p>
                </Plate>
              ) : (
                children
              )}
            </PageEnter>
          </div>
        </div>
      </div>
    </SocialNoticesProvider>
  );
}
