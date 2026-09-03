import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/get-language";
import { TransactionFormFields } from "@/components/transaction-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/ui/back-link";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ spaceId: string; transactionId: string }>;
}) {
  const { spaceId, transactionId } = await params;
  const supabase = await createClient();

  const [{ data: transaction }, { data: accounts }, { data: categories }, { data: pots }] = await Promise.all([
    supabase
      .from("transactions")
      .select("id, type, account_id, category_id, pot_id, amount, transaction_date, note")
      .eq("id", transactionId)
      .single(),
    supabase.from("accounts").select("id, name").eq("space_id", spaceId).is("deleted_at", null).eq("is_active", true),
    supabase.from("categories").select("id, name, type").eq("space_id", spaceId).is("deleted_at", null).eq("is_active", true),
    supabase.from("pots").select("id, name").eq("space_id", spaceId).is("deleted_at", null).order("created_at"),
  ]);

  if (!transaction || (transaction.type !== "income" && transaction.type !== "expense")) notFound();

  const t = await getDictionary();

  async function update(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const categoryId = String(formData.get("category_id") || "");
    const potId = String(formData.get("pot_id") || "");

    const { error } = await supabase
      .from("transactions")
      .update({
        category_id: categoryId || null,
        pot_id: potId || null,
        amount: Number(formData.get("amount")),
        transaction_date: String(formData.get("transaction_date")),
        note: String(formData.get("note") || "") || null,
      })
      .eq("id", transactionId);

    if (error)
      redirect(`/app/${spaceId}/transactions/${transactionId}/edit?error=${encodeURIComponent(error.message)}`);
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/transactions`);
  }

  async function remove() {
    "use server";
    const supabase = await createClient();
    await supabase
      .from("transactions")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", transactionId);
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/transactions`);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <BackLink href={`/app/${spaceId}/transactions`} label={t.back} />
      <PageHeader title={t.editTransactionTitle} />
      <Card>
        <form action={update} className="flex flex-col gap-4">
          <TransactionFormFields
            t={t}
            accounts={accounts ?? []}
            categories={categories ?? []}
            pots={pots ?? []}
            defaultValues={transaction}
          />
          <Button type="submit" size="lg" className="mt-2 w-full">
            {t.save}
          </Button>
        </form>
      </Card>
      <form action={remove}>
        <Button type="submit" variant="ghost" className="w-full text-danger hover:bg-danger/10">
          {t.deleteTransaction}
        </Button>
      </form>
    </div>
  );
}
