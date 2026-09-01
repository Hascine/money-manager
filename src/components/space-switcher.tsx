"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { User, Users, ChevronDown, Check, Plus, KeyRound } from "lucide-react";
import { cn } from "@/lib/cn";
import type { UserSpace } from "@/lib/spaces";
import { useTranslations } from "@/components/language-provider";

export function SpaceSwitcher({ spaces }: { spaces: UserSpace[] }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations();
  const pathname = usePathname();

  // The active space's id is the first path segment after /app/, but only
  // on routes nested under /app/[spaceId] — static routes like /app/join or
  // /app/spaces/new share that position with a non-id segment, so match
  // against the known spaces rather than assuming the segment is an id.
  const activeSpaceId = pathname.split("/")[2];
  const activeSpace = spaces.find((s) => s.id === activeSpaceId);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-12 max-w-40 items-center gap-2 rounded-full border border-border bg-surface px-4 text-base font-medium text-foreground transition-colors hover:bg-surface-muted"
      >
        <span className="truncate">{activeSpace?.name ?? t.space}</span>
        <ChevronDown
          size={18}
          className={cn("shrink-0 text-foreground-muted transition-transform", open && "rotate-180")}
        />
      </button>

      <button
        aria-label={t.close}
        tabIndex={open ? 0 : -1}
        className={cn(
          "fixed inset-0 z-10 cursor-default bg-foreground/10 backdrop-blur-[1px] transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
      />

      <div
        role="menu"
        aria-hidden={!open}
        className={cn(
          "absolute right-0 z-20 mt-2 w-64 origin-top-right rounded-2xl border border-border bg-surface py-2 shadow-xl transition-all duration-150",
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        )}
      >
        {spaces.map((space) => {
          const Icon = space.type === "PERSONAL" ? User : Users;
          const active = space.id === activeSpace?.id;
          return (
            <Link
              key={space.id}
              href={`/app/${space.id}`}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-base hover:bg-surface-muted",
                active ? "font-semibold text-foreground" : "text-foreground"
              )}
            >
              <Icon size={20} className={active ? "text-brand-from" : "text-foreground-muted"} />
              <span className="flex-1 truncate">{space.name}</span>
              {active && <Check size={18} className="shrink-0 text-brand-from" />}
            </Link>
          );
        })}
        <div className="my-2 border-t border-border" />
        <Link
          href="/app/spaces/new"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-4 py-3 text-base font-medium text-brand-from hover:bg-surface-muted"
        >
          <Plus size={20} />
          {t.createCollabSpace}
        </Link>
        <Link
          href="/app/join"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-4 py-3 text-base font-medium text-brand-from hover:bg-surface-muted"
        >
          <KeyRound size={20} />
          {t.joinWithCode}
        </Link>
      </div>
    </div>
  );
}
