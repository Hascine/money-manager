import { formatIDR } from "@/lib/format";
import { cn } from "@/lib/cn";

export interface CategoryAmount {
  name: string;
  amount: number;
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
        return (
          <div key={entry.name} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-medium text-foreground">{entry.name}</span>
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
      })}
    </div>
  );
}
