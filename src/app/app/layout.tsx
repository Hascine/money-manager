import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserSpaces } from "@/lib/spaces";
import { getDictionary } from "@/lib/i18n/get-language";
import { SpaceSwitcher } from "@/components/space-switcher";
import { Logo } from "@/components/logo";
import { SideRail } from "@/components/side-rail";
import { signOut } from "../(auth)/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const spaces = await getUserSpaces();
  const t = await getDictionary();

  return (
    // On desktop this is a fixed-height, full-bleed app shell, stacked in two
    // layers: the header is the base layer, spanning the full width above
    // everything else; the rail is the second layer, running the full
    // remaining height on the left; the page itself sits to the right of
    // that. Only <main> scrolls. Mobile keeps ordinary page scrolling, where
    // a self-scrolling pane would fight the browser's own chrome.
    <div className="flex min-h-full flex-col lg:h-dvh lg:min-h-0 lg:w-full lg:overflow-hidden">
      {/* Sticky strip on mobile, where screen height is too precious to spend
          on margins; a full-width bar flush with the top edge on desktop. */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/95 px-4 py-3 backdrop-blur lg:static lg:shrink-0 lg:px-8 lg:py-4">
        <Link href="/app" className="shrink-0">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <SpaceSwitcher spaces={spaces} />
          <form action={signOut}>
            <button
              type="submit"
              aria-label={t.signOut}
              className="flex h-12 w-12 items-center justify-center rounded-full text-foreground-muted transition-colors hover:bg-surface-muted hover:text-danger"
            >
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <SideRail />
        <main className="flex flex-1 flex-col lg:min-h-0 lg:overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
