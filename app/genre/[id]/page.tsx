import { animeService } from "@/lib/api/anime";
import { AnimeGrid } from "@/components/features/AnimeGrid";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = "force-dynamic";

export default async function GenrePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  
  const page = typeof pageParam === "string" ? Number(pageParam) : 1;
  const decodedGenre = decodeURIComponent(id);
  
  let data;
  try {
      // Fetch 42 items per page
      data = await animeService.getByCategory(`genre/${decodedGenre}`, page, 42);
  } catch (error) {
      console.error("Failed to fetch genre anime:", error);
      data = { results: [], hasNextPage: false, currentPage: 1 };
  }

  const hasNextPage = data.hasNextPage || false;
  const hasPrevPage = page > 1;

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container max-w-7xl mx-auto px-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight capitalize">
                    {decodedGenre} Anime
                </h1>
                <p className="text-muted-foreground">
                    Browse the best {decodedGenre.toLowerCase()} anime series and movies.
                </p>
            </div>
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
            <div className="h-[50vh] flex items-center justify-center text-muted-foreground">
                <p>No results found for this genre.</p>
            </div>
        )}
      </div>
    </div>
  );
}
