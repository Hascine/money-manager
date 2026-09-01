import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/ui/back-link";
import type { CategoryType } from "@/lib/supabase/database.types";

export default async function NewCategoryPage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const t = await getDictionary();

  async function create(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { error } = await supabase.from("categories").insert({
      space_id: spaceId,
      name: String(formData.get("name")),
      type: String(formData.get("type")) as CategoryType,
    });

    if (error) redirect(`/app/${spaceId}/categories/new?error=${encodeURIComponent(error.message)}`);
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/categories`);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <BackLink href={`/app/${spaceId}/categories`} label={t.back} />
      <PageHeader title={t.newCategoryTitle} />
      <Card>
        <form action={create} className="flex flex-col gap-4">
          <Field label={t.fieldName}>
            <Input name="name" required />
          </Field>
          <Field label={t.fieldType}>
            <Select name="type" defaultValue="expense">
              <option value="expense">{t.typeExpense}</option>
              <option value="income">{t.typeIncome}</option>
            </Select>
          </Field>
          <Button type="submit" size="lg" className="mt-2 w-full">
            {t.save}
          </Button>
        </form>
      </Card>
    </div>
  );
}
