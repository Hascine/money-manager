import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatIDR } from "@/lib/format";
import { cn } from "@/lib/cn";

export interface CategoryAmount {
  name: string;
  amount: number;
  /** Omit for entries with no underlying transaction list to drill into
   * (e.g. the synthetic "Transfers" row) — renders as a plain, unlinked row. */
  href?: string;
}

/** Sized against this section's own largest category, not the grand total —
 * so the biggest bar always reads full-width instead of shrinking whenever
 * one category dominates the period. */
export function CategoryBreakdown({ entries, tone }: { entries: CategoryAmount[]; tone: "success" | "danger" }) {
  const max = entries[0]?.amount ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {entries.map((entry) => {
        const pct = max > 0 ? Math.round((entry.amount / max) * 100) : 0;
        const bar = (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="flex items-center gap-1 truncate font-medium text-foreground">
                {entry.name}
                {entry.href && <ChevronRight size={14} className="shrink-0 text-foreground-muted" />}
              </span>
              <span className="shrink-0 text-foreground-muted">{formatIDR(entry.amount)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className={cn("h-full rounded-full", tone === "success" ? "bg-success" : "bg-danger")}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );

        return entry.href ? (
          <Link key={entry.name} href={entry.href} className="-m-1 rounded-lg p-1 hover:bg-surface-muted">
            {bar}
          </Link>
        ) : (
          <div key={entry.name}>{bar}</div>
        );
      })}
    </div>
  );
}
