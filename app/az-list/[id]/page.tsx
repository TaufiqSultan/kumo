import { animeService } from "@/lib/api/anime";
import { AnimeGrid } from "@/components/features/AnimeGrid";
import { PaginationControls } from "@/components/ui/pagination-controls";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = "force-dynamic";

export default async function AZListPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  
  const page = typeof pageParam === "string" ? Number(pageParam) : 1;
  const decodedId = decodeURIComponent(id);
  
  // A-Z Navigation Items
  const azList = [
    "All", "#", "0-9", 
    ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
  ];

  let data;
  try {
      // Fetch 42 items per page
      data = await animeService.getAZList(decodedId, page, 42);
  } catch (error) {
      console.error("Failed to fetch AZ list:", error);
      data = { results: [], hasNextPage: false, currentPage: 1 };
  }

  const hasNextPage = data.hasNextPage || false;
  const hasPrevPage = page > 1;

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container max-w-7xl mx-auto px-6 space-y-10">
        
        {/* Header Section */}
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                     <span className="text-3xl md:text-4xl font-black tracking-tight text-white">A-Z LIST</span>
                     <div className="h-8 w-px bg-white/20 mx-2" />
                     <span className="text-base md:text-lg text-muted-foreground font-medium">
                        Searching anime order by alphabet name {decodedId}
                     </span>
                </div>
            </div>

            {/* A-Z Navigation */}
            <div className="flex flex-wrap gap-2 p-6 bg-secondary/10 rounded-2xl border border-white/5">
                {azList.map((char) => (
                    <Link key={char} href={`/az-list/${char}`} scroll={false}>
                        <Button 
                            variant="secondary"
                            size="sm"
                            className={cn(
                                "h-9 min-w-[36px] px-3 font-bold text-sm transition-all",
                                decodedId === char 
                                    ? "bg-primary text-black hover:bg-primary/90 shadow-lg shadow-primary/20 scale-110" 
                                    : "bg-background/50 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/5"
                            )}
                        >
                            {char}
                        </Button>
                    </Link>
                ))}
            </div>
        </div>

        {/* Results Grid */}
        {data.results && data.results.length > 0 ? (
            <div className="space-y-10">
                <AnimeGrid animes={data.results} />
                <PaginationControls 
                    hasNextPage={hasNextPage} 
                    hasPrevPage={hasPrevPage}
                />
            </div>
        ) : (
            <div className="h-[40vh] flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <p className="text-lg">No anime found starting with &quot;{decodedId}&quot;.</p>
                <Button variant="outline" asChild>
                    <Link href="/az-list/All">View All Anime</Link>
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}
