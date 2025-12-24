"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", 
  "Horror", "Mecha", "Mystery", "Romance", "Sci-Fi", 
  "Slice of Life", "Sports", "Supernatural", "Thriller"
];

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function GenreMenu() {
  const pathname = usePathname();
  const isActive = pathname.startsWith("/genre");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(
        "flex items-center gap-1 transition-colors hover:text-primary outline-none",
        isActive ? "text-primary font-semibold" : "text-white/70"
      )}>
        Genres <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[300px] grid grid-cols-2 gap-2 p-4 bg-black/80 backdrop-blur-xl border-white/10 text-white shadow-2xl rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
        {GENRES.map((genre) => (
          <Link key={genre} href={`/genre/${genre}`}>
            <DropdownMenuItem className="cursor-pointer hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white transition-colors rounded-md p-2">
              {genre}
            </DropdownMenuItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
