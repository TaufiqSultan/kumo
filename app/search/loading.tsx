import { AnimeCardSkeleton } from "@/components/features/AnimeCard";

export default function SearchLoading() {
  return (
    <main className="min-h-screen bg-background pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <div className="h-10 w-64 bg-white/5 animate-pulse rounded-md" />
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {[...Array(12)].map((_, i) => (
            <AnimeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
