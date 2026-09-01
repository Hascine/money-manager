import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/get-language";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { code } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const t = await getDictionary();
  const redirectTarget = encodeURIComponent(`/invite/${code}`);

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <Card className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl brand-gradient text-white">
            <Users size={26} />
          </div>
          <h1 className="text-xl font-bold text-foreground">{t.inviteTitle}</h1>
          <p className="mt-2 text-base text-foreground-muted">{t.inviteDescription}</p>
          <div className="mt-6 flex flex-col gap-3">
            <ButtonLink href={`/signup?redirect=${redirectTarget}`} size="lg" className="w-full">
              {t.inviteSignupCta}
            </ButtonLink>
            <ButtonLink href={`/login?redirect=${redirectTarget}`} variant="secondary" size="lg" className="w-full">
              {t.inviteLoginCta}
            </ButtonLink>
          </div>
        </Card>
      </div>
    );
  }

  async function join() {
    "use server";
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("redeem_invite", { p_code: code });
    if (error) redirect(`/invite/${code}?error=${encodeURIComponent(error.message)}`);
    revalidatePath("/app", "layout");
    redirect(`/app/${data}`);
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <Card className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl brand-gradient text-white">
          <Users size={26} />
        </div>
        <h1 className="text-xl font-bold text-foreground">{t.inviteTitle}</h1>
        <p className="mt-2 text-base text-foreground-muted">{t.inviteDescription}</p>
        {error && (
          <p className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
            {error}
          </p>
        )}
        <form action={join} className="mt-6">
          <SubmitButton size="lg" className="w-full">
            {t.inviteJoin}
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
