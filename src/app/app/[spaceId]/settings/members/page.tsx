import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/field";
import { BackLink } from "@/components/ui/back-link";
import type { MemberRole } from "@/lib/supabase/database.types";

const ROLES: MemberRole[] = ["owner", "admin", "member", "viewer"];

export default async function MembersPage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: members } = await supabase
    .from("space_members")
    .select("id, role, profiles(id, display_name)")
    .eq("space_id", spaceId)
    .is("deleted_at", null);

  const t = await getDictionary();

  async function updateRole(formData: FormData) {
    "use server";
    const supabase = await createClient();
    await supabase
      .from("space_members")
      .update({ role: String(formData.get("role")) as MemberRole })
      .eq("id", String(formData.get("member_id")));
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/settings/members`);
  }

  async function removeMember(formData: FormData) {
    "use server";
    const supabase = await createClient();
    await supabase
      .from("space_members")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", String(formData.get("member_id")));
    revalidatePath("/app", "layout");
    redirect(`/app/${spaceId}/settings/members`);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <BackLink href={`/app/${spaceId}/settings`} label={t.back} />
      <PageHeader title={t.membersTitle} />
      <Card className="divide-y divide-border p-0">
        {members?.map((member) => (
          <div key={member.id} className="flex items-center justify-between gap-3 px-5 py-4">
            <p className="font-medium text-foreground">
              {member.profiles?.display_name}
              {member.profiles?.id === user?.id ? ` ${t.you}` : ""}
            </p>
            <div className="flex items-center gap-2">
              <form action={updateRole}>
                <input type="hidden" name="member_id" value={member.id} />
                <Select
                  name="role"
                  defaultValue={member.role}
                  onChange={(e) => e.currentTarget.form?.requestSubmit()}
                  className="h-10 w-32 text-sm"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </Select>
              </form>
              <form action={removeMember}>
                <input type="hidden" name="member_id" value={member.id} />
                <button type="submit" className="text-sm font-medium text-danger hover:underline">
                  {t.removeMember}
                </button>
              </form>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
