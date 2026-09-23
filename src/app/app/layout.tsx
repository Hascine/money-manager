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
    // On desktop this is a fixed-height app shell: the rail and the header stay
    // put and only <main> scrolls. Mobile keeps ordinary page scrolling, where
    // a self-scrolling pane would fight the browser's own chrome.
    <div className="flex min-h-full flex-col lg:mx-auto lg:h-dvh lg:min-h-0 lg:w-full lg:max-w-[110rem] lg:flex-row lg:gap-6 lg:overflow-hidden lg:p-6">
      <SideRail />

      <div className="flex min-w-0 flex-1 flex-col lg:min-h-0 lg:gap-6">
        {/* Sticky strip on mobile, where screen height is too precious to spend
            on margins; a fixed bar in the shell's top row on desktop. */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/95 px-4 py-3 backdrop-blur lg:static lg:shrink-0 lg:rounded-3xl lg:border lg:px-6 lg:py-4">
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

        <main className="flex flex-1 flex-col lg:min-h-0 lg:overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
