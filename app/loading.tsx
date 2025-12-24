import { AnimeCardSkeleton } from "@/components/features/AnimeCard";

const SectionSkeleton = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4 md:px-0">
        <div className="h-8 w-48 bg-white/5 animate-pulse rounded-md" />
        <div className="h-4 w-20 bg-white/5 animate-pulse rounded-md" />
      </div>
      <div className="flex overflow-x-auto gap-4 pb-4 px-4 md:px-0 scrollbar-hide">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-[160px] md:w-[200px] flex-shrink-0">
            <AnimeCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );

export default function Loading() {
  return (
    <main className="min-h-screen bg-background pb-20 space-y-12">
      {/* Hero Skeleton */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] w-full bg-white/5 animate-pulse" />

      <div className="container max-w-[1800px] mx-auto space-y-16 px-0 md:px-8">
        <SectionSkeleton />
        <SectionSkeleton />
        <SectionSkeleton />
      </div>
    </main>
  );
}
