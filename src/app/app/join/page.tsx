import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { BackLink } from "@/components/ui/back-link";

export default async function JoinWithCodePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const t = await getDictionary();

  async function join(formData: FormData) {
    "use server";
    const raw = String(formData.get("code") || "").trim();
    // Accept either a bare code or a pasted full invite URL.
    const code = raw.includes("/invite/") ? raw.split("/invite/").pop()!.split(/[?#]/)[0] : raw;

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("redeem_invite", { p_code: code });
    if (error) redirect(`/app/join?error=${encodeURIComponent(error.message)}`);
    revalidatePath("/app", "layout");
    redirect(`/app/${data}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-8">
      <BackLink href="/app" label={t.back} />
      <PageHeader title={t.joinWithCodeTitle} description={t.joinWithCodeDescription} />
      <Card>
        <form action={join} className="flex flex-col gap-4">
          {error && (
            <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">{error}</p>
          )}
          <Field label={t.fieldInviteCode}>
            <Input name="code" required placeholder="078a574999" autoCapitalize="off" autoCorrect="off" />
          </Field>
          <SubmitButton size="lg" className="mt-2 w-full">
            {t.inviteJoin}
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
