import { animeService } from "@/lib/api/anime";
import { AnimeGrid } from "@/components/features/AnimeGrid";
import { PaginationControls } from "@/components/ui/pagination-controls";

export const dynamic = "force-dynamic";

interface LatestPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function LatestPage({ searchParams }: LatestPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  
  let data;
  try {
    data = await animeService.getLatestEpisodes(page);
  } catch (error) {
    console.error("Failed to fetch latest episodes:", error);
    data = { results: [], hasNextPage: false, currentPage: 1, totalPages: 1 };
  }
  
  return (
    <main className="min-h-screen bg-background pt-24 pb-12">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="mb-8">
            <h1 className="text-4xl font-black tracking-tight mb-2">Latest Episodes</h1>
            <p className="text-muted-foreground">Freshly updated episodes you might have missed.</p>
        </div>

        {data.results && data.results.length > 0 ? (
             <>
                <AnimeGrid animes={data.results} />
                <PaginationControls 
                    hasNextPage={!!data.hasNextPage} 
                    hasPrevPage={page > 1}
                    totalPages={data.totalPages}
                />
             </>
        ) : (
            <div className="text-center py-20 text-white/50">
                <p>No latest episodes found or API is currently unavailable.</p>
            </div>
        )}
      </div>
    </main>
  );
}
