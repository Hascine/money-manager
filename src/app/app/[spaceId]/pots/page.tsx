import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Plus, ArrowLeftRight, Wallet2, PiggyBank } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPotBalances } from "@/lib/balances";
import { formatIDR } from "@/lib/format";
import { getPeriodRange, todayISO } from "@/lib/period";
import { getDictionary } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { AmountInput } from "@/components/ui/amount-input";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";

export default async function PotsPage({
  params,
  searchParams,
}: {
  params: Promise<{ spaceId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { spaceId } = await params;
  const { error: errorParam } = await searchParams;
  const supabase = await createClient();
  const thisMonth = getPeriodRange("month", todayISO());

  const [{ data: pots }, balances, { data: space }, { data: allocations }] = await Promise.all([
    supabase.from("pots").select("id, name").eq("space_id", spaceId).is("deleted_at", null).order("created_at"),
    getPotBalances(spaceId),
    supabase.from("spaces").select("monthly_pot_budget").eq("id", spaceId).single(),
    supabase
      .from("pot_entries")
      .select("amount")
      .eq("space_id", spaceId)
      .eq("type", "allocation")
      .is("deleted_at", null)
      .gte("entry_date", thisMonth.start)
      .lte("entry_date", thisMonth.end),
  ]);

  const t = await getDictionary();
  const budget = space?.monthly_pot_budget ?? null;
  const allocatedThisMonth = (allocations ?? []).reduce((sum, row) => sum + row.amount, 0);
  const remaining = budget !== null ? budget - allocatedThisMonth : null;
  const pct = budget && budget > 0 ? Math.min(100, Math.round((allocatedThisMonth / budget) * 100)) : 0;

  async function setBudget(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const raw = String(formData.get("monthly_pot_budget") || "");
    const { error } = await supabase
      .from("spaces")
      .update({ monthly_pot_budget: raw ? Number(raw) : null })
      .eq("id", spaceId);

    if (error) redirect(`/app/${spaceId}/pots?error=${encodeURIComponent(error.message)}`);
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/pots`);
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t.potsTitle}
        action={
          <ButtonLink href={`/app/${spaceId}/pots/new`} size="md">
            <Plus size={18} />
            {t.newPot}
          </ButtonLink>
        }
      />

      {errorParam && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">{errorParam}</p>
      )}

      <Card className="flex flex-col gap-3">
        <form action={setBudget} className="flex items-end gap-2">
          <div className="flex-1">
            <Field label={t.fieldMonthlyBudget} hint={t.fieldMonthlyBudgetHint}>
              <AmountInput name="monthly_pot_budget" defaultValue={budget ?? undefined} />
            </Field>
          </div>
          <Button type="submit" variant="secondary">
            {t.save}
          </Button>
        </form>
        {budget !== null && budget > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground-muted">
                {t.potAllocatedThisMonth}: {formatIDR(allocatedThisMonth)}
              </span>
              <span className={cn("font-medium", (remaining ?? 0) < 0 ? "text-danger" : "text-foreground")}>
                {t.potRemainingBudget}: {formatIDR(remaining ?? 0)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full rounded-full bg-brand-from" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </Card>

      {pots?.length ? (
        <div className="flex gap-2">
          <Link
            href={`/app/${spaceId}/pots/allocate`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-muted"
          >
            <Wallet2 size={16} />
            {t.potAllocateTitle}
          </Link>
          <Link
            href={`/app/${spaceId}/pots/transfer`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-muted"
          >
            <ArrowLeftRight size={16} />
            {t.potTransferTitle}
          </Link>
        </div>
      ) : null}

      {pots?.length ? (
        <Card className="divide-y divide-border p-0">
          {pots.map((pot) => (
            <Link
              key={pot.id}
              href={`/app/${spaceId}/pots/${pot.id}/edit`}
              className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-surface-muted"
            >
              <p className="font-medium text-foreground">{pot.name}</p>
              <p className="font-semibold text-foreground">{formatIDR(balances.get(pot.id) ?? 0)}</p>
            </Link>
          ))}
        </Card>
      ) : (
        <EmptyState icon={PiggyBank} title={t.emptyPotsTitle} description={t.emptyPotsDescription} />
      )}
    </div>
  );
}
