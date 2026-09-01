import Link from "next/link";
import { Tag, Settings, Users, Link2, User, Palette, Languages, GraduationCap, ChevronRight } from "lucide-react";
import { getSpace, getMyRole } from "@/lib/spaces";
import { getDictionary } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

function MenuRow({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-5 py-4 text-base font-medium text-foreground hover:bg-surface-muted"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-foreground-muted">
        <Icon size={20} />
      </span>
      <span className="flex-1">{label}</span>
      <ChevronRight size={20} className="text-foreground-muted" />
    </Link>
  );
}

export default async function MorePage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const [space, role] = await Promise.all([getSpace(spaceId), getMyRole(spaceId)]);
  const t = await getDictionary();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t.moreTitle} />

      <div>
        <p className="mb-2 px-1 text-sm font-semibold text-foreground-muted">{t.moreSpaceSection}</p>
        <Card className="divide-y divide-border p-0">
          <MenuRow href={`/app/${spaceId}/categories`} icon={Tag} label={t.menuCategories} />
          <MenuRow href={`/app/${spaceId}/settings`} icon={Settings} label={t.menuSpaceSettings} />
          {space?.type === "COLLABORATIVE" && (
            <>
              {role === "owner" && (
                <MenuRow href={`/app/${spaceId}/settings/members`} icon={Users} label={t.menuMembers} />
              )}
              <MenuRow href={`/app/${spaceId}/settings/invites`} icon={Link2} label={t.menuInvites} />
            </>
          )}
        </Card>
      </div>

      <div>
        <p className="mb-2 px-1 text-sm font-semibold text-foreground-muted">{t.moreAccountSection}</p>
        <Card className="divide-y divide-border p-0">
          <MenuRow href="/app/settings/profile" icon={User} label={t.menuProfile} />
          <MenuRow href="/app/settings/appearance" icon={Palette} label={t.menuAppearance} />
          <MenuRow href="/app/settings/language" icon={Languages} label={t.menuLanguage} />
          <MenuRow href="/app/onboarding?replay=1" icon={GraduationCap} label={t.menuTutorial} />
        </Card>
      </div>
    </div>
  );
}
