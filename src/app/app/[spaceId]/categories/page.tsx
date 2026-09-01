import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, type")
    .eq("space_id", spaceId)
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("name");

  const income = categories?.filter((c) => c.type === "income") ?? [];
  const expense = categories?.filter((c) => c.type === "expense") ?? [];
  const t = await getDictionary();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.categoriesTitle}
        action={
          <ButtonLink href={`/app/${spaceId}/categories/new`} size="md">
            <Plus size={18} />
            {t.newCategory}
          </ButtonLink>
        }
      />
      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground-muted">{t.incomeSection}</h3>
        <div className="flex flex-wrap gap-2">
          {income.map((c) => (
            <span
              key={c.id}
              className="rounded-full border border-border bg-success/10 px-4 py-2 text-sm font-medium text-success"
            >
              {c.name}
            </span>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground-muted">{t.expenseSection}</h3>
        <div className="flex flex-wrap gap-2">
          {expense.map((c) => (
            <span
              key={c.id}
              className="rounded-full border border-border bg-surface-muted px-4 py-2 text-sm font-medium text-foreground"
            >
              {c.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
