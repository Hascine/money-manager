import Link from "next/link";
import { ArrowLeftRight, ChevronRight } from "lucide-react";
import { getCategoryVisual } from "@/lib/category-visuals";
import { Amount } from "@/components/ui/amount";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { TransactionType } from "@/lib/supabase/database.types";

export interface TransactionRowData {
  id: string;
  type: TransactionType;
  amount: number;
  note: string | null;
  transaction_date: string;
  category_id: string | null;
  categories: { name: string } | null;
  accounts: { name: string } | null;
}

function typeLabel(type: TransactionType, t: Dictionary) {
  if (type === "income") return t.typeIncome;
  if (type === "expense") return t.typeExpense;
  return type === "transfer_in" ? t.typeTransferIn : t.typeTransferOut;
}

export function TransactionRow({
  tx,
  t,
  href,
  showDate,
}: {
  tx: TransactionRowData;
  t: Dictionary;
  /** Omitted for rows with nothing to open — renders unlinked, without the chevron. */
  href?: string | null;
  showDate?: boolean;
}) {
  const isInflow = tx.type === "income" || tx.type === "transfer_in";
  const isTransfer = tx.type === "transfer_in" || tx.type === "transfer_out";
  const visual = getCategoryVisual(tx.category_id, tx.categories?.name);

  const title = tx.note || tx.categories?.name || typeLabel(tx.type, t);
  const subtitle = [tx.note ? tx.categories?.name : null, tx.accounts?.name, showDate ? tx.transaction_date : null]
    .filter(Boolean)
    .join(" · ");

  const body = (
    <div className="flex items-center gap-3 px-5 py-4">
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
          isTransfer && "bg-surface-muted text-foreground-muted"
        )}
        style={isTransfer ? undefined : { backgroundColor: visual.tint, color: visual.color }}
      >
        {isTransfer ? <ArrowLeftRight size={20} /> : <visual.Icon size={20} />}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{title}</p>
        {subtitle && <p className="truncate text-sm text-foreground-muted">{subtitle}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Amount value={tx.amount} direction={isInflow ? "in" : "out"} className="font-semibold" />
        {href && <ChevronRight size={16} className="text-foreground-muted" />}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className={cn("block transition-colors hover:bg-surface-muted active:bg-surface-muted")}>
      {body}
    </Link>
  ) : (
    <div>{body}</div>
  );
}
