"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { GENRES } from "@/components/features/GenreMenu";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-white/70 hover:text-primary">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetHeader>
            <SheetTitle className="text-left font-bold">KUMO</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-6 px-2">
            <Link
                href="/"
                onClick={() => setOpen(false)}
                className={cn(
                    "text-lg font-medium transition-colors hover:text-primary",
                    pathname === "/" ? "text-primary" : "text-muted-foreground"
                )}
            >
                Home
            </Link>
            
            <Collapsible className="grid gap-2">
                <CollapsibleTrigger className="flex items-center justify-between text-lg font-medium transition-colors hover:text-primary text-muted-foreground [&[data-state=open]>svg]:rotate-180">
                    Genres <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                </CollapsibleTrigger>
                <CollapsibleContent className="grid grid-cols-2 gap-2 pl-4 py-2">
                    {GENRES.map((genre) => (
                        <Link
                            key={genre}
                            href={`/genre/${genre}`}
                            onClick={() => setOpen(false)}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            {genre}
                        </Link>
                    ))}
                </CollapsibleContent>
            </Collapsible>

            <Link
                href="/trending"
                onClick={() => setOpen(false)}
                className={cn(
                    "text-lg font-medium transition-colors hover:text-primary",
                    pathname === "/trending" ? "text-primary" : "text-muted-foreground"
                )}
            >
                Trending
            </Link>
            <Link
                href="/movies"
                onClick={() => setOpen(false)}
                className={cn(
                    "text-lg font-medium transition-colors hover:text-primary",
                    pathname === "/movies" ? "text-primary" : "text-muted-foreground"
                )}
            >
                Movies
            </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
