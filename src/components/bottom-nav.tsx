"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { House, Receipt, Wallet, Menu, Plus, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTranslations } from "@/components/language-provider";

export function BottomNav({ spaceId }: { spaceId: string }) {
  const pathname = usePathname();
  const [addOpen, setAddOpen] = useState(false);
  const t = useTranslations();

  const items = [
    { href: `/app/${spaceId}`, label: t.navHome, icon: House, exact: true },
    { href: `/app/${spaceId}/transactions`, label: t.navTransactions, icon: Receipt },
  ];
  const itemsRight = [
    { href: `/app/${spaceId}/accounts`, label: t.navAccounts, icon: Wallet },
    { href: `/app/${spaceId}/more`, label: t.navMore, icon: Menu },
  ];

  const addOptions = [
    { href: `/app/${spaceId}/transactions/new?type=income`, label: t.navAddIncome, icon: ArrowDownLeft, tint: "text-success" },
    { href: `/app/${spaceId}/transactions/new?type=expense`, label: t.navAddExpense, icon: ArrowUpRight, tint: "text-danger" },
    { href: `/app/${spaceId}/transfer/new`, label: t.navAddTransfer, icon: ArrowLeftRight, tint: "text-brand-from" },
  ];

  function NavLink({ href, label, icon: Icon, exact }: (typeof items)[number]) {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return (
      <Link
        href={href}
        className={cn(
          "flex flex-1 flex-col items-center gap-1 px-1 py-2.5 text-xs font-medium transition-colors",
          active ? "text-brand-from" : "text-foreground-muted hover:text-foreground"
        )}
      >
        <Icon size={24} strokeWidth={active ? 2.4 : 2} />
        {label}
      </Link>
    );
  }

  return (
    <>
      {addOpen && (
        <button
          aria-label={t.close}
          className="fixed inset-0 z-20 bg-foreground/20 backdrop-blur-[2px]"
          onClick={() => setAddOpen(false)}
        />
      )}

      {addOpen && (
        <div className="fixed inset-x-0 bottom-24 z-30 mx-auto flex w-full max-w-2xl flex-col gap-2 px-4">
          {addOptions.map(({ href, label, icon: Icon, tint }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setAddOpen(false)}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-5 py-4 text-base font-semibold text-foreground shadow-lg"
            >
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted", tint)}>
                <Icon size={20} />
              </span>
              {label}
            </Link>
          ))}
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
        aria-label={t.mainNav}
      >
        <div className="mx-auto flex max-w-2xl items-stretch justify-between px-1">
          {items.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}

          <div className="flex flex-1 items-center justify-center">
            <button
              type="button"
              aria-label={addOpen ? t.navAddClose : t.navAddOpen}
              onClick={() => setAddOpen((v) => !v)}
              className="brand-gradient -mt-6 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg shadow-teal-900/25 transition-transform active:scale-95"
            >
              {addOpen ? <X size={26} /> : <Plus size={26} />}
            </button>
          </div>

          {itemsRight.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>
      </nav>
    </>
  );
}
