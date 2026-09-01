import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/get-language";
import { getSiteUrl } from "@/lib/site-url";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { CopyInviteLink } from "@/components/copy-invite-link";
import { BackLink } from "@/components/ui/back-link";
import { Link2 } from "lucide-react";
import type { MemberRole } from "@/lib/supabase/database.types";

export default async function InvitesPage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const supabase = await createClient();

  const [{ data: invites }, siteUrl] = await Promise.all([
    supabase
      .from("space_invites")
      .select("id, code, role, uses_count, max_uses, revoked_at, expires_at")
      .eq("space_id", spaceId)
      .order("created_at", { ascending: false }),
    getSiteUrl(),
  ]);

  const t = await getDictionary();

  async function createInvite(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    await supabase.from("space_invites").insert({
      space_id: spaceId,
      role: String(formData.get("role")) as MemberRole,
      created_by: user.id,
    });
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/settings/invites`);
  }

  async function revoke(formData: FormData) {
    "use server";
    const supabase = await createClient();
    await supabase
      .from("space_invites")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", String(formData.get("invite_id")));
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/settings/invites`);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <BackLink href={`/app/${spaceId}/settings`} label={t.back} />
      <PageHeader title={t.invitesTitle} />

      <Card>
        <form action={createInvite} className="flex items-end gap-2">
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground-muted">{t.newMemberRole}</span>
            <Select name="role" defaultValue="member">
              <option value="admin">admin</option>
              <option value="member">member</option>
              <option value="viewer">viewer</option>
            </Select>
          </div>
          <SubmitButton>{t.createInviteLink}</SubmitButton>
        </form>
      </Card>

      {invites?.length ? (
        <Card className="divide-y divide-border p-0">
          {invites.map((invite) => (
            <div key={invite.id} className="flex flex-col gap-3 px-5 py-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-foreground-muted">
                  role: {invite.role} · {t.usedTimes} {invite.uses_count}x
                  {invite.revoked_at ? ` · ${t.revoked}` : ""}
                </p>
                {!invite.revoked_at && (
                  <form action={revoke}>
                    <input type="hidden" name="invite_id" value={invite.id} />
                    <button type="submit" className="text-sm font-medium text-danger hover:underline">
                      {t.revoke}
                    </button>
                  </form>
                )}
              </div>
              {!invite.revoked_at && <CopyInviteLink url={`${siteUrl}/invite/${invite.code}`} />}
            </div>
          ))}
        </Card>
      ) : (
        <EmptyState icon={Link2} title={t.emptyInvitesTitle} />
      )}
    </div>
  );
}
