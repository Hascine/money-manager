import { redirect } from "next/navigation";
import { User, Users, ArrowLeftRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/get-language";
import { ButtonLink } from "@/components/ui/button";
import { LogoMark } from "@/components/logo";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/app");

  const t = await getDictionary();

  const features = [
    { icon: User, label: t.landingFeaturePersonal },
    { icon: Users, label: t.landingFeatureFamily },
    { icon: ArrowLeftRight, label: t.landingFeatureTransfer },
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <LogoMark className="h-16 w-16" />
        <span className="brand-gradient-text text-5xl font-extrabold tracking-tight sm:text-6xl">
          Finora
        </span>
        <p className="max-w-md text-xl text-foreground-muted">{t.landingTagline}</p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <ButtonLink href="/signup" size="lg" className="w-full">
          {t.landingStart}
        </ButtonLink>
        <ButtonLink href="/login" variant="secondary" size="lg" className="w-full">
          {t.landingHaveAccount}
        </ButtonLink>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {features.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground-muted"
          >
            <Icon size={18} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
