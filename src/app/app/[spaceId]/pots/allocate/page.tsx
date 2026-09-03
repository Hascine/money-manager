import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/ui/back-link";
import { EmptyState } from "@/components/ui/empty-state";
import { PiggyBank } from "lucide-react";

export default async function AllocatePotsPage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const supabase = await createClient();

  const { data: pots } = await supabase
    .from("pots")
    .select("id, name")
    .eq("space_id", spaceId)
    .is("deleted_at", null)
    .order("created_at");

  const t = await getDictionary();

  async function allocate(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const note = String(formData.get("note") || "") || null;
    const rows = (pots ?? [])
      .map((pot) => ({
        pot_id: pot.id,
        space_id: spaceId,
        type: "allocation" as const,
        amount: Number(formData.get(`pot_${pot.id}`) || 0),
        note,
        created_by: user.id,
      }))
      .filter((row) => row.amount > 0);

    if (rows.length) {
      const { error } = await supabase.from("pot_entries").insert(rows);
      if (error) redirect(`/app/${spaceId}/pots/allocate?error=${encodeURIComponent(error.message)}`);
    }

    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/pots`);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <BackLink href={`/app/${spaceId}/pots`} label={t.back} />
      <PageHeader title={t.potAllocateTitle} description={t.potAllocateDescription} />
      {pots?.length ? (
        <Card>
          <form action={allocate} className="flex flex-col gap-4">
            {pots.map((pot) => (
              <Field key={pot.id} label={pot.name}>
                <AmountInput name={`pot_${pot.id}`} />
              </Field>
            ))}
            <Field label={t.fieldNote}>
              <Input name="note" />
            </Field>
            <Button type="submit" size="lg" className="mt-2 w-full">
              {t.save}
            </Button>
          </form>
        </Card>
      ) : (
        <EmptyState icon={PiggyBank} title={t.emptyPotsTitle} description={t.emptyPotsDescription} />
      )}
    </div>
  );
}
