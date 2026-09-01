import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/get-language";
import { AccountFormFields } from "@/components/account-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/ui/back-link";
import type { AccountType } from "@/lib/supabase/database.types";

export default async function EditAccountPage({
  params,
}: {
  params: Promise<{ spaceId: string; accountId: string }>;
}) {
  const { spaceId, accountId } = await params;
  const supabase = await createClient();
  const t = await getDictionary();

  const { data: account } = await supabase
    .from("accounts")
    .select("id, name, type, provider, account_number, is_active")
    .eq("id", accountId)
    .single();

  if (!account) notFound();

  async function update(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { error } = await supabase
      .from("accounts")
      .update({
        name: String(formData.get("name")),
        type: String(formData.get("type")) as AccountType,
        provider: String(formData.get("provider") || "") || null,
        account_number: String(formData.get("account_number") || "") || null,
      })
      .eq("id", accountId);

    if (error) redirect(`/app/${spaceId}/accounts/${accountId}/edit?error=${encodeURIComponent(error.message)}`);
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/accounts`);
  }

  async function archive() {
    "use server";
    const supabase = await createClient();
    await supabase
      .from("accounts")
      .update({ is_active: false, deleted_at: new Date().toISOString() })
      .eq("id", accountId);
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/accounts`);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <BackLink href={`/app/${spaceId}/accounts`} label={t.back} />
      <PageHeader title={t.editAccountTitle} />
      <Card>
        <form action={update} className="flex flex-col gap-4">
          <AccountFormFields t={t} defaultValues={account} />
          <Button type="submit" size="lg" className="mt-2 w-full">
            {t.save}
          </Button>
        </form>
      </Card>
      <form action={archive}>
        <Button type="submit" variant="ghost" className="w-full text-danger hover:bg-danger/10">
          {t.archiveAccount}
        </Button>
      </form>
    </div>
  );
}
