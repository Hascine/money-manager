import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { getDictionary, getLanguage, LANGUAGE_COOKIE } from "@/lib/i18n/get-language";
import type { Lang } from "@/lib/i18n/dictionaries";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { BackLink } from "@/components/ui/back-link";

export default async function LanguageSettingsPage() {
  const lang = await getLanguage();
  const t = await getDictionary();

  async function setLanguage(formData: FormData) {
    "use server";
    const next = String(formData.get("lang")) as Lang;
    const cookieStore = await cookies();
    cookieStore.set(LANGUAGE_COOKIE, next, { maxAge: 60 * 60 * 24 * 365, path: "/" });
    redirect("/app/settings/language");
  }

  const options: { value: Lang; label: string }[] = [
    { value: "id", label: t.languageId },
    { value: "en", label: t.languageEn },
  ];

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-8">
      <BackLink href="/app" label={t.back} />
      <PageHeader title={t.languageTitle} description={t.languageDescription} />
      <Card className="divide-y divide-border p-0">
        {options.map((option) => (
          <form key={option.value} action={setLanguage}>
            <input type="hidden" name="lang" value={option.value} />
            <button
              type="submit"
              className="flex w-full items-center justify-between px-5 py-4 text-base font-medium text-foreground"
            >
              {option.label}
              {lang === option.value && <Check size={20} className="text-brand-from" />}
            </button>
          </form>
        ))}
      </Card>
    </div>
  );
}
