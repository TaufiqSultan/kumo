"use client";

import { useState, useEffect } from "react";
import { ScheduleItem } from "@/lib/api/types";
import { animeService } from "@/lib/api/anime";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CalendarDays, Clock } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface WeeklyScheduleProps {
  initialSchedule: ScheduleItem[];
}

export function WeeklySchedule({ initialSchedule }: WeeklyScheduleProps) {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(initialSchedule);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [dates, setDates] = useState<Date[]>([]);

  useEffect(() => {
    // Generate next 7 days
    const d = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        d.push(date);
    }
    setDates(d);
  }, []);

  const handleDateChange = async (date: Date) => {
    // If clicking same date, ignore
    if (date.toDateString() === selectedDate.toDateString()) return;

    setSelectedDate(date);
    setIsLoading(true);
    try {
        const dateStr = date.toISOString().split('T')[0];
        const res = await animeService.getSchedule(dateStr);
        setSchedule(res);
    } catch {
        console.error("Failed to fetch schedule");
        setSchedule([]);
    } finally {
        setIsLoading(false);
    }
  };


  
  const isToday = (date: Date) => {
      return date.toDateString() === new Date().toDateString();
  };

  const convertTime = (timeStr: string) => {
      try {
        if (!timeStr) return "";
        const [hours, minutes] = timeStr.split(':').map(Number);
        
        // Create a date object for the scheduled time, assuming JST (UTC+9)
        // We use the selectedDate to get the correct day
        const date = new Date(selectedDate);
        date.setUTCHours(hours - 9, minutes, 0, 0); // JST is UTC+9

        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch {
          return timeStr;
      }
  };

  const sortedSchedule = [...schedule].filter(item => {
    // Basic filter to ensure valid times
    return item.time && item.time.includes(':');
  }).sort((a, b) => {
      // Sort by time
      return a.time.localeCompare(b.time); 
  });

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl">
                <CalendarDays className="w-6 h-6 text-primary" />
            </div>
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-white leading-none">Weekly Schedule</h2>
                <p className="text-sm text-white/50 mt-1 font-medium">Estimated Airing Times</p>
            </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-white/70">
                Your Time: <span className="text-white font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', timeZoneName: 'short' })}</span>
            </span>
        </div>
      </div>

      {/* Date Selector */}
      <div className="relative">
          <ScrollArea className="w-full whitespace-nowrap rounded-2xl bg-[#1a1a1a] border border-white/5 p-2">
            <div className="flex w-max space-x-2 mx-auto px-4 md:px-0 md:justify-center md:w-full">
                {dates.map((date, i) => {
                    const isActive = date.toDateString() === selectedDate.toDateString();
                    return (
                        <button
                            key={i}
                            onClick={() => handleDateChange(date)}
                            className={cn(
                                "relative flex flex-col items-center justify-center min-w-[5rem] h-20 rounded-xl transition-all duration-300 group overflow-hidden",
                                isActive 
                                    ? "bg-primary text-black shadow-[0_0_20px_-5px_var(--primary)] scale-105 z-10" 
                                    : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <span className={cn(
                                "text-[11px] font-bold uppercase tracking-widest mb-1",
                                isActive ? "text-black/60" : "text-white/30 group-hover:text-white/50"
                            )}>
                                {isToday(date) ? "Today" : date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            <span className={cn(
                                "text-2xl font-black leading-none",
                                isActive ? "text-black" : "text-white"
                            )}>
                                {date.getDate()}
                            </span>
                        </button>
                    );
                })}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
      </div>

      {/* Schedule Grid */}
      <div className="min-h-[200px]">
        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 h-20 flex items-center gap-4 border border-white/5">
                        <Skeleton className="h-10 w-10 rounded-lg bg-white/10" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-3 w-3/4 bg-white/10" />
                            <Skeleton className="h-2 w-1/2 bg-white/10" />
                        </div>
                    </div>
                ))}
            </div>
        ) : sortedSchedule.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {sortedSchedule.map((item) => (
                    <Link 
                        key={item.id} 
                        href={`/anime/${item.id}`}
                        className="group flex items-center gap-3 p-3 rounded-xl bg-[#1a1a1a] hover:bg-[#202020] border border-white/5 hover:border-primary/50 transition-all duration-300"
                    >
                        {/* Time Badge */}
                        <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-black/40 border border-white/5 group-hover:border-primary/30 transition-colors">
                            <span className="text-[13px] font-black text-white leading-none">
                                {convertTime(item.time).split(' ')[0]}
                            </span>
                            <span className="text-[9px] font-bold text-white/50 uppercase mt-0.5">
                                {convertTime(item.time).split(' ')[1]}
                            </span>
                        </div>

                        {/* Divider */}
                        <div className="w-[1px] h-8 bg-white/5 group-hover:bg-primary/50 transition-colors" />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[13px] font-bold text-white group-hover:text-primary transition-colors truncate">
                                {item.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary">
                                    EP {item.episode_no}
                                </span>
                                <span className="text-[10px] text-white/30 truncate flex-1">
                                    {item.japanese_title}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 bg-white/5 rounded-xl border border-white/5 border-dashed">
                <div className="bg-white/5 p-3 rounded-full">
                    <CalendarDays className="w-6 h-6 text-white/20" />
                </div>
                <div>
                    <p className="text-white/80 font-medium text-sm">No Schedule Available</p>
                    <p className="text-xs text-white/40">Check back later for updates.</p>
                </div>
            </div>
        )}
      </div>
    </section>
  );
}
