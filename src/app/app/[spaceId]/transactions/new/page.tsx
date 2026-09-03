import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/get-language";
import { TransactionFormFields } from "@/components/transaction-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/ui/back-link";

export default async function NewTransactionPage({
  params,
  searchParams,
}: {
  params: Promise<{ spaceId: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { spaceId } = await params;
  const { type } = await searchParams;
  const defaultType = type === "income" ? "income" : "expense";
  const supabase = await createClient();
  const t = await getDictionary();

  const [{ data: accounts }, { data: categories }, { data: pots }] = await Promise.all([
    supabase.from("accounts").select("id, name").eq("space_id", spaceId).is("deleted_at", null).eq("is_active", true),
    supabase.from("categories").select("id, name, type").eq("space_id", spaceId).is("deleted_at", null).eq("is_active", true),
    supabase.from("pots").select("id, name").eq("space_id", spaceId).is("deleted_at", null).order("created_at"),
  ]);

  async function create(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const categoryId = String(formData.get("category_id") || "");
    const potId = String(formData.get("pot_id") || "");

    const { error } = await supabase.from("transactions").insert({
      account_id: String(formData.get("account_id")),
      category_id: categoryId || null,
      pot_id: potId || null,
      created_by: user.id,
      type: String(formData.get("type")) as "income" | "expense",
      amount: Number(formData.get("amount")),
      transaction_date: String(formData.get("transaction_date")),
      note: String(formData.get("note") || "") || null,
    });

    if (error) redirect(`/app/${spaceId}/transactions/new?error=${encodeURIComponent(error.message)}`);
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/transactions`);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <BackLink href={`/app/${spaceId}/transactions`} label={t.back} />
      <PageHeader title={defaultType === "income" ? t.newIncomeTitle : t.newExpenseTitle} />
      <Card>
        {!accounts?.length && (
          <p className="mb-4 text-base text-foreground-muted">{t.needAccountFirst}</p>
        )}
        <form action={create} className="flex flex-col gap-4">
          <TransactionFormFields
            t={t}
            accounts={accounts ?? []}
            categories={categories ?? []}
            pots={pots ?? []}
            defaultValues={{ type: defaultType }}
          />
          <Button type="submit" size="lg" disabled={!accounts?.length} className="mt-2 w-full">
            {t.save}
          </Button>
        </form>
      </Card>
    </div>
  );
}
