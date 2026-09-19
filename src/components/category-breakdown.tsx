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
  /** Share of the section's total (income or expense), 0-100 — distinct from
   * the bar width below, which is sized against the largest entry instead. */
  sharePct?: number;
}

/** Sized against this section's own largest category, not the grand total —
 * so the biggest bar always reads full-width instead of shrinking whenever
 * one category dominates the period. */
export function CategoryBreakdown({ entries, tone }: { entries: CategoryAmount[]; tone: "success" | "danger" }) {
  const max = entries[0]?.amount ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {entries.map((entry) => {
        // Clamped since callers with a possibly-negative amount (e.g. an
        // overspent budget) would otherwise produce a negative or
        // out-of-range width.
        const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((entry.amount / max) * 100))) : 0;
        const bar = (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="flex items-center gap-1 truncate font-medium text-foreground">
                {entry.name}
                {entry.href && <ChevronRight size={14} className="shrink-0 text-foreground-muted" />}
              </span>
              <span className="shrink-0 text-foreground-muted">
                {formatIDR(entry.amount)}
                {entry.sharePct !== undefined && (
                  <span className="ml-1 text-foreground-muted/70">({entry.sharePct}%)</span>
                )}
              </span>
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
