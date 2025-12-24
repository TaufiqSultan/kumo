import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Footer() {
  const azList = [
    "All", "#", "0-9", 
    ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
  ];

  return (
    <footer className="w-full bg-background border-t border-white/5 pt-16 pb-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-6 space-y-12 relative z-10">
        
        {/* Brand & A-Z Section */}
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-12">
                <div className="space-y-2">
                    <h2 className="text-4xl font-black tracking-tighter text-white">
                        KUMO
                    </h2>
                    <p className="text-sm text-white/50 max-w-xs">
                        Premium anime streaming experience. Watch your favorite shows in high quality.
                    </p>
                </div>
                
                {/* A-Z Header */}
                <div className="hidden md:block h-12 w-px bg-white/10" />
                
                <div className="flex-1 pb-1">
                     <div className="flex items-center gap-3 mb-4">
                        <span className="text-lg font-bold text-white tracking-wide">A-Z LIST</span>
                        <span className="hidden md:inline text-sm text-white/40">Searching anime order by alphabet name A to Z.</span>
                     </div>
                     
                     <div className="flex flex-wrap gap-2">
                        {azList.map((char) => (
                            <Link key={char} href={`/az-list/${char}`} className="group">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="h-8 min-w-[32px] px-2 rounded-md bg-white/5 border-white/5 text-white/70 hover:bg-primary hover:text-black hover:border-primary transition-all text-xs font-bold"
                                >
                                    {char}
                                </Button>
                            </Link>
                        ))}
                     </div>
                </div>
            </div>
        </div>

        <div className="w-full h-px bg-white/5" />

        {/* Disclaimer & Copyright */}
        <div className="space-y-6 text-sm text-white/40 text-balance leading-relaxed">
            <p>
                Kumo does not host any files, it merely pulls streams from 3rd party services. Legal issues should be taken up with the file hosts and providers. Kumo is not responsible for any media files shown by the video providers.
            </p>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
                 <p className="font-medium">© {new Date().getFullYear()} Kumo. All rights reserved.</p>
                 <div className="flex items-center gap-6">
                     <Link href="/dmca" className="hover:text-white transition-colors">DMCA</Link>
                     <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                     <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                 </div>
            </div>
        </div>

      </div>
    </footer>
  );
}
