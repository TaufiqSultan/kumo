import { animeService } from "@/lib/api/anime";
import { AnimeGrid } from "@/components/features/AnimeGrid";
import { PaginationControls } from "@/components/ui/pagination-controls";

export interface MoviesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = "force-dynamic";

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const params = await searchParams;
  const page = typeof params.page === "string" ? Number(params.page) : 1;

  let data;
  try {
      data = await animeService.getMovies(page);
  } catch (error) {
      console.error("Failed to fetch movies:", error);
      data = { results: [], hasNextPage: false };
  }
  
  const hasNextPage = !!data.hasNextPage;
  const hasPrevPage = page > 1;

  return (
    <main className="min-h-screen bg-background pt-24 pb-12">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="mb-8">
            <h1 className="text-4xl font-black tracking-tight mb-2">Anime Movies</h1>
            <p className="text-muted-foreground">Top rated and popular anime films.</p>
        </div>

        {data.results && data.results.length > 0 ? (
            <>
                <AnimeGrid animes={data.results} />
                <PaginationControls 
                    hasNextPage={hasNextPage} 
                    hasPrevPage={hasPrevPage} 
                />
            </>
        ) : (
            <div className="text-center py-20 text-white/50">
                <p>No movies found or API is currently unavailable.</p>
            </div>
        )}
      </div>
    </main>
  );
}
