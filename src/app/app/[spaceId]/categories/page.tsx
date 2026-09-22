import Link from "next/link";
import { Plus, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCategoryVisual } from "@/lib/category-visuals";
import { getDictionary } from "@/lib/i18n/get-language";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

interface CategoryRow {
  id: string;
  name: string;
  type: string;
}

function CategoryChip({ category, spaceId }: { category: CategoryRow; spaceId: string }) {
  const visual = getCategoryVisual(category.id, category.name);
  return (
    <Link
      href={`/app/${spaceId}/categories/${category.id}/edit`}
      className="flex items-center gap-2 rounded-full border border-border bg-surface py-2 pl-2 pr-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: visual.tint, color: visual.color }}
      >
        <visual.Icon size={15} />
      </span>
      {category.name}
    </Link>
  );
}

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

      {categories?.length ? (
        <>
          <section>
            <h3 className="mb-2 text-sm font-semibold text-foreground-muted">{t.expenseSection}</h3>
            <div className="flex flex-wrap gap-2">
              {expense.map((c) => (
                <CategoryChip key={c.id} category={c} spaceId={spaceId} />
              ))}
            </div>
          </section>
          <section>
            <h3 className="mb-2 text-sm font-semibold text-foreground-muted">{t.incomeSection}</h3>
            <div className="flex flex-wrap gap-2">
              {income.map((c) => (
                <CategoryChip key={c.id} category={c} spaceId={spaceId} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <EmptyState icon={Tag} title={t.emptyCategoriesTitle} description={t.emptyCategoriesDescription} />
      )}
    </div>
  );
}
