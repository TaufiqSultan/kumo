import { animeService } from "@/lib/api/anime";
import { AnimeGrid } from "@/components/features/AnimeGrid";

export interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";

  if (!query) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-12 animate-page-fade-in">
        <div className="container max-w-7xl mx-auto px-6 text-center py-20">
          <h1 className="text-2xl font-bold mb-4">No search query provided.</h1>
          <p className="text-muted-foreground">Type something in the search bar to find anime.</p>
        </div>
      </main>
    );
  }

  let data;
  try {
    data = await animeService.search(query);
  } catch (error) {
    console.error("Search failed:", error);
    data = { results: [] };
  }

  return (
    <main className="min-h-screen bg-background pt-24 pb-12 animate-page-fade-in">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Search Results</h1>
            <p className="text-muted-foreground">
              Showing results for: <span className="text-white font-semibold">&quot;{query}&quot;</span>
            </p>
        </div>

        {data.results && data.results.length > 0 ? (
            <AnimeGrid animes={data.results} />
        ) : (
            <div className="text-center py-20 text-white/50 border border-dashed border-white/10 rounded-2xl">
                <p>No results found for &quot;{query}&quot;. Try different keywords.</p>
            </div>
        )}
      </div>
    </main>
  );
}
