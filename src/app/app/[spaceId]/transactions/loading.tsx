import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-12 w-24 rounded-2xl" />
      </div>
      <Skeleton className="h-11 w-full rounded-xl" />

      {[0, 1].map((group) => (
        <section key={group} className="flex flex-col gap-2">
          <div className="flex justify-between px-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Card className="divide-y divide-border p-0">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4">
                <Skeleton className="h-11 w-11 rounded-full" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </Card>
        </section>
      ))}
    </div>
  );
}
