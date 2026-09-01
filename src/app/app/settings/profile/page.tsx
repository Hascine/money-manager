import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/ui/back-link";

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const t = await getDictionary();

  async function updateProfile(formData: FormData) {
    "use server";
    const supabase = await createClient();
    await supabase
      .from("profiles")
      .update({ display_name: String(formData.get("display_name")) })
      .eq("id", (await supabase.auth.getUser()).data.user!.id);
    revalidatePath("/app", "layout");
    redirect("/app/settings/profile");
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-8">
      <BackLink href="/app" label={t.back} />
      <PageHeader title={t.profileTitle} />
      <Card>
        <form action={updateProfile} className="flex flex-col gap-4">
          <Field label={t.fieldName}>
            <Input name="display_name" defaultValue={profile?.display_name ?? ""} required />
          </Field>
          <Field label={t.fieldEmail}>
            <Input value={user.email ?? ""} disabled className="text-foreground-muted" />
          </Field>
          <Button type="submit" size="lg" className="mt-2 w-full">
            {t.save}
          </Button>
        </form>
      </Card>
    </div>
  );
}
