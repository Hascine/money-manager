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
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/95 px-4 py-3 backdrop-blur">
        <Link href="/app">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <SpaceSwitcher spaces={spaces} />
          <form action={signOut}>
            <button
              type="submit"
              aria-label={t.signOut}
              className="flex h-12 w-12 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted hover:text-danger"
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
