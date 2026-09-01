import { getDictionary } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { BackLink } from "@/components/ui/back-link";

export default async function AppearanceSettingsPage() {
  const t = await getDictionary();

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-8">
      <BackLink href="/app" label={t.back} />
      <PageHeader title={t.appearanceTitle} description={t.appearanceDescription} />
      <Card>
        <ThemeToggle />
      </Card>
    </div>
  );
}
