import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAccountBalances } from "@/lib/balances";
import { formatIDR } from "@/lib/format";
import { ACCOUNT_TYPE_ICON, getAccountTypeLabels } from "@/lib/account-icons";
import { getDictionary } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Wallet } from "lucide-react";

export default async function AccountsPage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const supabase = await createClient();

  const [{ data: accounts }, balances] = await Promise.all([
    supabase
      .from("accounts")
      .select("id, name, type, provider, is_active")
      .eq("space_id", spaceId)
      .is("deleted_at", null)
      .order("created_at"),
    getAccountBalances(spaceId),
  ]);

  const t = await getDictionary();
  const typeLabels = getAccountTypeLabels(t);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t.accountsTitle}
        action={
          <ButtonLink href={`/app/${spaceId}/accounts/new`} size="md">
            <Plus size={18} />
            {t.newAccount}
          </ButtonLink>
        }
      />
      {accounts?.length ? (
        <Card className="divide-y divide-border p-0">
          {accounts.map((account) => {
            const Icon = ACCOUNT_TYPE_ICON[account.type];
            return (
              <Link
                key={account.id}
                href={`/app/${spaceId}/accounts/${account.id}/edit`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-surface-muted"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-foreground-muted">
                  <Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{account.name}</p>
                  <p className="text-sm text-foreground-muted">
                    {typeLabels[account.type]}
                    {account.provider ? ` · ${account.provider}` : ""}
                    {!account.is_active ? ` · ${t.inactive}` : ""}
                  </p>
                </div>
                <p className="font-semibold text-foreground">
                  {formatIDR(balances.get(account.id) ?? 0)}
                </p>
              </Link>
            );
          })}
        </Card>
      ) : (
        <EmptyState icon={Wallet} title={t.emptyAccountsTitle} description={t.emptyAccountsDescription} />
      )}
    </div>
  );
}
