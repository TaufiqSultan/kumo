import { Skeleton } from "@/components/ui/skeleton";
import { EpisodeListSkeleton } from "@/components/features/EpisodeList";

export default function WatchLoading() {
  return (
    <div className="min-h-screen bg-black/95 text-white flex flex-col pt-[72px] relative overflow-x-hidden">
      <div className="flex-1 container mx-auto px-4 md:px-6 py-6 pb-20 relative z-10 w-full max-w-[1600px] flex flex-col gap-10">
        <div className="space-y-6">
          {/* Player Skeleton */}
          <Skeleton className="w-full aspect-video rounded-xl" />
          
          {/* Info Skeleton */}
          <div className="px-2 md:px-4 max-w-5xl space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-20 w-full" />
          </div>
        </div>

        <div className="w-full h-px bg-white/10" />
        
        {/* Episodes Skeleton */}
        <EpisodeListSkeleton />
      </div>
    </div>
  );
}
