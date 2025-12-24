import { animeService } from "@/lib/api/anime";
import { EpisodeList } from "@/components/features/EpisodeList";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { AnimeCard } from "@/components/features/AnimeCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 3600;

export default async function AnimeDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const animePromise = animeService.getAnimeDetails(id);
  const charactersPromise = animeService.getCharacters(id);

  const [anime, characters] = await Promise.all([animePromise, charactersPromise]);


  const title = anime.title.english || anime.title.userPreferred || anime.title.romaji || "Untitled Anime";
  
  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Cinematic Hero Section */}
      {/* Cinematic Hero Section */}
      <div className="relative w-full h-[65vh] min-h-[600px] lg:h-[75vh] group overflow-hidden">
        {/* Background Image with Parallax-like feel (fixed) */}
        <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] ease-in-out group-hover:scale-105"
            style={{ 
                backgroundImage: `url(${anime.banner || anime.image})`,
            }}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

        {/* Content Container */}
        <div className="container mx-auto px-6 h-full flex flex-col justify-end pb-12 relative z-10">
            <div className="flex flex-col md:flex-row gap-8 items-end">
                {/* Floating Poster */}
                <div className="hidden md:block shrink-0 w-[240px] lg:w-[280px] aspect-[2/3] relative -mb-12 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 group-hover:shadow-[0_25px_60px_rgba(0,0,0,0.6)] transition-all duration-500 hover:-translate-y-2">
                     <img 
                        src={anime.image} 
                        alt={anime.title.userPreferred} 
                        className="w-full h-full object-cover" 
                     />
                </div>

                {/* Hero Info */}
                <div className="flex-1 space-y-6 pb-2">
                     {/* Title */}
                    <div className="space-y-4">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-md leading-tight text-balance">
                            {title}
                        </h1>

                        {/* Metadata Badges (Moved Below Title) */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-white shadow-lg">
                            <span className={anime.status === "Ongoing" ? "w-2 h-2 rounded-full bg-green-500 animate-pulse" : "hidden"} />
                            {anime.status}
                            </div>
                            <Badge variant="secondary" className="bg-white/10 backdrop-blur-md border-white/10 hover:bg-white/20 text-white transition-colors">
                                {anime.type}
                            </Badge>
                            {anime.releaseDate && (
                                <Badge variant="outline" className="border-white/20 text-white/80">
                                    {anime.releaseDate}
                                </Badge>
                            )}
                            <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold ml-2">
                                ★ {anime.rating ? (anime.rating / 10).toFixed(1) : "N/A"}
                            </div>
                        </div>

                        {/* Short Synopsis - Line Clamped */}
                        <div className="max-w-2xl text-lg text-white/80 line-clamp-3 leading-relaxed md:text-xl font-light">
                             <div dangerouslySetInnerHTML={{ __html: anime.description || "" }} />
                        </div>
                    </div>
                    
                    {/* Actions */}
                     <div className="flex flex-wrap items-center gap-4 pt-2">
                         {anime.episodes?.length > 0 ? (
                            <Link href={`/watch/${anime.episodes[0].id}?animeId=${anime.id}`}>
                                <Button 
                                    size="lg" 
                                    className="h-14 px-8 rounded-full text-lg font-bold gap-3 bg-white text-black hover:bg-white/90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                >
                                    <Play className="fill-current w-5 h-5" /> 
                                    Watch Now
                                </Button>
                            </Link>
                         ) : (
                                <Button disabled size="lg" className="h-14 px-8 rounded-full text-lg opacity-50">
                                    Not Available
                                </Button>
                         )}
                         {/* Genres */}
                         <div className="flex flex-wrap gap-2 ml-2">
                             {anime.genres?.slice(0, 3).map(g => (
                                 <Link key={g} href={`/genre/${g}`}>
                                     <span className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-pointer">
                                         {g}
                                     </span>
                                 </Link>
                             ))}
                         </div>
                     </div>
                </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Left Layout (Info & Details) */}
          <div className="md:col-span-3 space-y-8 mt-12 hidden md:block">
               {/* Detail Card */}
               <div className="space-y-6 text-sm text-muted-foreground">
                    <div>
                         <h3 className="font-semibold text-foreground mb-1">Studios</h3>
                         <p className="text-white/80">{anime.studios?.join(", ") || "Unknown"}</p>
                    </div>
                    <div>
                         <h3 className="font-semibold text-foreground mb-1">Season</h3>
                         <p className="text-white/80 uppercase">{anime.season || "Unknown"}</p>
                    </div>
                    <div>
                         <h3 className="font-semibold text-foreground mb-1">Duration</h3>
                         <p className="text-white/80">{anime.duration ? `${anime.duration} mins` : "Unknown"}</p>
                    </div>
                     <div>
                         <h3 className="font-semibold text-foreground mb-1">Episodes</h3>
                         <p className="text-white/80">{anime.tvInfo?.eps || anime.episodes?.length || "?"}</p>
                    </div>
               </div>
          </div>

          {/* Right Layout (Episodes & Synopsis) */}
          <div className="md:col-span-9 space-y-12">
               {/* Mobile Poster (Visible only on mobile) */}
               <div className="md:hidden flex flex-col gap-6 -mt-20 relative z-20">
                   <div className="w-[180px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl mx-auto ring-1 ring-white/10">
                        <img src={anime.image} alt={anime.title.userPreferred} className="w-full h-full object-cover" />
                   </div>
                   <div className="space-y-4 px-2">
                       {/* Mobile Details Grid */}
                       <div className="grid grid-cols-2 gap-4 text-sm bg-secondary/20 p-4 rounded-xl backdrop-blur-md">
                           <div>
                                <span className="text-muted-foreground block text-xs">Rating</span>
                                <span className="font-semibold text-yellow-400">★ {anime.rating ? (anime.rating/10).toFixed(1) : "N/A"}</span>
                           </div>
                           <div>
                                <span className="text-muted-foreground block text-xs">Status</span>
                                <span className="font-semibold text-white">{anime.status}</span>
                           </div>
                            <div>
                                <span className="text-muted-foreground block text-xs">Studios</span>
                                <span className="font-semibold text-white truncate">{anime.studios?.[0] || "Unknown"}</span>
                           </div>
                            <div>
                                <span className="text-muted-foreground block text-xs">Episodes</span>
                                <span className="font-semibold text-white">{anime.tvInfo?.eps || anime.episodes?.length || "?"}</span>
                           </div>
                       </div>
                   </div>
               </div>
               
               {/* Full Synopsis */}
               <section>
                   <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                       Synopsis
                   </h3>
                   <div 
                     className="text-lg text-muted-foreground leading-relaxed max-w-4xl" 
                     dangerouslySetInnerHTML={{ __html: anime.description || "No description available." }} 
                   />
               </section>

               {/* Episodes */}
               <section>
                   <EpisodeList episodes={anime.episodes || []} animeId={anime.id} />
               </section>

                {/* Recommendations */}
                {anime.recommendations && anime.recommendations.length > 0 && (
                 <section className="pt-8 border-t border-white/5">
                     <h2 className="text-2xl font-bold mb-6">You might also like</h2>
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                         {anime.recommendations.slice(0, 8).map((rec) => (
                             <div key={rec.id} className="h-[280px]">
                                 <AnimeCard anime={rec} />
                             </div>
                         ))}
                     </div>
                 </section>
                )}

                {/* Characters Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                            Characters & Voice Actors
                        </h3>
                    </div>
                    <div className="relative">
                         <div className="flex overflow-x-auto gap-4 pb-4 snap-x scrollbar-hide">
                             {characters.data?.length > 0 ? (
                                 characters.data.slice(0, 20).map((edge, idx) => (
                                 <div key={idx} className="w-[140px] flex-shrink-0 snap-start space-y-3">
                                     <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-white/5 relative group">
                                         <img 
                                             src={edge.character.poster} 
                                             alt={edge.character.name}
                                             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                             loading="lazy"
                                         />
                                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                     </div>
                                     <div className="text-sm">
                                         <p className="font-semibold text-white line-clamp-1">{edge.character.name}</p>
                                         <p className="text-primary text-xs">{edge.character.cast}</p>
                                         {edge.voiceActors?.[0] && (
                                             <div className="mt-1 pt-1 border-t border-white/10">
                                                 <p className="text-xs text-white/50">{edge.voiceActors[0].name}</p>
                                                 <p className="text-[10px] text-white/30">{edge.voiceActors[0].language}</p>
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             ))
                             ) : (
                                 <p className="text-white/40 italic">No character info available.</p>
                             )}
                         </div>
                    </div>
                </section>
          </div>
      </div>
    </main>
  );
}
