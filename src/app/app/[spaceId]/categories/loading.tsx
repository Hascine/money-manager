import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 w-24 rounded-2xl" />
      </div>

      {[0, 1].map((section) => (
        <section key={section} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex flex-wrap gap-2">
            {["w-28", "w-36", "w-24", "w-32", "w-40"].map((width, i) => (
              <Skeleton key={i} className={`h-11 rounded-full ${width}`} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
