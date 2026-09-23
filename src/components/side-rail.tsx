"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Receipt, Wallet, PieChart, Menu, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTranslations } from "@/components/language-provider";

/** Desktop-only primary navigation: a dark icon column against the light
 * canvas. Icon-only, so every item carries a title/aria-label rather than
 * relying on the glyph alone. Hidden below lg, where BottomNav takes over. */
export function SideRail({ spaceId }: { spaceId: string }) {
  const pathname = usePathname();
  const t = useTranslations();

  const items = [
    { href: `/app/${spaceId}`, label: t.navHome, icon: House, exact: true },
    { href: `/app/${spaceId}/transactions`, label: t.navTransactions, icon: Receipt },
    { href: `/app/${spaceId}/accounts`, label: t.navAccounts, icon: Wallet },
    { href: `/app/${spaceId}/reports`, label: t.menuReports, icon: PieChart },
    { href: `/app/${spaceId}/more`, label: t.navMore, icon: Menu },
  ];

  return (
    <nav
      aria-label={t.mainNav}
      className="sticky top-6 hidden h-[calc(100dvh-3rem)] w-[4.5rem] shrink-0 flex-col items-center gap-2 rounded-3xl bg-rail py-5 lg:flex"
    >
      <Link
        href={`/app/${spaceId}/transactions/new`}
        title={t.newTransaction}
        className="brand-gradient mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg shadow-teal-900/30 transition-transform hover:scale-105"
      >
        <Plus size={24} />
        <span className="sr-only">{t.newTransaction}</span>
      </Link>

      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            title={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
              active
                ? "bg-brand-from text-rail-fg-active"
                : "text-rail-fg hover:bg-white/10 hover:text-rail-fg-active"
            )}
          >
            <Icon size={22} strokeWidth={active ? 2.4 : 2} />
            <span className="sr-only">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
