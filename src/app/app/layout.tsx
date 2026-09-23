import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserSpaces } from "@/lib/spaces";
import { getDictionary } from "@/lib/i18n/get-language";
import { SpaceSwitcher } from "@/components/space-switcher";
import { Logo } from "@/components/logo";
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
    <div className="flex min-h-full flex-col lg:mx-auto lg:w-full lg:max-w-[86rem] lg:px-6">
      {/* Floats as a rounded bar on desktop; stays a plain sticky strip on
          mobile, where screen height is too precious to spend on margins. */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/95 px-4 py-3 backdrop-blur lg:top-6 lg:mt-6 lg:rounded-3xl lg:border lg:px-6 lg:py-4">
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
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
