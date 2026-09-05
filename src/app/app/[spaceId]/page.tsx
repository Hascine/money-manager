import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAccountBalances } from "@/lib/balances";
import { formatIDR } from "@/lib/format";
import { ACCOUNT_TYPE_ICON } from "@/lib/account-icons";
import { getPeriodRange, formatPeriodLabel, todayISO } from "@/lib/period";
import { getExpenseTransfers } from "@/lib/transfers";
import { getDictionary, getLanguage } from "@/lib/i18n/get-language";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Wallet, Receipt } from "lucide-react";

export default async function SpaceDashboardPage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const supabase = await createClient();
  const thisMonth = getPeriodRange("month", todayISO());

  const [{ data: totalBalance }, { data: accounts }, { data: transactions }, balances, { data: monthTx }, expenseTransfers] =
    await Promise.all([
      supabase.from("space_balances").select("total_balance").eq("space_id", spaceId).maybeSingle(),
      supabase
        .from("accounts")
        .select("id, name, type")
        .eq("space_id", spaceId)
        .is("deleted_at", null)
        .eq("is_active", true),
      supabase
        .from("transactions")
        .select("id, type, amount, note, transaction_date, categories(name), accounts(name)")
        .eq("space_id", spaceId)
        .is("deleted_at", null)
        .order("transaction_date", { ascending: false })
        .limit(10),
      getAccountBalances(spaceId),
      supabase
        .from("transactions")
        .select("type, amount")
        .eq("space_id", spaceId)
        .is("deleted_at", null)
        .in("type", ["income", "expense"])
        .gte("transaction_date", thisMonth.start)
        .lte("transaction_date", thisMonth.end),
      getExpenseTransfers(spaceId, thisMonth.start, thisMonth.end),
    ]);

  const [t, lang] = await Promise.all([getDictionary(), getLanguage()]);
  const monthIncome = (monthTx ?? []).filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0);
  const monthExpense =
    (monthTx ?? []).filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0) +
    expenseTransfers.reduce((s, r) => s + r.amount, 0);
  const monthLabel = formatPeriodLabel("month", thisMonth.start, thisMonth.end, lang);

  return (
    <div className="flex flex-col gap-8">
      <section className="brand-gradient flex flex-col gap-1 rounded-3xl p-6 text-white shadow-lg shadow-teal-900/15">
        <p className="text-base font-medium text-white/80">{t.totalBalance}</p>
        <p className="text-4xl font-extrabold tracking-tight">
          {formatIDR(totalBalance?.total_balance ?? 0)}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">{monthLabel}</h2>
          <Link
            href={`/app/${spaceId}/reports`}
            className="flex items-center text-base font-medium text-foreground-muted"
          >
            {t.seeAll}
            <ChevronRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Card className="flex flex-col gap-1">
            <p className="text-sm text-foreground-muted">{t.reportsTotalIncome}</p>
            <p className="text-xl font-bold text-success">{formatIDR(monthIncome)}</p>
          </Card>
          <Card className="flex flex-col gap-1">
            <p className="text-sm text-foreground-muted">{t.reportsTotalExpense}</p>
            <p className="text-xl font-bold text-danger">{formatIDR(monthExpense)}</p>
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">{t.accountsSectionTitle}</h2>
          <Link
            href={`/app/${spaceId}/accounts`}
            className="flex items-center text-base font-medium text-foreground-muted"
          >
            {t.seeAll}
            <ChevronRight size={18} />
          </Link>
        </div>
        {accounts?.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {accounts.map((account) => {
              const Icon = ACCOUNT_TYPE_ICON[account.type];
              return (
                <Card key={account.id} className="flex flex-col gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-foreground-muted">
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="text-sm text-foreground-muted">{account.name}</p>
                    <p className="text-lg font-bold text-foreground">
                      {formatIDR(balances.get(account.id) ?? 0)}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Wallet}
            title={t.emptyAccountsTitle}
            description={t.emptyAccountsDescription}
          />
        )}
        <ButtonLink href={`/app/${spaceId}/accounts/new`} variant="secondary" className="self-start">
          <Plus size={18} />
          {t.addAccount}
        </ButtonLink>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">{t.recentTransactions}</h2>
        {transactions?.length ? (
          <Card className="divide-y divide-border p-0">
            {transactions.map((tx) => {
              const isInflow = tx.type === "income" || tx.type === "transfer_in";
              return (
                <div key={tx.id} className="flex items-center gap-3 px-5 py-4">
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
            })}
          </Card>
        ) : (
          <EmptyState icon={Receipt} title={t.emptyTransactionsTitle} description={t.emptyTransactionsDescription} />
        )}
      </section>
    </div>
  );
}
