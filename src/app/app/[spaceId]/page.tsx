import Link from "next/link";
import { ChevronRight, Plus, TrendingDown, TrendingUp, Wallet, Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAccountBalances } from "@/lib/balances";
import { formatIDR } from "@/lib/format";
import { ACCOUNT_TYPE_ICON } from "@/lib/account-icons";
import { getPeriodRange, formatPeriodLabel, todayISO } from "@/lib/period";
import { getExpenseTransfers } from "@/lib/transfers";
import { getDictionary, getLanguage } from "@/lib/i18n/get-language";
import { Card } from "@/components/ui/card";
import { Amount } from "@/components/ui/amount";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TransactionRow, type TransactionRowData } from "@/components/transaction-row";
import { cn } from "@/lib/cn";

const TX_FIELDS = "id, type, amount, note, transaction_date, category_id, categories(name), accounts(name)";

export default async function SpaceDashboardPage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const supabase = await createClient();
  const today = todayISO();
  const thisMonth = getPeriodRange("month", today);

  const [
    { data: totalBalance },
    { data: accounts },
    { data: todayTx },
    { data: recentTx },
    balances,
    { data: monthTx },
    expenseTransfers,
    { data: space },
    { data: allocations },
  ] = await Promise.all([
    supabase.from("space_balances").select("total_balance").eq("space_id", spaceId).maybeSingle(),
    supabase
      .from("accounts")
      .select("id, name, type")
      .eq("space_id", spaceId)
      .is("deleted_at", null)
      .eq("is_active", true),
    supabase
      .from("transactions")
      .select(TX_FIELDS)
      .eq("space_id", spaceId)
      .is("deleted_at", null)
      .eq("transaction_date", today)
      .order("created_at", { ascending: false }),
    supabase
      .from("transactions")
      .select(TX_FIELDS)
      .eq("space_id", spaceId)
      .is("deleted_at", null)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8),
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
    supabase.from("spaces").select("monthly_pot_budget").eq("id", spaceId).single(),
    supabase
      .from("pot_entries")
      .select("amount, pots!inner(deleted_at)")
      .eq("space_id", spaceId)
      .eq("type", "allocation")
      .is("deleted_at", null)
      .is("pots.deleted_at", null)
      .gte("entry_date", thisMonth.start)
      .lte("entry_date", thisMonth.end),
  ]);

  const [t, lang] = await Promise.all([getDictionary(), getLanguage()]);

  const monthIncome = (monthTx ?? []).filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0);
  const monthExpense =
    (monthTx ?? []).filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0) +
    expenseTransfers.reduce((s, r) => s + r.amount, 0);
  const monthNet = monthIncome - monthExpense;
  const monthLabel = formatPeriodLabel("month", thisMonth.start, thisMonth.end, lang);
  const flowMax = Math.max(monthIncome, monthExpense);

  const budget = space?.monthly_pot_budget ?? null;
  const allocated = (allocations ?? []).reduce((sum, row) => sum + row.amount, 0);
  const budgetPct = budget && budget > 0 ? Math.max(0, Math.min(100, Math.round((allocated / budget) * 100))) : 0;

  const todayRows = (todayTx ?? []) as TransactionRowData[];
  const recentRows = (recentTx ?? []) as TransactionRowData[];
  const showingToday = todayRows.length > 0;
  const listRows = showingToday ? todayRows : recentRows;

  return (
    <div className="flex flex-col gap-8">
      <section className="brand-gradient flex flex-col gap-1 rounded-3xl p-6 text-white shadow-lg shadow-teal-900/15">
        <p className="text-base font-medium text-white/80">{t.totalBalance}</p>
        <p className="tabular text-4xl font-extrabold tracking-tight">
          {formatIDR(totalBalance?.total_balance ?? 0)}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-white/90">
          {monthNet >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="tabular">
            {monthNet >= 0 ? "+" : "−"}
            {formatIDR(Math.abs(monthNet))}
          </span>
          <span className="text-white/70">{t.thisMonthSuffix}</span>
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

        <Card className="flex flex-col gap-4">
          {(
            [
              { label: t.reportsTotalIncome, value: monthIncome, tone: "success" as const },
              { label: t.reportsTotalExpense, value: monthExpense, tone: "danger" as const },
            ]
          ).map((row) => (
            <div key={row.label} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-foreground-muted">{row.label}</span>
                <Amount
                  value={row.value}
                  className={cn("font-semibold", row.tone === "success" ? "text-success" : "text-danger")}
                />
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                <div
                  className={cn("h-full rounded-full", row.tone === "success" ? "bg-success" : "bg-danger")}
                  style={{ width: `${flowMax > 0 ? Math.round((row.value / flowMax) * 100) : 0}%` }}
                />
              </div>
            </div>
          ))}

          {budget !== null && budget > 0 && (
            <div className="flex flex-col gap-1.5 border-t border-border pt-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-foreground-muted">{t.fieldMonthlyBudget}</span>
                <span className="tabular text-sm font-medium text-foreground">
                  {formatIDR(allocated)} / {formatIDR(budget)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full rounded-full bg-brand-from" style={{ width: `${budgetPct}%` }} />
              </div>
            </div>
          )}
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {showingToday ? t.dashboardToday : t.recentTransactions}
          </h2>
          <Link
            href={`/app/${spaceId}/transactions`}
            className="flex items-center text-base font-medium text-foreground-muted"
          >
            {t.seeAll}
            <ChevronRight size={18} />
          </Link>
        </div>
        {listRows.length ? (
          <Card className="divide-y divide-border p-0">
            {listRows.map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                t={t}
                showDate={!showingToday}
                href={
                  tx.type === "income" || tx.type === "expense"
                    ? `/app/${spaceId}/transactions/${tx.id}/edit`
                    : null
                }
              />
            ))}
          </Card>
        ) : (
          <EmptyState icon={Receipt} title={t.emptyTransactionsTitle} description={t.emptyTransactionsDescription} />
        )}
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
                <Link
                  key={account.id}
                  href={`/app/${spaceId}/accounts/${account.id}/edit`}
                  className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-5 shadow-sm shadow-black/[0.03] transition-colors hover:bg-surface-muted"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-foreground-muted">
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="truncate text-sm text-foreground-muted">{account.name}</p>
                    <p className="tabular text-lg font-bold text-foreground">
                      {formatIDR(balances.get(account.id) ?? 0)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={Wallet} title={t.emptyAccountsTitle} description={t.emptyAccountsDescription} />
        )}
        <ButtonLink href={`/app/${spaceId}/accounts/new`} variant="secondary" className="self-start">
          <Plus size={18} />
          {t.addAccount}
        </ButtonLink>
      </section>
    </div>
  );
}
