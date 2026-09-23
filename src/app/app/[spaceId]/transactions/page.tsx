import { Plus, Download, Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPeriodLabel, todayISO, type Period } from "@/lib/period";
import { getDictionary, getLanguage } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Amount } from "@/components/ui/amount";
import { ButtonLink } from "@/components/ui/button";
import { BackLink } from "@/components/ui/back-link";
import { EmptyState } from "@/components/ui/empty-state";
import { TransactionRow, type TransactionRowData } from "@/components/transaction-row";

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
    .select("id, type, amount, note, transaction_date, category_id, categories(name), accounts(name)")
    .eq("space_id", spaceId)
    .is("deleted_at", null);

  if (type === "income" || type === "expense") query = query.eq("type", type);
  if (category === "uncategorized") query = query.is("category_id", null);
  else if (category) query = query.eq("category_id", category);
  if (start) query = query.gte("transaction_date", start);
  if (end) query = query.lte("transaction_date", end);
  // transaction_date is date-only, so created_at is what actually orders
  // entries made on the same day — newest first within each date group.
  query = query.order("transaction_date", { ascending: false }).order("created_at", { ascending: false });
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

  // The query already returns newest-first, and Map keeps insertion order, so
  // both the groups and the rows inside them come out descending for free.
  const groups = new Map<string, TransactionRowData[]>();
  for (const tx of (transactions ?? []) as TransactionRowData[]) {
    const bucket = groups.get(tx.transaction_date);
    if (bucket) bucket.push(tx);
    else groups.set(tx.transaction_date, [tx]);
  }

  const today = todayISO();
  const yesterday = new Date(Date.parse(`${today}T00:00:00Z`) - 86400000).toISOString().slice(0, 10);
  function dayLabel(date: string) {
    if (date === today) return t.dateToday;
    if (date === yesterday) return t.dateYesterday;
    return formatPeriodLabel("day", date, date, lang);
  }

  function editHrefFor(tx: TransactionRowData) {
    if (tx.type === "income" || tx.type === "expense") return `/app/${spaceId}/transactions/${tx.id}/edit`;
    const transferId = transferIdByTransactionId.get(tx.id);
    return transferId ? `/app/${spaceId}/transfer/${transferId}/edit` : null;
  }

  const filterTitle = category === "uncategorized" ? t.reportsUncategorized : (categoryRow?.name ?? t.transactionsTitle);
  const filterDescription =
    isFiltered && period && start && end
      ? formatPeriodLabel(PERIODS.includes(period as Period) ? (period as Period) : "month", start, end, lang)
      : undefined;

  const filteredExportHref = (() => {
    const qs = new URLSearchParams();
    if (type) qs.set("type", type);
    if (category) qs.set("category", category);
    if (start) qs.set("start", start);
    if (end) qs.set("end", end);
    qs.set("scope", "filtered");
    return `/app/${spaceId}/transactions/export?${qs.toString()}`;
  })();

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

      <div className="flex gap-2">
        {isFiltered && (
          <a
            href={filteredExportHref}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-muted"
          >
            <Download size={16} />
            {t.exportFiltered}
          </a>
        )}
        <a
          href={`/app/${spaceId}/transactions/export?scope=all`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-muted"
        >
          <Download size={16} />
          {t.exportAll}
        </a>
      </div>

      {groups.size ? (
        <div className="flex flex-col gap-5">
          {[...groups.entries()].map(([date, rows]) => {
            const net = rows.reduce(
              (sum, tx) => sum + (tx.type === "income" || tx.type === "transfer_in" ? tx.amount : -tx.amount),
              0
            );
            return (
              <section key={date} className="rise-in flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3 px-1">
                  <h2 className="text-sm font-semibold text-foreground">{dayLabel(date)}</h2>
                  <Amount value={net} colorBySign className="text-sm font-medium" />
                </div>
                <Card padded={false} className="divide-y divide-border">
                  {rows.map((tx) => (
                    <TransactionRow key={tx.id} tx={tx} t={t} href={editHrefFor(tx)} />
                  ))}
                </Card>
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Receipt} title={t.emptyTransactionsTitle} description={t.emptyTransactionsDescription} />
      )}
    </div>
  );
}
