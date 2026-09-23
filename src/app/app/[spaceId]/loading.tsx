import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-36 rounded-3xl" />

      <section className="flex flex-col gap-3">
        <Skeleton className="h-6 w-40" />
        <Card className="flex flex-col gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <Skeleton className="h-6 w-32" />
        <Card padded={false} className="divide-y divide-border">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4">
              <Skeleton className="h-11 w-11 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
