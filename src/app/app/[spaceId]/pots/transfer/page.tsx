import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/ui/back-link";
import { EmptyState } from "@/components/ui/empty-state";
import { PiggyBank } from "lucide-react";

export default async function TransferPotsPage({
  params,
  searchParams,
}: {
  params: Promise<{ spaceId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { spaceId } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: pots } = await supabase
    .from("pots")
    .select("id, name")
    .eq("space_id", spaceId)
    .is("deleted_at", null)
    .order("created_at");

  const t = await getDictionary();

  async function transfer(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const fromPotId = String(formData.get("from_pot_id"));
    const toPotId = String(formData.get("to_pot_id"));
    const amount = Number(formData.get("amount") || 0);
    const note = String(formData.get("note") || "") || null;

    if (fromPotId === toPotId) {
      redirect(`/app/${spaceId}/pots/transfer?error=${encodeURIComponent(t.potTransferSamePot)}`);
    }

    const { error } = await supabase.from("pot_entries").insert([
      { pot_id: fromPotId, space_id: spaceId, type: "transfer_out" as const, amount, note, created_by: user.id },
      { pot_id: toPotId, space_id: spaceId, type: "transfer_in" as const, amount, note, created_by: user.id },
    ]);

    if (error) redirect(`/app/${spaceId}/pots/transfer?error=${encodeURIComponent(error.message)}`);
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/accounts?view=pots`);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <BackLink href={`/app/${spaceId}/accounts?view=pots`} label={t.back} />
      <PageHeader title={t.potTransferTitle} />
      {error && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">{error}</p>
      )}
      {pots && pots.length >= 2 ? (
        <Card>
          <form action={transfer} className="flex flex-col gap-4">
            <Field label={t.fieldFromPot}>
              <Select name="from_pot_id" required defaultValue={pots[0]?.id}>
                {pots.map((pot) => (
                  <option key={pot.id} value={pot.id}>
                    {pot.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t.fieldToPot}>
              <Select name="to_pot_id" required defaultValue={pots[1]?.id}>
                {pots.map((pot) => (
                  <option key={pot.id} value={pot.id}>
                    {pot.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t.fieldAmount}>
              <AmountInput name="amount" required />
            </Field>
            <Field label={t.fieldNote}>
              <Input name="note" />
            </Field>
            <Button type="submit" size="lg" className="mt-2 w-full">
              {t.sendPotTransfer}
            </Button>
          </form>
        </Card>
      ) : (
        <EmptyState icon={PiggyBank} title={t.emptyPotsTitle} description={t.needTwoPotsForTransfer} />
      )}
    </div>
  );
}
