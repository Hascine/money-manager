import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";

import { SubmitButton } from "@/components/ui/submit-button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { BackLink } from "@/components/ui/back-link";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ spaceId: string; categoryId: string }>;
}) {
  const { spaceId, categoryId } = await params;
  const supabase = await createClient();
  const t = await getDictionary();

  const { data: category } = await supabase
    .from("categories")
    .select("id, name")
    .eq("id", categoryId)
    .single();

  if (!category) notFound();

  async function update(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { error } = await supabase
      .from("categories")
      .update({ name: String(formData.get("name")) })
      .eq("id", categoryId);

    if (error) redirect(`/app/${spaceId}/categories/${categoryId}/edit?error=${encodeURIComponent(error.message)}`);
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/categories`);
  }

  async function archive() {
    "use server";
    const supabase = await createClient();
    await supabase
      .from("categories")
      .update({ is_active: false, deleted_at: new Date().toISOString() })
      .eq("id", categoryId);
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/categories`);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <BackLink href={`/app/${spaceId}/categories`} label={t.back} />
      <PageHeader title={t.editCategoryTitle} />
      <Card>
        <form action={update} className="flex flex-col gap-4">
          <Field label={t.fieldName}>
            <Input name="name" required defaultValue={category.name} />
          </Field>
          <SubmitButton size="lg" className="mt-2 w-full">
            {t.save}
          </SubmitButton>
        </form>
      </Card>
      <form action={archive}>
        <ConfirmSubmitButton
          variant="ghost"
          className="w-full text-danger hover:bg-danger/10"
          confirmMessage={t.confirmDeleteCategory}
        >
          {t.deleteCategory}
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
