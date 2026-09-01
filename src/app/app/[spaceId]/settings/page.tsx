import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Users, Link2, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/ui/back-link";

export default async function SpaceSettingsPage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const supabase = await createClient();

  const { data: space } = await supabase
    .from("spaces")
    .select("id, name, type")
    .eq("id", spaceId)
    .single();

  if (!space) redirect("/app");

  const t = await getDictionary();

  async function rename(formData: FormData) {
    "use server";
    const supabase = await createClient();
    await supabase.from("spaces").update({ name: String(formData.get("name")) }).eq("id", spaceId);
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/settings`);
  }

  async function deleteSpace() {
    "use server";
    const supabase = await createClient();
    await supabase.from("spaces").update({ deleted_at: new Date().toISOString() }).eq("id", spaceId);
    revalidatePath("/app", "layout");
    redirect("/app");
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <BackLink href={`/app/${spaceId}/more`} label={t.back} />
      <PageHeader title={t.spaceSettingsTitle} />

      <Card className="flex flex-col gap-4">
        <form action={rename} className="flex flex-col gap-4">
          <Field label={t.fieldSpaceName}>
            <Input name="name" defaultValue={space.name} required />
          </Field>
          <Button type="submit" className="w-full">
            {t.save}
          </Button>
        </form>
      </Card>

      {space.type === "COLLABORATIVE" && (
        <Card className="divide-y divide-border p-0">
          <Link
            href={`/app/${spaceId}/settings/members`}
            className="flex items-center gap-4 px-5 py-4 hover:bg-surface-muted"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-foreground-muted">
              <Users size={20} />
            </span>
            <span className="flex-1 font-medium text-foreground">{t.manageMembers}</span>
            <ChevronRight size={20} className="text-foreground-muted" />
          </Link>
          <Link
            href={`/app/${spaceId}/settings/invites`}
            className="flex items-center gap-4 px-5 py-4 hover:bg-surface-muted"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-foreground-muted">
              <Link2 size={20} />
            </span>
            <span className="flex-1 font-medium text-foreground">{t.manageInvites}</span>
            <ChevronRight size={20} className="text-foreground-muted" />
          </Link>
        </Card>
      )}

      {space.type === "COLLABORATIVE" && (
        <form action={deleteSpace}>
          <Button type="submit" variant="ghost" className="w-full text-danger hover:bg-danger/10">
            {t.deleteSpace}
          </Button>
        </form>
      )}
    </div>
  );
}
