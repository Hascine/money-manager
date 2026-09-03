import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/ui/back-link";

export default async function EditPotPage({
  params,
}: {
  params: Promise<{ spaceId: string; potId: string }>;
}) {
  const { spaceId, potId } = await params;
  const supabase = await createClient();
  const t = await getDictionary();

  const { data: pot } = await supabase.from("pots").select("id, name").eq("id", potId).single();

  if (!pot) notFound();

  async function update(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { error } = await supabase
      .from("pots")
      .update({ name: String(formData.get("name")) })
      .eq("id", potId);

    if (error) redirect(`/app/${spaceId}/pots/${potId}/edit?error=${encodeURIComponent(error.message)}`);
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/accounts?view=pots`);
  }

  async function archive() {
    "use server";
    const supabase = await createClient();
    await supabase.from("pots").update({ deleted_at: new Date().toISOString() }).eq("id", potId);
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/accounts?view=pots`);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <BackLink href={`/app/${spaceId}/accounts?view=pots`} label={t.back} />
      <PageHeader title={t.editPotTitle} />
      <Card>
        <form action={update} className="flex flex-col gap-4">
          <Field label={t.fieldPotName}>
            <Input name="name" required defaultValue={pot.name} />
          </Field>
          <Button type="submit" size="lg" className="mt-2 w-full">
            {t.save}
          </Button>
        </form>
      </Card>
      <form action={archive}>
        <Button type="submit" variant="ghost" className="w-full text-danger hover:bg-danger/10">
          {t.archivePot}
        </Button>
      </form>
    </div>
  );
}
