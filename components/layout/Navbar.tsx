"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { GenreMenu } from "@/components/features/GenreMenu";
import { MobileNav } from "@/components/layout/MobileNav";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

import { animeService } from "@/lib/api/anime";
import { Anime } from "@/lib/api/types";
import Image from "next/image";

function SearchToggle() {
    const [isOpen, setIsOpen] = useState(false);
    const [value, setValue] = useState("");
    const [results, setResults] = useState<Anime[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Focus input when opening
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Close on click outside if empty
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (!value) {
                    setIsOpen(false);
                }
                // Always clear results on click outside to close dropdown
                setResults([]);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [value]);

    // Keyboard Search
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && value.trim()) {
            setIsOpen(false);
            setResults([]);
            router.push(`/search?q=${encodeURIComponent(value.trim())}`);
        }
    };

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (value.trim().length > 2) {
                setIsLoading(true);
                try {
                    const data = await animeService.search(value);
                    setResults(data.results || []);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [value]);

    return (
        <div ref={containerRef} className="relative flex items-center">
            <div 
                className={cn(
                    "flex items-center transition-all duration-300 ease-in-out overflow-hidden bg-white/5 border border-white/10 rounded-full",
                    isOpen ? "w-[200px] lg:w-[300px] px-3 opacity-100" : "w-0 px-0 opacity-0 border-none"
                )}
            >
               <Search className="h-4 w-4 text-white/50 mr-2 shrink-0" />
                <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search anime..."
                    className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder:text-white/50 h-9"
                />
               {value && (
                   <button onClick={() => { setValue(""); setResults([]); }} className="ml-1 hover:text-white text-white/50">
                       <X className="h-3 w-3" />
                   </button>
               )}
            </div>

            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all duration-300 z-10",
                    isOpen ? "absolute right-[-40px] opacity-0 pointer-events-none scale-0" : "opacity-100 scale-100"
                )}
            >
                <Search className="h-5 w-5" />
            </button>

            {/* Search Results Dropdown */}
            {(results.length > 0 || isLoading) && isOpen && (
                <div className="absolute top-12 right-0 w-[300px] bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    {isLoading ? (
                        <div className="p-4 text-center text-white/50 text-sm">Searching...</div>
                    ) : (
                        <div className="max-h-[60vh] overflow-y-auto py-2">
                            {results.slice(0, 5).map((anime) => (
                                <Link 
                                    key={anime.id} 
                                    href={`/anime/${anime.id}`}
                                    onClick={() => { setIsOpen(false); setValue(""); setResults([]); }}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors"
                                >
                                    <div className="relative h-12 w-8 shrink-0 rounded overflow-hidden">
                                        <Image 
                                            src={anime.image} 
                                            alt={anime.title.userPreferred} 
                                            fill 
                                            className="object-cover"
                                            sizes="32px"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {anime.title.userPreferred}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] text-white/50 mt-1">
                                            <span className="bg-white/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] text-white/70">
                                                {anime.type || "TV"}
                                            </span>
                                            {anime.releaseDate && (
                                                <>
                                                    <span>•</span>
                                                    <span>{anime.releaseDate}</span>
                                                </>
                                            )}
                                            {anime.rating && anime.rating > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-yellow-400">★ {anime.rating}%</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function Navbar() {
  const pathname = usePathname();

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-300">
      <header className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl px-6 h-14 flex items-center w-full max-w-7xl">
        {/* Mobile Menu */}
        <div className="md:hidden mr-2">
            <MobileNav />
        </div>

        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2 shrink-0">
          <span className="font-bold text-lg tracking-wider">KUMO</span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link 
                href="/" 
                className={cn(
                    "transition-colors hover:text-primary",
                    pathname === "/" ? "text-primary font-semibold" : "text-white/70"
                )}
            >
              Home
            </Link>
            
            <GenreMenu />


            <Link 
                href="/movies" 
                className={cn(
                    "transition-colors hover:text-primary",
                    pathname === "/movies" ? "text-primary font-semibold" : "text-white/70"
                )}
            >
              Movies
            </Link>
        </nav>
        
        {/* Spacer */}
        <div className="flex-1" />

        {/* Search & Actions */}
        <div className="flex items-center gap-4">
           {/* Animated Search */}
           <SearchToggle />
        </div>
      </header>
    </div>
  );
}
