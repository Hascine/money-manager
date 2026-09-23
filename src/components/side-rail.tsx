"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { House, Receipt, Wallet, PieChart, Menu, Plus, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTranslations } from "@/components/language-provider";
import { addOptions } from "@/components/add-options";

/** Space ids are uuids, so this tells `/app/<uuid>/...` apart from the
 * space-less pages (`/app`, `/app/settings/...`, `/app/spaces/new`, …). */
const SPACE_PATH = /^\/app\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(\/|$)/i;

/** Desktop-only primary navigation: a dark icon column against the light
 * canvas. It sits outside the scrolling region, so it stays put while the
 * content moves. Icon-only, so every item carries a title/aria-label rather
 * than relying on the glyph alone. Hidden below lg, where BottomNav takes over.
 *
 * It reads the space from the pathname instead of taking it as a prop, so it
 * can live in the app shell alongside the header — the space layout renders
 * inside the scroll container and could not host a element that stays fixed. */
export function SideRail() {
  const pathname = usePathname();
  const t = useTranslations();
  const [addOpen, setAddOpen] = useState(false);

  const spaceId = pathname.match(SPACE_PATH)?.[1];
  if (!spaceId) return null;

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
      className="hidden w-[4.5rem] shrink-0 flex-col items-center gap-2 self-stretch rounded-3xl bg-rail py-5 lg:flex"
    >
      <div className="relative mb-3">
        <button
          type="button"
          aria-label={addOpen ? t.navAddClose : t.navAddOpen}
          aria-expanded={addOpen}
          onClick={() => setAddOpen((v) => !v)}
          className="brand-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg shadow-teal-900/30 transition-transform hover:scale-105"
        >
          {addOpen ? <X size={24} /> : <Plus size={24} />}
        </button>

        {addOpen && (
          <>
            <button
              type="button"
              aria-label={t.close}
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setAddOpen(false)}
            />
            <div className="absolute top-0 left-full z-50 ml-3 flex w-60 flex-col gap-1 rounded-2xl border border-border bg-surface p-2 shadow-xl">
              {addOptions(spaceId, t).map(({ href, label, icon: Icon, tint }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setAddOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold text-foreground transition-colors hover:bg-surface-muted"
                >
                  <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted", tint)}>
                    <Icon size={20} />
                  </span>
                  {label}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            title={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors",
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
