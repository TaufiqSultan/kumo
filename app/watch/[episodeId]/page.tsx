import { animeService } from "@/lib/api/anime";
import { VideoPlayer } from "@/components/features/VideoPlayer";
import { EpisodeList } from "@/components/features/EpisodeList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Captions, Mic, Server as ServerIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimeCard } from "@/components/features/AnimeCard";

interface PageProps {
  params: Promise<{ episodeId: string }>;
  searchParams: Promise<{ animeId?: string; ep?: string; server?: string; type?: string }>;
}

export default async function WatchPage({ params, searchParams }: PageProps) {
  const { episodeId } = await params;
  const { animeId, ep, server } = await searchParams;
  const rawType = (await searchParams).type;
  const type = (rawType === "sub" || rawType === "dub") ? rawType : "sub";

  // 1. Reconstruct full API ID if 'ep' param exists (Next.js splits ?ep=... from params)
  const apiEpisodeId = ep ? `${episodeId}?ep=${ep}` : episodeId;

  // 2. Fetch Data in Parallel
  // We fetch both sub and dub to know availability and build the UI
  const subDataPromise = animeService.getStreamingLinks(apiEpisodeId, server, "sub").catch(() => null);
  const dubDataPromise = animeService.getStreamingLinks(apiEpisodeId, server, "dub").catch(() => null);
  const animePromise = animeId ? animeService.getAnimeDetails(animeId) : Promise.resolve(null);
  
  const [subData, dubData, anime] = await Promise.all([subDataPromise, dubDataPromise, animePromise]);
  
  // 3. Determine Active Stream
  const activeData = type === "sub" ? subData : dubData;
  const streamData = activeData || subData || dubData; // Fallback to whatever works
  
  // If we fell back (e.g. requested dub but only sub exists), update the effectively used type
  // const effectiveType = activeData ? type : (subData ? "sub" : "dub"); (Not used for routing but useful logic)

  // 4. Source setup
  const defaultSource = streamData?.sources.find(s => s.quality === "default" || s.quality === "auto") || streamData?.sources[0];
  
  // Helper to find current episode index...
  let currentEpIndex = -1;
  let currentEp = null;

  if (anime?.episodes) {
      // 1. Try matching with full apiEpisodeId or the raw episodeId param
      currentEpIndex = anime.episodes.findIndex(e => e.id === apiEpisodeId || e.id === episodeId);
      
      // 2. Priority: Match by 'ep' query param number
      if (currentEpIndex === -1 && ep) {
          const epNum = parseInt(ep);
          currentEpIndex = anime.episodes.findIndex(e => e.number === epNum);
      }

      // 3. Fuzzy Match by Number (last resort, only if ep param failed or is missing)
      if (currentEpIndex === -1) {
          const match = episodeId.match(/-(\d+)$/);
          if (match) {
              const epNumber = parseInt(match[1]);
              currentEpIndex = anime.episodes.findIndex(e => e.number === epNumber);
          }
      }

      if (currentEpIndex !== -1) {
          currentEp = anime.episodes[currentEpIndex];
      }
  }
  
  // Use the resolved episode ID if found, otherwise fallback to the param ID
  const activeEpisodeId = currentEp?.id || episodeId;
  const hasSub = !!subData?.servers?.length;
  const hasDub = !!dubData?.servers?.length;
  
  return (
    <div className="min-h-screen bg-black/95 text-white flex flex-col pt-[72px] relative overflow-x-hidden animate-page-fade-in">
       {/* Background Ambience */}
       {anime && (
           <div 
               className="fixed inset-0 opacity-20 pointer-events-none z-0 bg-cover bg-center blur-3xl scale-110"
               style={{ backgroundImage: `url(${anime.banner || anime.image})` }}
           />
       )}
       {/* Dark overlay */}
       <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black z-0 pointer-events-none" />

       {/* Header / Nav */}
       <div className="relative z-20 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
              {animeId && (
                  <Link href={`/anime/${animeId}`} className="group">
                    <Button variant="ghost" size="icon" className="text-white/70 group-hover:text-white hover:bg-white/10 rounded-full">
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                  </Link>
              )}
              <div>
                  <h1 className="font-bold text-xl md:text-2xl leading-none text-white/90">
                      {anime?.title.userPreferred || "Watch Anime"}
                  </h1>
                  {currentEp && (
                      <p className="text-sm font-medium text-white/50 mt-1">
                          Playing Episode {currentEp.number}
                      </p>
                  )}
              </div>
          </div>
       </div>

       <div className="flex-1 container mx-auto px-4 md:px-6 py-6 pb-20 relative z-10 w-full max-w-[1600px] flex flex-col gap-10">
           {/* Player Section - Main Stage */}
           <div className="space-y-6">
              <div className="w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden ring-1 ring-white/10 bg-black relative z-20">
                  {streamData && defaultSource ? (
                      <VideoPlayer 
                        key={`${defaultSource.url}-${type}`} // Remount on type change
                        url={defaultSource.url} 
                        poster={currentEp?.image || anime?.image}
                        autoPlay
                        headers={streamData.headers}
                        subtitles={streamData.subtitles}
                        anime={anime || undefined}
                        episode={currentEp || undefined}
                        hasNextEpisode={currentEpIndex !== -1 && currentEpIndex < (anime?.episodes?.length || 0) - 1}
                        nextEpisodeUrl={
                            anime?.episodes && currentEpIndex !== -1 && currentEpIndex < anime.episodes.length - 1
                                ? `/watch/${anime.episodes[currentEpIndex + 1].id}?animeId=${anime.id}`
                                : undefined
                        }
                        intro={streamData.intro}
                        outro={streamData.outro}
                      />
                  ) : (
                      <div className="aspect-video bg-zinc-900 flex items-center justify-center rounded-lg border border-white/5">
                          <div className="text-center space-y-2">
                            <p className="text-white font-medium">No active stream found.</p>
                            <p className="text-sm text-white/40">Try switching servers or audio type.</p>
                          </div>
                      </div>
                  )}
              </div>
              
              <div className="px-2 md:px-4 max-w-5xl space-y-8">
                 {/* Server & Audio Controls */}
                 <div className="space-y-4">
                    {/* Audio Category Switcher */}
                    {(hasSub || hasDub) && (
                        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                             <span className="text-sm font-medium text-white/40 uppercase tracking-widest">Audio</span>
                             <div className="flex items-center gap-2">
                                {hasSub && (
                                    <Link href={`?ep=${ep || ""}&animeId=${animeId || ""}&type=sub`} scroll={false}>
                                        <Button 
                                            variant={type === 'sub' ? "default" : "outline"} 
                                            size="sm"
                                            className={cn(
                                                "gap-2 rounded-full h-9",
                                                type === 'sub' 
                                                    ? "bg-white text-black hover:bg-white/90" 
                                                    : "border-white/10 bg-transparent text-white/60 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            <Captions className="w-4 h-4" />
                                            Subbed
                                        </Button>
                                    </Link>
                                )}
                                {hasDub && (
                                    <Link href={`?ep=${ep || ""}&animeId=${animeId || ""}&type=dub`} scroll={false}>
                                        <Button 
                                            variant={type === 'dub' ? "default" : "outline"} 
                                            size="sm"
                                            className={cn(
                                                "gap-2 rounded-full h-9",
                                                type === 'dub' 
                                                    ? "bg-white text-black hover:bg-white/90" 
                                                    : "border-white/10 bg-transparent text-white/60 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            <Mic className="w-4 h-4" />
                                            Dubbed
                                        </Button>
                                    </Link>
                                )}
                             </div>
                        </div>
                    )}

                    {/* Server List */}
                    {streamData?.servers && streamData.servers.length > 0 && (
                     <div className="flex flex-wrap items-center gap-3">
                         <span className="text-sm font-medium text-white/40 uppercase tracking-widest mr-2">Server</span>
                         {Array.from(new Set(streamData.servers.map(s => s.serverName)))
                            .map(name => streamData.servers!.find(s => s.serverName === name)!) // deduplicate
                            .map((srv, idx) => {
                                const isSelected = server === srv.serverName || (!server && idx === 0);
                                return (
                                 <Link 
                                   key={`${srv.serverName}-${idx}`} 
                                   href={`?ep=${ep || ""}&animeId=${animeId || ""}&server=${srv.serverName}&type=${type}`}
                                   scroll={false}
                                 >
                                     <Button 
                                        variant={isSelected ? "default" : "secondary"}
                                        size="sm"
                                        className={cn(
                                            "rounded-lg h-9 px-4 text-xs font-bold uppercase tracking-wide gap-2 transition-all",
                                            isSelected
                                                ? "bg-primary text-black shadow-lg shadow-primary/20 scale-105" 
                                                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
                                        )}
                                     >
                                        <ServerIcon className={cn("w-3.5 h-3.5", isSelected ? "text-black/70" : "text-white/40")} />
                                        {srv.serverName}
                                     </Button>
                                 </Link>
                             );
                            })}
                     </div>
                    )}
                 </div>

                 <div className="flex items-start justify-between gap-4">
                     <div>
                        {anime && (
                             <h1 className="text-lg md:text-xl font-medium text-primary mb-1 tracking-wide opacity-90">
                                 {anime.title.userPreferred}
                             </h1>
                        )}
                        <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
                            {currentEp ? (currentEp.title || `Episode ${currentEp.number}`) : "Episode Details"}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-white/50">
                             {currentEp?.number && <span className="bg-white/10 px-2 py-0.5 rounded text-white/80">Episode {currentEp.number}</span>}
                             {anime?.status && <span>{anime.status}</span>}
                             {anime?.releaseDate && <span>{anime.releaseDate}</span>}
                        </div>
                     </div>
                 </div>
                 
                 {currentEp?.description && (
                     <p className="text-white/70 text-lg leading-relaxed font-light text-balance">
                         {currentEp.description}
                     </p>
                 )}
              </div>
           </div>
           
           {/* Episodes Divider */}
           <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

           {/* Full Width Episode List */}
           <div className="space-y-4">
               {anime && (
                   <EpisodeList 
                        episodes={anime.episodes} 
                        currentEpisodeId={activeEpisodeId} 
                        animeId={anime.id} 
                    />
               )}
           </div>

           {/* Recommendations */}
           {anime?.recommendations && anime.recommendations.length > 0 && (
               <div className="space-y-6 pt-10 border-t border-white/5">
                   <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Recommended for you</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                       {anime.recommendations.slice(0, 10).map(rec => (
                           <div key={rec.id} className="w-full">
                               <AnimeCard anime={rec} />
                           </div>
                       ))}
                   </div>
               </div>
           )}
       </div>
    </div>
  );
}
