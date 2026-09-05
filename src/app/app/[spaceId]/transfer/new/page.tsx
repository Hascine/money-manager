import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createTransfer, getTransferTargets } from "@/lib/transfers";
import { getDictionary } from "@/lib/i18n/get-language";
import { TransferForm } from "@/components/transfer-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { BackLink } from "@/components/ui/back-link";

export default async function NewTransferPage({
  params,
  searchParams,
}: {
  params: Promise<{ spaceId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { spaceId } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: fromAccounts }, targets, { data: pots }] = await Promise.all([
    supabase
      .from("accounts")
      .select("id, name")
      .eq("space_id", spaceId)
      .is("deleted_at", null)
      .eq("is_active", true),
    getTransferTargets(spaceId),
    supabase.from("pots").select("id, name").eq("space_id", spaceId).is("deleted_at", null).order("created_at"),
  ]);

  const t = await getDictionary();

  async function transfer(formData: FormData) {
    "use server";
    try {
      await createTransfer({
        fromAccountId: String(formData.get("from_account_id")),
        toAccountId: String(formData.get("to_account_id")),
        amount: Number(formData.get("amount")),
        transferDate: String(formData.get("transfer_date")),
        note: String(formData.get("note") || "") || null,
        potId: String(formData.get("pot_id") || "") || null,
        countedAsExpense: formData.get("counted_as_expense") === "true",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transfer failed";
      redirect(`/app/${spaceId}/transfer/new?error=${encodeURIComponent(message)}`);
    }
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/transactions`);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <BackLink href={`/app/${spaceId}/transactions`} label={t.back} />
      <PageHeader title={t.transferTitle} />
      {error && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">{error}</p>
      )}
      <Card>
        {!fromAccounts?.length ? (
          <p className="text-base text-foreground-muted">{t.needAccountBeforeTransfer}</p>
        ) : (
          <TransferForm action={transfer} fromAccounts={fromAccounts} targets={targets} pots={pots ?? []} />
        )}
      </Card>
    </div>
  );
}
