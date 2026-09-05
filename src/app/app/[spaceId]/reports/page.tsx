import { ChevronLeft, ChevronRight, PieChart } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, getLanguage } from "@/lib/i18n/get-language";
import { formatIDR } from "@/lib/format";
import { getPeriodRange, formatPeriodLabel, todayISO, type Period } from "@/lib/period";
import { getExpenseTransfers } from "@/lib/transfers";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { BackLink } from "@/components/ui/back-link";
import { EmptyState } from "@/components/ui/empty-state";
import { CategoryBreakdown, type CategoryAmount } from "@/components/category-breakdown";
import { cn } from "@/lib/cn";

const PERIODS: Period[] = ["day", "week", "month", "year"];

function groupByCategory(
  rows: { amount: number; categories: { name: string } | null }[],
  uncategorizedLabel: string
): CategoryAmount[] {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const name = row.categories?.name ?? uncategorizedLabel;
    totals.set(name, (totals.get(name) ?? 0) + row.amount);
  }
  return [...totals.entries()].map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
}

export default async function ReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ spaceId: string }>;
  searchParams: Promise<{ period?: string; date?: string }>;
}) {
  const { spaceId } = await params;
  const sp = await searchParams;

  const period: Period = PERIODS.includes(sp.period as Period) ? (sp.period as Period) : "month";
  const referenceDate = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : todayISO();
  const range = getPeriodRange(period, referenceDate);

  const [lang, t, supabase] = await Promise.all([getLanguage(), getDictionary(), createClient()]);
  const label = formatPeriodLabel(period, range.start, range.end, lang);

  const [{ data: transactions }, expenseTransfers] = await Promise.all([
    supabase
      .from("transactions")
      .select("type, amount, categories(name)")
      .eq("space_id", spaceId)
      .is("deleted_at", null)
      .in("type", ["income", "expense"])
      .gte("transaction_date", range.start)
      .lte("transaction_date", range.end),
    getExpenseTransfers(spaceId, range.start, range.end),
  ]);

  const incomeRows = (transactions ?? []).filter((r) => r.type === "income");
  const expenseRows = (transactions ?? []).filter((r) => r.type === "expense");
  const totalIncome = incomeRows.reduce((sum, r) => sum + r.amount, 0);
  const transfersAsExpense = expenseTransfers.reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = expenseRows.reduce((sum, r) => sum + r.amount, 0) + transfersAsExpense;
  const incomeByCategory = groupByCategory(incomeRows, t.reportsUncategorized);
  const expenseByCategory = groupByCategory(expenseRows, t.reportsUncategorized);
  if (transfersAsExpense > 0) {
    expenseByCategory.push({ name: t.reportsTransfers, amount: transfersAsExpense });
    expenseByCategory.sort((a, b) => b.amount - a.amount);
  }
  const net = totalIncome - totalExpense;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <BackLink href={`/app/${spaceId}/more`} label={t.back} />
      <PageHeader title={t.reportsTitle} />

      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <Link
            key={p}
            href={`/app/${spaceId}/reports?period=${p}`}
            className={cn(
              "flex-1 rounded-full py-2 text-center text-sm font-medium transition-colors",
              p === period ? "brand-gradient text-white" : "bg-surface-muted text-foreground-muted hover:text-foreground"
            )}
          >
            {t[`reports${p[0].toUpperCase()}${p.slice(1)}` as "reportsDay"]}
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Link
          href={`/app/${spaceId}/reports?period=${period}&date=${range.prevDate}`}
          aria-label={t.reportsPrev}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted hover:text-foreground"
        >
          <ChevronLeft size={20} />
        </Link>
        <span className="text-base font-semibold text-foreground">{label}</span>
        <Link
          href={`/app/${spaceId}/reports?period=${period}&date=${range.nextDate}`}
          aria-label={t.reportsNext}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted hover:text-foreground"
        >
          <ChevronRight size={20} />
        </Link>
      </div>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground-muted">{t.reportsTotalIncome}</span>
          <span className="font-semibold text-success">{formatIDR(totalIncome)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground-muted">{t.reportsTotalExpense}</span>
          <span className="font-semibold text-danger">{formatIDR(totalExpense)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm font-medium text-foreground">{t.reportsNet}</span>
          <span className={cn("font-bold", net >= 0 ? "text-success" : "text-danger")}>{formatIDR(net)}</span>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">{t.reportsExpenseByCategory}</h2>
        {expenseByCategory.length ? (
          <Card>
            <CategoryBreakdown entries={expenseByCategory} tone="danger" />
          </Card>
        ) : (
          <EmptyState icon={PieChart} title={t.emptyReportsTitle} description={t.emptyReportsDescription} />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">{t.reportsIncomeByCategory}</h2>
        {incomeByCategory.length ? (
          <Card>
            <CategoryBreakdown entries={incomeByCategory} tone="success" />
          </Card>
        ) : (
          <EmptyState icon={PieChart} title={t.emptyReportsTitle} description={t.emptyReportsDescription} />
        )}
      </div>
    </div>
  );
}
