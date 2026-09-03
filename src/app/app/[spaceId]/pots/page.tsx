import Link from "next/link";
import { Plus, ArrowLeftRight, Wallet2, PiggyBank } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPotBalances } from "@/lib/balances";
import { formatIDR } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default async function PotsPage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const supabase = await createClient();

  const [{ data: pots }, balances] = await Promise.all([
    supabase.from("pots").select("id, name").eq("space_id", spaceId).is("deleted_at", null).order("created_at"),
    getPotBalances(spaceId),
  ]);

  const t = await getDictionary();

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
