import Link from "next/link";
import { Plus, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatIDR } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Receipt } from "lucide-react";

export default async function TransactionsPage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const supabase = await createClient();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("id, type, amount, note, transaction_date, categories(name), accounts(name)")
    .eq("space_id", spaceId)
    .is("deleted_at", null)
    .order("transaction_date", { ascending: false })
    .limit(100);

  const t = await getDictionary();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t.transactionsTitle}
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
            const isEditable = tx.type === "income" || tx.type === "expense";
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
            return isEditable ? (
              <Link key={tx.id} href={`/app/${spaceId}/transactions/${tx.id}/edit`} className="block hover:bg-surface-muted">
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
