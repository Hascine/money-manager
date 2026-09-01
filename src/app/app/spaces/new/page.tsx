import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { BackLink } from "@/components/ui/back-link";

export default async function NewSpacePage() {
  const t = await getDictionary();

  async function create(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("create_collaborative_space", {
      p_name: String(formData.get("name")),
    });
    if (error) redirect(`/app/spaces/new?error=${encodeURIComponent(error.message)}`);
    revalidatePath("/app", "layout");
    redirect(`/app/${data}/settings/invites`);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-8">
      <BackLink href="/app" label={t.back} />
      <PageHeader title={t.newSpaceTitle} description={t.newSpaceDescription} />
      <Card>
        <form action={create} className="flex flex-col gap-4">
          <Field label={t.fieldSpaceName}>
            <Input name="name" type="text" required placeholder="Keluarga Bahagia" />
          </Field>
          <SubmitButton size="lg" className="mt-2 w-full">
            {t.createSpace}
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
