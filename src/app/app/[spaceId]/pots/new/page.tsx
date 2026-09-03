import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/ui/back-link";

export default async function NewPotPage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const t = await getDictionary();

  async function create(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { error } = await supabase.from("pots").insert({
      space_id: spaceId,
      name: String(formData.get("name")),
      created_by: user.id,
    });

    if (error) redirect(`/app/${spaceId}/pots/new?error=${encodeURIComponent(error.message)}`);
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/pots`);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <BackLink href={`/app/${spaceId}/pots`} label={t.back} />
      <PageHeader title={t.newPotTitle} />
      <Card>
        <form action={create} className="flex flex-col gap-4">
          <Field label={t.fieldPotName}>
            <Input name="name" required placeholder="Jajan" />
          </Field>
          <Button type="submit" size="lg" className="mt-2 w-full">
            {t.save}
          </Button>
        </form>
      </Card>
    </div>
  );
}
