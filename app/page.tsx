import { animeService } from "@/lib/api/anime";
import { AnimeCard } from "@/components/features/AnimeCard";
import { HeroSection } from "@/components/features/HeroSection";
import { HomeCategoryGrid } from "@/components/features/HomeCategoryGrid";
import { Anime } from "@/lib/api/types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ContinueWatching } from "@/components/features/ContinueWatching";
import { WeeklySchedule } from "@/components/features/WeeklySchedule";

export const revalidate = 3600; 

const Section = ({ title, data, link }: { title: string, data: Anime[], link?: string }) => (
    <section className="space-y-4">
        <div className="flex items-center justify-between px-4 md:px-0">
           <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{title}</h2>
           </div>
           {link && (
               <Link href={link} className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                   View All <ArrowRight className="w-4 h-4" />
               </Link>
           )}
        </div>
        
        <div className="relative">
            <div className="flex overflow-x-auto gap-4 pb-4 px-4 md:px-0 snap-x scrollbar-hide">
                {data.map((anime) => (
                    <div key={anime.id} className="w-[160px] md:w-[200px] flex-shrink-0 snap-start">
                        <AnimeCard anime={anime} />
                    </div>
                ))}
            </div>
            {/* Fade gradients for scroll hint */}
            <div className="absolute top-0 right-0 bottom-4 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
        </div>
    </section>
);

export default async function Home() {
  const homeData = await animeService.getHomeData();
  const scheduleData = await animeService.getSchedule(new Date().toISOString().split('T')[0]);

  // Map spotlights to Anime interface for Hero
  const heroAnimes: Anime[] = homeData.spotlights.map(s => ({
      id: s.id,
      title: { userPreferred: s.title, english: s.title, romaji: s.title },
      image: s.poster,
      poster: s.poster,
      description: s.description,
      type: s.tvInfo.showType,
      releaseDate: s.tvInfo.releaseDate,
      tvInfo: {
          quality: s.tvInfo.quality,
          sub: s.tvInfo.episodeInfo?.sub,
          dub: s.tvInfo.episodeInfo?.dub,
          showType: s.tvInfo.showType,
      },
      // Defaulting fields not in spotlight
      genres: [],
      status: "Unknown"
  }));

  return (
    <main className="min-h-screen bg-background pb-20 space-y-12 animate-page-fade-in">
      <HeroSection animes={heroAnimes} />

      <div className="container max-w-[1800px] mx-auto space-y-24 px-4 md:px-8">
        <ContinueWatching />
        
        {/* Trending Section */}
        {homeData.trending.length > 0 && (
           <Section title="Trending Now" data={homeData.trending} link="/trending" />
        )}

        {/* Categories Grid (Top Airing, Popular, Favorite, Latest) */}
        <HomeCategoryGrid 
            topAiring={homeData.topAiring}
            mostPopular={homeData.mostPopular}
            mostFavorite={homeData.mostFavorite}
            latestEpisode={homeData.latestEpisode}
        />

        {/* Weekly Schedule */}
        <WeeklySchedule initialSchedule={scheduleData} />

        {/* Top Upcoming */}
        {homeData.topUpcoming.length > 0 && (
           <Section title="Top Upcoming" data={homeData.topUpcoming} link="/upcoming" />
        )}
      </div>
    </main>
  );
}
