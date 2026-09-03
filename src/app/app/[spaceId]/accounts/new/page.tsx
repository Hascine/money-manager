import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/get-language";
import { AccountFormFields } from "@/components/account-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/ui/back-link";
import type { AccountType } from "@/lib/supabase/database.types";

export default async function NewAccountPage({
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

    const { error } = await supabase.from("accounts").insert({
      space_id: spaceId,
      name: String(formData.get("name")),
      type: String(formData.get("type")) as AccountType,
      provider: String(formData.get("provider") || "") || null,
      initial_balance: Number(formData.get("initial_balance") || 0),
      created_by: user.id,
    });

    if (error) redirect(`/app/${spaceId}/accounts/new?error=${encodeURIComponent(error.message)}`);
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/accounts`);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <BackLink href={`/app/${spaceId}/accounts`} label={t.back} />
      <PageHeader title={t.newAccountTitle} />
      <Card>
        <form action={create} className="flex flex-col gap-4">
          <AccountFormFields t={t} />
          <Button type="submit" size="lg" className="mt-2 w-full">
            {t.save}
          </Button>
        </form>
      </Card>
    </div>
  );
}
