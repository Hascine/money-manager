import { redirect } from "next/navigation";
import { User, Users } from "lucide-react";
import { assertSpaceMember } from "@/lib/spaces";
import { hasCompletedOnboarding } from "@/lib/onboarding";
import { SpaceRealtimeProvider } from "@/components/space-realtime-provider";
import { BottomNav } from "@/components/bottom-nav";

export default async function SpaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  if (!(await hasCompletedOnboarding())) redirect("/app/onboarding");
  const space = await assertSpaceMember(spaceId);
  const Icon = space.type === "PERSONAL" ? User : Users;

  return (
    // The rail and header live in the app shell above; this is the scrolling
    // column, so it only owns the space heading and the page itself.
    <div className="flex min-w-0 flex-1 flex-col pb-24 lg:pb-0">
      <SpaceRealtimeProvider spaceId={spaceId} />
      <div className="flex items-center gap-2 px-4 pt-5 pb-2 lg:px-0 lg:pt-0">
        <Icon size={18} className="text-foreground-muted" />
        <h1 className="text-base font-semibold text-foreground-muted">{space.name}</h1>
      </div>
      <div className="flex-1 px-4 pb-6 lg:px-0">{children}</div>

      <BottomNav spaceId={spaceId} />
    </div>
  );
}
