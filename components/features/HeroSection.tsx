"use client";

import Link from "next/link";
import { Play, Star, Captions, Mic, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Anime } from "@/lib/api/types";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  animes: Anime[];
}

export function HeroSection({ animes }: HeroSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 8000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => setSelectedIndex(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  if (!animes || animes.length === 0) return null;

  return (
    <div className="relative h-[90vh] w-full overflow-hidden group">
      <div className="absolute inset-0 z-0" ref={emblaRef}>
        <div className="flex h-full">
          {animes.map((anime) => (
            <div className="relative flex-[0_0_100%] min-w-0 h-full" key={anime.id}>
               {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-[center_top] bg-no-repeat transition-transform duration-700 select-none"
                style={{ 
                    backgroundImage: `url(${anime.image})` 
                }}
              >
                {/* Cinematic Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent" />
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-center pb-12 pt-20 z-10">
                <div className="container max-w-7xl mx-auto px-6">
                    <div className="max-w-4xl space-y-6">
                      <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-1.5 text-base border-none shadow-lg w-fit">
                        #{animes.indexOf(anime) + 1} Trending Spotlight
                      </Badge>
                      
                      <div className="flex flex-col gap-4">
                        <h1 
                          className={cn(
                            "font-black tracking-tight leading-[1.1] drop-shadow-2xl transition-all duration-300",
                            (anime.title.english || anime.title.userPreferred).length > 50 
                              ? "text-3xl md:text-5xl lg:text-6xl" 
                              : (anime.title.english || anime.title.userPreferred).length > 25
                                ? "text-4xl md:text-6xl lg:text-7xl"
                                : "text-5xl md:text-7xl lg:text-8xl"
                          )}
                        >
                          {anime.title.english || anime.title.userPreferred}
                        </h1>

                        <div className="flex flex-wrap items-center gap-3 text-sm md:text-base font-medium text-white/90 drop-shadow-md">
                           {/* Rating */}
                           {anime.rating && (
                               <>
                                   <div className="flex items-center gap-1.5 text-[#ffdd00]">
                                        <Star className="w-5 h-5 fill-current" />
                                        <span className="font-bold">{anime.rating}</span>
                                   </div>
                                   <div className="w-[1px] h-4 bg-white/20" />
                               </>
                           )}

                           {/* Quality */}
                           <Badge variant="outline" className="border-[#ccff00] text-[#ccff00] h-6 px-2 text-xs uppercase font-black rounded-sm backdrop-blur-sm">
                                {anime.tvInfo?.quality || "HD"}
                           </Badge>

                           {/* Captions / Mic */}
                           <div className="flex items-center gap-2">
                                <div className="bg-white/10 border border-white/10 px-2 py-0.5 rounded-sm flex items-center gap-1.5 backdrop-blur-sm">
                                    <Captions className="w-3.5 h-3.5 text-white/70" />
                                    <span className="text-xs font-bold text-white">{anime.tvInfo?.sub || "?"}</span>
                                </div>
                                {anime.tvInfo?.dub && (
                                    <div className="bg-white/10 border border-white/10 px-2 py-0.5 rounded-sm flex items-center gap-1.5 backdrop-blur-sm">
                                        <Mic className="w-3.5 h-3.5 text-white/70" />
                                        <span className="text-xs font-bold text-white">{anime.tvInfo?.dub}</span>
                                    </div>
                                )}
                           </div>

                           <div className="w-[1px] h-4 bg-white/20" />

                           {/* Type & Date */}
                           <div className="flex items-center gap-3 text-white/70">
                               <span className="uppercase tracking-wider text-xs font-bold bg-white/10 px-2 py-0.5 rounded-sm">{anime.type || "TV"}</span>
                               <span className="flex items-center gap-1.5 text-xs">
                                   <Calendar className="w-3.5 h-3.5" />
                                   {anime.releaseDate || "Unknown"}
                               </span> 
                           </div>
                        </div>
                      </div>

                      <p className="text-sm md:text-base lg:text-lg text-white/80 line-clamp-3 md:line-clamp-2 max-w-2xl drop-shadow-md leading-relaxed"
                         dangerouslySetInnerHTML={{ __html: anime.description || "" }} 
                      />

                      <div className="flex items-center gap-4 pt-6">
                        <Link href={`/anime/${anime.id}`}>
                            <Button size="lg" className="gap-2 text-lg h-14 px-8 font-bold shadow-xl hover:scale-105 transition-transform">
                                <Play className="fill-current w-6 h-6" /> Watch Now
                            </Button>
                        </Link>
                        <Link href={`/anime/${anime.id}`}>
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/20 bg-black/40 backdrop-blur-md hover:bg-white/10 hover:text-white transition-colors">
                                Details
                            </Button>
                        </Link>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-8 right-8 z-20 flex gap-2">
         {animes.map((_, index) => (
             <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === selectedIndex ? "w-8 bg-primary" : "w-2 bg-white/30 hover:bg-white/50"
                )}
             />
         ))}
      </div>
    </div>
  );
}
