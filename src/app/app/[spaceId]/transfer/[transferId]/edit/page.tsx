import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTransfer, updateTransfer, deleteTransfer } from "@/lib/transfers";
import { getDictionary } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { AmountInput } from "@/components/ui/amount-input";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/ui/back-link";

export default async function EditTransferPage({
  params,
  searchParams,
}: {
  params: Promise<{ spaceId: string; transferId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { spaceId, transferId } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const [transfer, { data: pots }] = await Promise.all([
    getTransfer(transferId),
    supabase.from("pots").select("id, name").eq("space_id", spaceId).is("deleted_at", null).order("created_at"),
  ]);

  if (!transfer) notFound();

  const t = await getDictionary();

  async function update(formData: FormData) {
    "use server";
    try {
      await updateTransfer({
        transferId,
        amount: Number(formData.get("amount")),
        transferDate: String(formData.get("transfer_date")),
        note: String(formData.get("note") || "") || null,
        potId: String(formData.get("pot_id") || "") || null,
        countedAsExpense: formData.get("counted_as_expense") === "true",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Update failed";
      redirect(`/app/${spaceId}/transfer/${transferId}/edit?error=${encodeURIComponent(message)}`);
    }
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/transactions`);
  }

  async function remove() {
    "use server";
    await deleteTransfer(transferId);
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/transactions`);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <BackLink href={`/app/${spaceId}/transactions`} label={t.back} />
      <PageHeader title={t.editTransferTitle} />
      {error && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">{error}</p>
      )}
      <Card>
        <form action={update} className="flex flex-col gap-4">
          <Field label={t.fieldFromAccount}>
            <Input value={transfer.from_account?.name ?? "-"} disabled className="text-foreground-muted" />
          </Field>
          <Field label={t.fieldToAccount}>
            <Input value={transfer.to_account?.name ?? "-"} disabled className="text-foreground-muted" />
          </Field>
          {pots && pots.length > 0 && (
            <Field label={t.fieldPot}>
              <Select name="pot_id" defaultValue={transfer.pot_id ?? ""}>
                <option value="">-</option>
                {pots.map((pot) => (
                  <option key={pot.id} value={pot.id}>
                    {pot.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field label={t.fieldAmount}>
            <AmountInput name="amount" required defaultValue={transfer.amount} />
          </Field>
          <Field label={t.fieldDate}>
            <Input name="transfer_date" type="date" required defaultValue={transfer.transfer_date} />
          </Field>
          <Field label={t.fieldNote}>
            <Input name="note" defaultValue={transfer.note ?? ""} />
          </Field>
          <Toggle
            name="counted_as_expense"
            defaultChecked={transfer.counted_as_expense}
            label={t.fieldCountedAsExpense}
            hint={t.fieldCountedAsExpenseHint}
          />
          <Button type="submit" size="lg" className="mt-2 w-full">
            {t.save}
          </Button>
        </form>
      </Card>
      <form action={remove}>
        <Button type="submit" variant="ghost" className="w-full text-danger hover:bg-danger/10">
          {t.deleteTransfer}
        </Button>
      </form>
    </div>
  );
}
