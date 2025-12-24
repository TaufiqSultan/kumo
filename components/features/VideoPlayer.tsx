"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize, Captions, Loader2, Settings, SkipForward, RotateCcw, RotateCw } from "lucide-react"; 
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

import { Subtitle, Anime, Episode } from "@/lib/api/types";
import { useWatchHistory } from "@/hooks/useWatchHistory";

interface VideoPlayerProps {
  url: string;
  poster?: string;
  autoPlay?: boolean;
  headers?: Record<string, string>;
  subtitles?: Subtitle[];
  anime?: Anime;
  episode?: Episode;
  nextEpisodeUrl?: string;
  hasNextEpisode?: boolean;
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
}

export function VideoPlayer({ 
    url, 
    poster, 
    autoPlay = false, 
    headers, 
    subtitles = [], 
    anime, 
    episode,
    nextEpisodeUrl,
    hasNextEpisode = false,
    intro,
    outro
}: VideoPlayerProps) {
  const { saveProgress, getProgress } = useWatchHistory();
  // State for container element to be used as portal target in fullscreen
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hasResumedRef = useRef(false);



  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState<number>(-1); // -1 = Off
  const [internalSubtitles, setInternalSubtitles] = useState<Subtitle[]>([]); // HLS internal subs
  const [qualities, setQualities] = useState<{ id: number; height: number; bitrate: number }[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<number>(0);

  // Extract stable values for effect dependencies
  const referer = headers?.["Referer"] || headers?.["referer"];
  const animeId = anime?.id;
  const episodeId = episode?.id;

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hlsConfig = {
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90,
      renderTextTracksNatively: false, // Important for custom control
    };

    let sourceUrl = url;
    // Use the new proxy for all HLS streams to generic/megacloud providers
    if (url.includes("m3u8") && !url.includes("localhost")) {
      sourceUrl = `/api/proxy?url=${encodeURIComponent(url)}${referer ? `&referer=${encodeURIComponent(referer)}` : ""}`;
    }

    const hls = new Hls(hlsConfig);
    hlsRef.current = hls;

    if (Hls.isSupported()) {
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
         setTimeout(() => setIsReady(true), 0);
         
         // Detect qualities
         if (hls.levels.length > 0) {
             const hlsQualities = hls.levels.map((level, idx) => ({
                 id: idx,
                 height: level.height,
                 bitrate: level.bitrate
             })).sort((a, b) => b.height - a.height);
             setQualities(hlsQualities);
         }

         // Detect internal subtitles
         if (hls.subtitleTracks.length > 0) {
             const hlsSubs = hls.subtitleTracks.map((track) => ({
                url: "", // Internal
                lang: track.name || track.lang || `Track ${track.id}`,
                kind: "captions"
             }));
             setInternalSubtitles(hlsSubs);
         }

         if (autoPlay) video.play().catch(() => {});

         // Auto-resume progress
         if (animeId && !hasResumedRef.current) {
             const progress = getProgress(animeId);
             if (progress && progress.episode.id === episodeId && progress.timestamp > 10) {
                 video.currentTime = progress.timestamp;
             }
             hasResumedRef.current = true;
         }
      });
      
      // ... (rest of the HLS events)
      hls.on(Hls.Events.SUBTITLE_TRACK_LOADED, () => {
           if (hls.subtitleTracks.length > 0) {
                const hlsSubs = hls.subtitleTracks.map((track) => ({
                    url: "",
                    lang: track.name || track.lang || `Track ${track.id}`,
                    kind: "captions"
                }));
                setInternalSubtitles(prev => {
                    if (prev.length === hlsSubs.length) return prev;
                    return hlsSubs;
                });
           }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setTimeout(() => setError("Stream failed. Try reloading."), 0);
              break;
          }
        }
      });
      
      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      setTimeout(() => setIsReady(true), 0);

      // Auto-resume for native HLS (iOS/Safari)
      if (animeId && !hasResumedRef.current) {
          const progress = getProgress(animeId);
          if (progress && progress.episode.id === episodeId && progress.timestamp > 10) {
              video.currentTime = progress.timestamp;
          }
          hasResumedRef.current = true;
      }
    } else {
      setTimeout(() => setError("HLS not supported."), 0);
    }
  }, [url, referer, autoPlay, animeId, episodeId, getProgress]);

  // Format time helper
  const formatTime = (seconds: number) => {
    if (!seconds) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
        const time = videoRef.current.currentTime;
        setCurrentTime(time);
        
        // Save progress every 10 seconds or when significantly changed
        if (anime && episode && videoRef.current.duration > 0) {
            // We use a ref to throttle saves
            const now = Date.now();
            if (!lastSaveRef.current || now - lastSaveRef.current > 10000) {
                lastSaveRef.current = now;
                saveProgress(anime, episode, time, videoRef.current.duration);
            }
        }
    }
  };

  const [lastAction, setLastAction] = useState<{ type: string; value?: string } | null>(null);
  const actionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferedRanges, setBufferedRanges] = useState<{ start: number; end: number }[]>([]);

  const handleProgress = React.useCallback(() => {
    if (videoRef.current) {
        const buffered = videoRef.current.buffered;
        const ranges = [];
        for (let i = 0; i < buffered.length; i++) {
            ranges.push({
                start: buffered.start(i),
                end: buffered.end(i),
            });
        }
        setBufferedRanges(ranges);
    }
  }, []);

  const showFeedback = React.useCallback((type: string, value?: string) => {
      setLastAction({ type, value });
      setShowControls(true);
      if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
      actionTimeoutRef.current = setTimeout(() => setLastAction(null), 800);
  }, []);

  const handleLoadedMetadata = () => {
      if(videoRef.current) {
          setDuration(videoRef.current.duration);
      }
  };

  const handleSeek = (value: number[]) => {
      if (videoRef.current) {
          videoRef.current.currentTime = value[0];
          setCurrentTime(value[0]);
      }
  };

  const handleVolumeChange = React.useCallback((value: number[]) => {
      const newVol = Math.max(0, Math.min(1, value[0]));
      setVolume(newVol);
      if (videoRef.current) {
          videoRef.current.volume = newVol;
          setIsMuted(newVol === 0);
          showFeedback(newVol > volume ? "volume-up" : "volume-down", `${Math.round(newVol * 100)}%`);
      }
  }, [volume, showFeedback]);
  
  const toggleMute = React.useCallback(() => {
      if (videoRef.current) {
          if (isMuted) {
              const targetVol = volume || 1;
              videoRef.current.volume = targetVol;
              setIsMuted(false);
              showFeedback("volume-up", `${Math.round(targetVol * 100)}%`);
          } else {
              videoRef.current.volume = 0;
              setIsMuted(true);
              showFeedback("volume-mute");
          }
      }
  }, [isMuted, volume, showFeedback]);

  // Handle Controls Visibility
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const togglePlay = React.useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
        showFeedback("play");
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        showFeedback("pause");
      }
    }
  }, [showFeedback]);

  const handleQualityChange = (id: string) => {
      const qualityId = parseInt(id);
      setCurrentQuality(qualityId);
      if (hlsRef.current) {
          hlsRef.current.currentLevel = qualityId;
      }
  };

  const handleNextEpisode = () => {
    if (nextEpisodeUrl) {
        window.location.href = nextEpisodeUrl;
    }
  };

  const handleSpeedChange = (id: string) => {
      const speed = parseFloat(id);
      setPlaybackSpeed(speed);
      if (videoRef.current) {
          videoRef.current.playbackRate = speed;
      }
  };

  const skipTime = React.useCallback((amount: number) => {
      if (videoRef.current) {
          videoRef.current.currentTime += amount;
          showFeedback(amount > 0 ? "forward" : "rewind");
      }
  }, [showFeedback]);

  const toggleFullscreen = React.useCallback(() => {
    if (!document.fullscreenElement) {
        containerEl?.requestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
    }
  }, [containerEl]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;

        switch (e.key.toLowerCase()) {
            case " ":
            case "k":
                e.preventDefault();
                togglePlay();
                break;
            case "f":
                e.preventDefault();
                toggleFullscreen();
                break;
            case "m":
                e.preventDefault();
                toggleMute();
                break;
            case "arrowright":
                e.preventDefault();
                skipTime(10);
                break;
            case "arrowleft":
                e.preventDefault();
                skipTime(-10);
                break;
            case "arrowup":
                e.preventDefault();
                handleVolumeChange([volume + 0.1]);
                break;
            case "arrowdown":
                e.preventDefault();
                handleVolumeChange([volume - 0.1]);
                break;
            case "l":
                e.preventDefault();
                skipTime(10);
                break;
            case "j":
                e.preventDefault();
                skipTime(-10);
                break;
        }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, toggleFullscreen, toggleMute, skipTime, handleVolumeChange, volume]);

  // Buffer detection
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onSeeking = () => setIsBuffering(true);
    const onSeeked = () => setIsBuffering(false);

    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("seeking", onSeeking);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("progress", handleProgress);

    return () => {
        video.removeEventListener("waiting", onWaiting);
        video.removeEventListener("playing", onPlaying);
        video.removeEventListener("seeking", onSeeking);
        video.removeEventListener("seeked", onSeeked);
        video.removeEventListener("progress", handleProgress);
    };
  }, [handleProgress]);

  // Filter subtitles based on user preference and deduplicate
  const allSubtitles = React.useMemo(() => {
     // Start with external, then add internal 
     const merged = [...subtitles, ...internalSubtitles];
     
     // Deduplicate by normalized language label
     const uniqueMap = new Map<string, Subtitle>();
     
     merged.forEach(sub => {
         const label = sub.lang.trim();
         const key = label.toLowerCase();
         // Favor external tracks (ones with URL) for consistency with our proxy
         const existing = uniqueMap.get(key);
         if (!existing || (!existing.url && sub.url)) {
             uniqueMap.set(key, sub);
         }
     });
     
     return Array.from(uniqueMap.values()).sort((a,b) => a.lang.localeCompare(b.lang));
  }, [subtitles, internalSubtitles]);

  const filteredSubtitles = React.useMemo(() => {
    // Remove thumbnails/previews
    let relevant = allSubtitles.filter(s => s.kind !== "thumbnails" && s.lang.toLowerCase() !== "thumbnails");
    
    // If there are too many subtitles (over 50, which can happen with automated streams), 
    // prioritize English and common languages to avoid menu bloat.
    if (relevant.length > 50) {
        relevant = relevant.filter(s => 
            s.lang.toLowerCase().includes("eng") || 
            s.lang.toLowerCase().includes("jp") || 
            s.lang.toLowerCase().includes("esp")
        );
    }
    
    return relevant;
  }, [allSubtitles]);



  const [subtitleText, setSubtitleText] = useState<string>("");
  const activeTrackRef = useRef<TextTrack | null>(null);

  const handleSubtitleChange = React.useCallback((index: string) => {
    const idx = parseInt(index);
    setCurrentSubtitle(idx);
    setSubtitleText(""); // Clear previous text

    // Cleanup previous listener
    if (activeTrackRef.current) {
        activeTrackRef.current.oncuechange = null;
        activeTrackRef.current = null;
    }
    
    const video = videoRef.current;
    if (video) {
        // 1. Hide ALL native tracks first
        const tracks = video.textTracks;
        for (let i = 0; i < tracks.length; i++) {
            tracks[i].mode = 'hidden'; // 'hidden' keeps them active but doesn't render native UI
        }
    }

    // 2. Disable HLS internal subtitles by default
    if (hlsRef.current) {
        hlsRef.current.subtitleTrack = -1;
    }

    if (idx === -1) return;

    const selectedSub = filteredSubtitles[idx];
    if (!selectedSub) return;
    
    const isInternal = !selectedSub.url; 
    let activeTrack: TextTrack | null = null;
    
    if (isInternal && hlsRef.current) {
         // Handle internal (HLS)
         // Note: For custom rendering of HLS internal subs, we might need to rely on HLS events
         // But often HLS.js populates video.textTracks too if configured right.
         // For now, we fall back to HLS native toggle if we can't find track, 
         // but ideally we find the DOM track generated by HLS.
         const hlsIdx = hlsRef.current.subtitleTracks.findIndex(t => 
             (t.name || t.lang || `Track ${t.id}`) === selectedSub.lang
         );
         if (hlsIdx !== -1) {
             hlsRef.current.subtitleTrack = hlsIdx;
             // Try to find the corresponding textTrack in video element
             // HLS.js usually lazily creates them.
         }
    } 

    if (video) {
        const tracks = video.textTracks;
        for (let i = 0; i < tracks.length; i++) {
            if (tracks[i].label === selectedSub.lang) {
                tracks[i].mode = 'hidden'; // Keep hidden for custom render
                activeTrack = tracks[i];
                break;
            }
        }
    }

    if (activeTrack) {
        activeTrackRef.current = activeTrack;
        activeTrack.oncuechange = () => {
            const cue = activeTrack.activeCues?.[0];
            if (cue && 'text' in cue) {
                setSubtitleText((cue as VTTCue).text);
            } else {
                setSubtitleText("");
            }
        };
        // Trigger initial check immediately
        const cue = activeTrack.activeCues?.[0];
         if (cue && 'text' in cue) {
            setSubtitleText((cue as VTTCue).text);
        }
    }
  }, [filteredSubtitles]);

  // Auto-select subtitle on load or change
  useEffect(() => {
    if (filteredSubtitles.length > 0 && currentSubtitle === -1) {
       // Prefer English if available, otherwise first
       const engIndex = filteredSubtitles.findIndex(s => s.lang?.toLowerCase().includes("eng"));
       const targetIndex = engIndex !== -1 ? engIndex : 0;
       
       // Small delay to ensure tracks are loaded and registered in DOM
       const timer = setTimeout(() => handleSubtitleChange(targetIndex.toString()), 800);
       return () => clearTimeout(timer);
    }
  }, [filteredSubtitles, currentSubtitle, handleSubtitleChange]);

  // Skip Intro Logic
  const showSkipIntro = intro && currentTime >= intro.start && currentTime < intro.end;
  const showSkipOutro = outro && currentTime >= outro.start && currentTime < outro.end;

  const handleSkipIntro = () => {
      if (intro && videoRef.current) {
          videoRef.current.currentTime = intro.end;
          showFeedback("forward", "Skipped Intro");
      }
  };

  const handleSkipOutro = () => {
      if (outro && videoRef.current) {
          videoRef.current.currentTime = outro.end;
          showFeedback("forward", "Skipped Outro");
      }
  };


  return (
    <div 
        ref={setContainerEl} 
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group shadow-2xl ring-1 ring-white/10"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {error ? (
        <div className="flex items-center justify-center h-full text-white bg-zinc-900/50 backdrop-blur-sm">
          <div className="text-center space-y-2">
            <p className="font-semibold text-red-400">Playback Playback Error</p>
            <p className="text-sm text-zinc-400">{error}</p>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            poster={poster ? `/api/proxy?url=${encodeURIComponent(poster)}` : undefined}
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleNextEpisode}
            crossOrigin="anonymous"
          >
             {filteredSubtitles.map((sub, index) => {
                let trackSrc = sub.url;
                if (sub.url && !sub.url.includes("localhost")) {
                    const referer = headers?.["Referer"] || headers?.["referer"];
                    trackSrc = `/api/proxy?url=${encodeURIComponent(sub.url)}${referer ? `&referer=${encodeURIComponent(referer)}` : ""}`;
                }

                return (
                    <track
                        key={index}
                        kind={sub.kind || "captions"}
                        label={sub.lang}
                        srcLang={sub.lang ? sub.lang.split(" ")[0].toLowerCase().slice(0, 2) : "en"}
                        src={trackSrc}
                        default={false} // Managed manually
                    />
                );
            })}
          </video>

          {/* Custom Subtitle Renderer */}
          {subtitleText && (
             <div className={clsx(
                "absolute left-0 right-0 text-center px-4 transition-all duration-300 ease-out z-30 pointer-events-none",
                showControls ? "bottom-28" : "bottom-12"
             )}>
                <span 
                    className="inline-block text-white text-lg md:text-xl lg:text-2xl px-2 py-1 leading-relaxed font-bold tracking-wide drop-shadow-md"
                    style={{
                        textShadow: "black 0px 0px 4px, black 0px 0px 4px, black 0px 0px 4px" // Strong outline effect
                    }}
                    dangerouslySetInnerHTML={{ __html: subtitleText }} 
                />
             </div>
          )}

          {/* Interaction Feedback Overlay */}
          {lastAction && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[60]">
                  <div className="bg-black/40 backdrop-blur-2xl rounded-full p-8 animate-in zoom-in fade-in duration-300 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col items-center justify-center min-w-[160px] min-h-[160px]">
                      {lastAction.type === 'play' && <Play className="w-16 h-16 text-white fill-current drop-shadow-lg" />}
                      {lastAction.type === 'pause' && <Pause className="w-16 h-16 text-white fill-current drop-shadow-lg" />}
                      
                      {lastAction.type === 'forward' && (
                          <div className="flex flex-col items-center gap-2">
                              <RotateCw className="w-16 h-16 text-white drop-shadow-lg" />
                              <span className="text-white text-xl font-bold drop-shadow-lg">+10s</span>
                          </div>
                      )}
                      
                      {lastAction.type === 'rewind' && (
                          <div className="flex flex-col items-center gap-2">
                              <RotateCcw className="w-16 h-16 text-white drop-shadow-lg" />
                              <span className="text-white text-xl font-bold drop-shadow-lg">-10s</span>
                          </div>
                      )}
                      
                      {lastAction.type.startsWith('volume') && (
                          <div className="relative flex items-center justify-center">
                              {/* Circular Progress SVG */}
                              <svg className="absolute w-[140px] h-[140px] -rotate-90">
                                  <circle 
                                      cx="70" 
                                      cy="70" 
                                      r="64" 
                                      fill="none" 
                                      stroke="white" 
                                      strokeWidth="4" 
                                      className="opacity-10"
                                  />
                                  <circle 
                                      cx="70" 
                                      cy="70" 
                                      r="64" 
                                      fill="none" 
                                      stroke="currentColor" 
                                      strokeWidth="4" 
                                      strokeDasharray={402.12} // 2 * PI * 64
                                      strokeDashoffset={402.12 * (1 - volume)}
                                      className="text-primary transition-all duration-300"
                                      strokeLinecap="round"
                                  />
                              </svg>
                              
                              <div className="flex flex-col items-center gap-2 z-10">
                                  {lastAction.type === 'volume-mute' || volume === 0 ? (
                                      <VolumeX className="w-14 h-14 text-white drop-shadow-lg" />
                                  ) : (
                                      <Volume2 className="w-14 h-14 text-white drop-shadow-lg" />
                                  )}
                                  {lastAction.value && (
                                      <span className="text-white text-2xl font-black tracking-tighter drop-shadow-lg">
                                          {lastAction.value}
                                      </span>
                                  )}
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          )}


          {/* Skip Intro/Outro Button */}
          {(showSkipIntro || showSkipOutro) && (
             <div className="absolute bottom-24 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                 <Button 
                    onClick={showSkipIntro ? handleSkipIntro : handleSkipOutro}
                    className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 font-bold tracking-wide shadow-lg group"
                 >
                    {showSkipIntro ? "SKIP INTRO" : "SKIP OUTRO"}
                    <SkipForward className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                 </Button>
             </div>
          )}

          {/* Loading/Buffering Overlay */}
          {(isBuffering || !isReady) && !error && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 backdrop-blur-[2px] pointer-events-none">
                <div className="relative">
                    <Loader2 className="w-16 h-16 animate-spin text-primary opacity-80" />
                    <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse rounded-full" />
                </div>
             </div>
          )}

          {/* Controls Overlay */}
          <div className={clsx(
            "absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-all duration-500 flex flex-col justify-end px-6 pb-6 pt-20 pointer-events-none z-40",
            showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
             <div className="space-y-4 pointer-events-auto">
                {/* Progress Bar */}
                <div className="group/slider relative flex items-center h-4 cursor-pointer">
                    {/* Buffered Tracks Indicator */}
                    <div className="absolute inset-0 h-1.5 top-1/2 -translate-y-1/2 pointer-events-none px-[2px]">
                        <div className="relative w-full h-full overflow-hidden rounded-full overflow-hidden">
                            {bufferedRanges.map((range, idx) => {
                                const startPercent = (range.start / (duration || 1)) * 100;
                                const widthPercent = ((range.end - range.start) / (duration || 1)) * 100;
                                if (widthPercent <= 0) return null;
                                return (
                                    <div 
                                        key={idx}
                                        className="absolute top-0 bottom-0 bg-white/30 backdrop-blur-sm transition-all duration-500"
                                        style={{ 
                                            left: `${startPercent}%`, 
                                            width: `${widthPercent}%` 
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <Slider 
                        value={[currentTime]} 
                        max={duration || 100} 
                        step={1}
                        onValueChange={handleSeek}
                        className="cursor-pointer relative z-10"
                    />
                </div>

                <div className="flex items-center gap-4 justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => skipTime(-10)} 
                                className="text-white hover:bg-white/20 transition-transform hidden md:flex"
                                title="Rewind 10s"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </Button>
                            
                            <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20 hover:scale-110 transition-transform">
                                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                            </Button>

                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => skipTime(10)} 
                                className="text-white hover:bg-white/20 transition-transform hidden md:flex"
                                title="Forward 10s"
                            >
                                <RotateCw className="w-5 h-5" />
                            </Button>

                            {hasNextEpisode && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={handleNextEpisode} 
                                    className="text-white hover:bg-white/20 hover:scale-110 transition-transform"
                                    title="Next Episode"
                                >
                                    <SkipForward className="w-6 h-6 fill-current" />
                                </Button>
                            )}
                        </div>

                         {/* Volume Control */}
                        <div className="flex items-center gap-2 group/volume">
                             <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20">
                                {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                             </Button>
                             <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300">
                                <Slider 
                                    value={[isMuted ? 0 : volume]} 
                                    max={1} 
                                    step={0.1}
                                    onValueChange={handleVolumeChange}
                                    className="w-24" 
                                />
                             </div>
                        </div>

                        <div className="text-sm font-medium tabular-nums text-white/90">
                           {formatTime(currentTime)} <span className="text-white/50 px-1">/</span> {formatTime(duration)}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Subtitles Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                                    <Captions className={clsx("w-6 h-6", currentSubtitle !== -1 && "text-primary")} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent container={containerEl} align="end" className="max-h-[300px] z-[100] overflow-y-auto bg-black/95 border-white/10 backdrop-blur-xl text-white">
                                <DropdownMenuLabel>Subtitles</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/20" />
                                <DropdownMenuRadioGroup value={currentSubtitle.toString()} onValueChange={handleSubtitleChange}>
                                    <DropdownMenuRadioItem value="-1" className="focus:bg-white/20 focus:text-white cursor-pointer py-2">Off</DropdownMenuRadioItem>
                                    {filteredSubtitles.map((sub, index) => (
                                        <DropdownMenuRadioItem key={index} value={index.toString()} className="focus:bg-white/20 focus:text-white cursor-pointer py-2">
                                        {sub.lang}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Settings Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                                    <Settings className="w-6 h-6" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent container={containerEl} align="end" className="w-56 bg-black/90 border-white/10 backdrop-blur-md text-white">
                                <DropdownMenuLabel>Playback Settings</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/20" />
                                
                                {/* Quality Submenu */}
                                {qualities.length > 0 && (
                                    <>
                                        <div className="px-2 py-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider">Quality</div>
                                        <DropdownMenuRadioGroup value={currentQuality.toString()} onValueChange={handleQualityChange}>
                                            <DropdownMenuRadioItem value="-1" className="focus:bg-white/20 focus:text-white cursor-pointer">Auto</DropdownMenuRadioItem>
                                            {qualities.map((q) => (
                                                <DropdownMenuRadioItem key={q.id} value={q.id.toString()} className="focus:bg-white/20 focus:text-white cursor-pointer">
                                                    {q.height}p
                                                </DropdownMenuRadioItem>
                                            ))}
                                        </DropdownMenuRadioGroup>
                                        <DropdownMenuSeparator className="bg-white/20" />
                                    </>
                                )}

                                {/* Speed Submenu */}
                                <div className="px-2 py-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider">Speed</div>
                                <DropdownMenuRadioGroup value={playbackSpeed.toString()} onValueChange={handleSpeedChange}>
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                        <DropdownMenuRadioItem key={speed} value={speed.toString()} className="focus:bg-white/20 focus:text-white cursor-pointer">
                                            {speed === 1 ? "Normal" : `${speed}x`}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20 origin-center hover:scale-110 transition-transform">
                            <Maximize className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
             </div>
          </div>
        </>
      )}
    </div>
  );
}
