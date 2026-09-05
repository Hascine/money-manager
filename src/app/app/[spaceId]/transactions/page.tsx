import Link from "next/link";
import { Plus, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatIDR } from "@/lib/format";
import { formatPeriodLabel, type Period } from "@/lib/period";
import { getDictionary, getLanguage } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { BackLink } from "@/components/ui/back-link";
import { EmptyState } from "@/components/ui/empty-state";
import { Receipt } from "lucide-react";

const PERIODS: Period[] = ["day", "week", "month", "year"];

export default async function TransactionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ spaceId: string }>;
  searchParams: Promise<{ type?: string; category?: string; period?: string; start?: string; end?: string }>;
}) {
  const { spaceId } = await params;
  const { type, category, period, start, end } = await searchParams;
  const supabase = await createClient();

  const isFiltered = Boolean(type || category || start || end);

  let query = supabase
    .from("transactions")
    .select("id, type, amount, note, transaction_date, categories(name), accounts(name)")
    .eq("space_id", spaceId)
    .is("deleted_at", null);

  if (type === "income" || type === "expense") query = query.eq("type", type);
  if (category === "uncategorized") query = query.is("category_id", null);
  else if (category) query = query.eq("category_id", category);
  if (start) query = query.gte("transaction_date", start);
  if (end) query = query.lte("transaction_date", end);
  query = query.order("transaction_date", { ascending: false });
  if (!isFiltered) query = query.limit(100);

  const [{ data: transactions }, { data: transfers }, { data: categoryRow }, t, lang] = await Promise.all([
    query,
    supabase
      .from("transfers")
      .select("id, out_transaction_id, in_transaction_id")
      .or(`from_space_id.eq.${spaceId},to_space_id.eq.${spaceId}`)
      .is("deleted_at", null),
    category && category !== "uncategorized"
      ? supabase.from("categories").select("name").eq("id", category).maybeSingle()
      : Promise.resolve({ data: null }),
    getDictionary(),
    getLanguage(),
  ]);

  // Each transfer leg is its own transaction row, so map both legs back to
  // the transfers row that groups them, for the edit link below.
  const transferIdByTransactionId = new Map<string, string>();
  for (const transfer of transfers ?? []) {
    transferIdByTransactionId.set(transfer.out_transaction_id, transfer.id);
    transferIdByTransactionId.set(transfer.in_transaction_id, transfer.id);
  }

  const filterTitle = category === "uncategorized" ? t.reportsUncategorized : (categoryRow?.name ?? t.transactionsTitle);
  const filterDescription =
    isFiltered && period && start && end
      ? formatPeriodLabel(PERIODS.includes(period as Period) ? (period as Period) : "month", start, end, lang)
      : undefined;

  return (
    <div className="flex flex-col gap-4">
      {isFiltered && <BackLink href={`/app/${spaceId}/reports`} label={t.back} />}
      <PageHeader
        title={isFiltered ? filterTitle : t.transactionsTitle}
        description={filterDescription}
        action={
          <ButtonLink href={`/app/${spaceId}/transactions/new`} size="md">
            <Plus size={18} />
            {t.newTransaction}
          </ButtonLink>
        }
      />
      {transactions?.length ? (
        <Card className="divide-y divide-border p-0">
          {transactions.map((tx) => {
            const isInflow = tx.type === "income" || tx.type === "transfer_in";
            const isTransfer = tx.type === "transfer_in" || tx.type === "transfer_out";
            const editHref =
              tx.type === "income" || tx.type === "expense"
                ? `/app/${spaceId}/transactions/${tx.id}/edit`
                : isTransfer && transferIdByTransactionId.has(tx.id)
                  ? `/app/${spaceId}/transfer/${transferIdByTransactionId.get(tx.id)}/edit`
                  : null;
            const Row = (
              <div className="flex items-center gap-3 px-5 py-4">
                <span
                  className={
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full " +
                    (isInflow ? "bg-success/10 text-success" : "bg-danger/10 text-danger")
                  }
                >
                  {isInflow ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {tx.note || tx.categories?.name || tx.type}
                  </p>
                  <p className="text-sm text-foreground-muted">
                    {tx.accounts?.name} · {tx.transaction_date}
                  </p>
                </div>
                <p className={"font-semibold " + (isInflow ? "text-success" : "text-danger")}>
                  {isInflow ? "+" : "-"}
                  {formatIDR(tx.amount)}
                </p>
              </div>
            );
            return editHref ? (
              <Link key={tx.id} href={editHref} className="block hover:bg-surface-muted">
                {Row}
              </Link>
            ) : (
              <div key={tx.id}>{Row}</div>
            );
          })}
        </Card>
      ) : (
        <EmptyState icon={Receipt} title={t.emptyTransactionsTitle} description={t.emptyTransactionsDescription} />
      )}
    </div>
  );
}
