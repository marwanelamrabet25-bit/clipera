import { Skeleton } from "@/components/ui/feedback";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Chargement">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-3 h-4 w-80" />
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      <Skeleton className="mt-6 h-56 rounded-lg" />
    </div>
  );
}
