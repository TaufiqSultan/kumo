import { 
    Anime, 
    AnimeDetails, 
    Episode, 
    SearchResults, 
    StreamingData, 
    HomeData, 
    ScheduleItem, 
    CharacterListResponse, 
    Server,
    RawAnime,
    RawEpisode,
    RawAnimeDetailsResponse,
    RawStreamingLink,
    QTipAnime
} from "./types";

const BASE_URL = "https://anime-api-kohl.vercel.app";

interface RawAnimeLike {
    id: string;
    title?: string;
    name?: string;
    poster: string;
    description?: string;
    tvInfo?: {
        showType?: string;
        releaseDate?: string;
        rating?: string | number;
    };
    type?: string;
    rating?: string | number;
    releaseDate?: string | number;
    year?: string | number;
    data_id?: string | number;
}

function transformAnime(item: RawAnimeLike): Anime {
    const titleStr = item.title || item.name || "";
    const tvInfo = item.tvInfo || {};
    
    const ratingValue = tvInfo.rating || item.rating;
    const rating = (ratingValue && !isNaN(parseFloat(ratingValue.toString()))) ? parseFloat(ratingValue.toString()) : undefined;

    return {
        id: item.id,
        data_id: typeof item.data_id === 'number' ? item.data_id : (item.data_id ? Number(item.data_id) : undefined),
        title: {
            userPreferred: titleStr,
            english: titleStr,
            romaji: titleStr,
        },
        image: item.poster,
        poster: item.poster,
        description: item.description,
        tvInfo: tvInfo as unknown as Anime["tvInfo"],
        type: tvInfo.showType || item.type || "TV",
        rating: rating,
        releaseDate: tvInfo.releaseDate || (item.releaseDate?.toString()) || (item.year?.toString()),
    };
}

class AnimeService {
  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const fetchOptions: RequestInit = {
      next: { revalidate: 3600 },
      ...options,
    };

    if (fetchOptions.cache === 'no-store' && fetchOptions.next) {
       const next = { ...fetchOptions.next };
       delete (next as { revalidate?: number }).revalidate;
       fetchOptions.next = next;
    }

    try {
      const res = await fetch(url, fetchOptions);

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }

      const json = await res.json();
      if (!json.success) {
          console.warn("API returned success: false", json);
      }
      return json.results; 
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
      throw error;
    }
  }

  // Helper to fetch data with a custom limit by spanning multiple API pages if needed
  private async fetchWithLimit(path: string, page: number, limit: number): Promise<SearchResults> {
    const apiPageSize = 40; // Clamped by the API
    const startIdx = (page - 1) * limit;
    const endIdx = page * limit;

    const startApiPage = Math.floor(startIdx / apiPageSize) + 1;
    const endApiPage = Math.floor((endIdx - 1) / apiPageSize) + 1;

    let allResults: RawAnime[] = [];
    let totalPages = 1;

    for (let p = startApiPage; p <= endApiPage; p++) {
        const res = await this.fetch<{ data: RawAnime[], totalPages: number }>(`${path}${path.includes('?') ? '&' : '?'}page=${p}`, { cache: 'no-store' });
        if (res.data) {
            allResults = [...allResults, ...res.data];
            totalPages = res.totalPages;
        }
    }

    // Calculate local slice
    const localStart = startIdx % apiPageSize;
    const items = allResults.slice(localStart, localStart + limit);
    
    // Calculate total pages based on our custom limit
    const totalItems = totalPages * apiPageSize;
    const customTotalPages = Math.ceil(totalItems / limit);

    return {
        results: items.map(transformAnime),
        currentPage: page,
        hasNextPage: page < customTotalPages,
        totalPages: customTotalPages
    };
  }

  // Fetch trending anime (Paginated)
  async getTrending(page = 1, limit = 42): Promise<SearchResults> {
      return this.fetchWithLimit('/api/top-airing', page, limit);
  }

  // Fetch airing anime
  async getAiring(page = 1, limit = 42): Promise<SearchResults> {
      return this.fetchWithLimit('/api/top-airing', page, limit);
  }

  // Fetch popular anime (Most Popular)
  async getPopular(page = 1, limit = 42): Promise<SearchResults> {
      return this.fetchWithLimit('/api/most-popular', page, limit);
  }

  // Fetch favorite anime
  async getFavorite(page = 1, limit = 42): Promise<SearchResults> {
      return this.fetchWithLimit('/api/most-favorite', page, limit);
  }

  // Fetch latest episodes
  async getLatestEpisodes(page = 1, limit = 42): Promise<SearchResults> {
      return this.fetchWithLimit('/api/recently-updated', page, limit);
  }

  // Fetch movies
  async getMovies(page = 1, limit = 42): Promise<SearchResults> {
      return this.fetchWithLimit('/api/movie', page, limit);
  }

  // Search anime
  async search(query: string, page = 1): Promise<SearchResults> {
    const results = await this.fetch<{ data: RawAnime[], totalPage?: number, totalPages?: number }>(`/api/search?keyword=${encodeURIComponent(query)}&page=${page}`);
    
    // Safety check for search results which can be { data: [], totalPage: ... } or just []
    const data = results?.data || (Array.isArray(results) ? results : []);
    const totalPages = results?.totalPages || results?.totalPage || 1;

    // Transform and sort results by relevance/popularity
    const transformed = data.map(transformAnime);
    
    const sortedItems = [...transformed].sort((a, b) => {
        const queryLower = query.toLowerCase();
        const aTitleLower = a.title.userPreferred.toLowerCase();
        const bTitleLower = b.title.userPreferred.toLowerCase();

        // 1. Exact match boost
        if (aTitleLower === queryLower && bTitleLower !== queryLower) return -1;
        if (bTitleLower === queryLower && aTitleLower !== queryLower) return 1;

        // 2. Starts with query boost
        if (aTitleLower.startsWith(queryLower) && !bTitleLower.startsWith(queryLower)) return -1;
        if (bTitleLower.startsWith(queryLower) && !aTitleLower.startsWith(queryLower)) return 1;

        // 3. TV show type boost (usually the main series)
        if (a.type === "TV" && b.type !== "TV") return -1;
        if (a.type !== "TV" && b.type === "TV") return 1;

        return 0;
    });

    return {
        results: sortedItems,
        currentPage: page,
        hasNextPage: totalPages > page,
        totalPages: totalPages
    };
  }

  // Get content by category (e.g. 'movie', 'tv', 'genre/action', 'top-airing')
  async getByCategory(category: string, page = 1, limit = 42): Promise<SearchResults> {
      return this.fetchWithLimit(`/api/${category}`, page, limit);
  }

  async getAZList(char: string, page = 1, limit = 42): Promise<SearchResults> {
      const endpoint = char.toLowerCase() === "all" ? "/api/az-list" : `/api/az-list/${char}`;
      return this.fetchWithLimit(endpoint, page, limit);
  }

  // Get anime details
  // Needs 2 calls: Info + Episodes
  async getAnimeDetails(id: string): Promise<AnimeDetails & { episodes: Episode[] }> {
    try {
        const info = await this.fetch<RawAnimeDetailsResponse>(`/api/info?id=${id}`).catch(err => {
            console.error("Info fetch failed", err);
            return null;
        });

        const eps = await this.fetch<{ episodes: RawEpisode[] }>(`/api/episodes/${id}`).catch(err => {
            console.error("Episodes fetch failed", err);
            return { episodes: [] };
        });
        
        const episodes = eps?.episodes?.map((e) => ({
            id: e.id,
            number: e.episode_no, 
            title: e.title,
            japanese_title: e.japanese_title,
            isFiller: e.filler // Assuming the API returns 'filler' as a boolean
        })) || [];

        // If info failed, we return a barebones object with episode data
        if (!info || !info.data) {
            return {
                id: id,
                title: { userPreferred: id, english: id, romaji: id },
                image: "",
                description: "No description available.",
                episodes: episodes,
            } as unknown as AnimeDetails & { episodes: Episode[] };
        }

        const animeInfo = info.data.animeInfo || {};
        const genres = Array.isArray(animeInfo.Genres) 
            ? animeInfo.Genres.map((g: string | { name: string }) => typeof g === 'string' ? g : g.name) 
            : [];

        const rawStatus = animeInfo.Status || "Unknown";
        const status = rawStatus === "Currently-Airing" ? "Ongoing" : rawStatus;
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recommendations = (info.data as any).recommended_data?.map(transformAnime) || [];

        return {
            ...transformAnime(info.data as unknown as RawAnime),
            genres,
            description: animeInfo.Overview || "No description available.",
            releaseDate: animeInfo.Premiered || animeInfo.Aired || "",
            status: status,
            rating: animeInfo["MAL Score"] ? parseFloat(animeInfo["MAL Score"]) * 10 : undefined,
            studios: animeInfo.Studios ? [animeInfo.Studios.replace(/-/g, ' ')] : [],
            season: animeInfo.Premiered,
            duration: animeInfo.Duration ? parseInt(animeInfo.Duration) : undefined,
            episodes: episodes,
            recommendations: recommendations,
        };
    } catch (error) {
        console.error("Critical error in getAnimeDetails", error);
        return {
            id: id,
            title: { userPreferred: id, english: id, romaji: id },
            image: "",
            description: "An error occurred while loading anime details.",
            episodes: [],
        } as unknown as AnimeDetails & { episodes: Episode[] };
    }
  }

  // Get streaming links
  async getStreamingLinks(episodeId: string, server = "hd-1", category: "sub" | "dub" = "sub"): Promise<StreamingData> {
    // Usage: /api/stream?id=...&server=hd-1&type=sub
    
    type StreamResult = { streamingLink: RawStreamingLink | RawStreamingLink[]; servers?: Server[] };
    let result: StreamResult | undefined;
    try {
        result = await this.fetch<StreamResult>(`/api/stream?id=${episodeId}&server=${server}&type=${category}`, { cache: "no-store"});
    } catch {
        console.warn(`Stream fetch failed for ${server}, trying fallback`);
        result = await this.fetch<StreamResult>(`/api/stream/fallback?id=${episodeId}&server=${server}&type=${category}`, { cache: "no-store"});
    }

    if (!result || !result.streamingLink) {
        throw new Error("No streaming links found");
    }
    
    const linkData = Array.isArray(result.streamingLink) ? result.streamingLink[0] : result.streamingLink;

    if (!linkData || !linkData.link) {
         throw new Error("Invalid streaming data");
    }
    
    return {
        headers: { 
             Referer: "https://megacloud.club/",
             "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" 
        }, 
        sources: [{
            url: linkData.link.file,
            isM3U8: linkData.link.type === 'hls',
            quality: 'auto'
        }],
        subtitles: linkData.tracks?.map((t) => ({
            url: t.file,
            lang: t.label,
            kind: t.kind
        })) || [],
        intro: linkData.intro,
        outro: linkData.outro,
        servers: result.servers
    };
  }

  // --- New Methods for Full Site Integration ---

  // Get Home Data (Spotlight, Trending, etc.)
  async getHomeData(): Promise<HomeData> {
      const data = await this.fetch<{
          spotlights: HomeData['spotlights'];
          trending: RawAnime[];
          topTen: HomeData['topTen'];
          topAiring: RawAnime[];
          mostPopular: RawAnime[];
          mostFavorite: RawAnime[];
          latestCompleted: RawAnime[];
          latestEpisode: RawAnime[];
          topUpcoming?: RawAnime[];
          recentlyAdded?: RawAnime[];
          genres: string[];
      }>('/api/', { cache: 'no-store' });
      return {
          spotlights: data.spotlights || [],
          trending: (data.trending || []).map(transformAnime),
          topTen: data.topTen || { today: [], week: [], month: [] }, 
          topAiring: (data.topAiring || []).map(transformAnime),
          mostPopular: (data.mostPopular || []).map(transformAnime),
          mostFavorite: (data.mostFavorite || []).map(transformAnime),
          latestCompleted: (data.latestCompleted || []).map(transformAnime),
          latestEpisode: (data.latestEpisode || []).map(transformAnime),
          topUpcoming: data.topUpcoming?.map(transformAnime) || [],
          recentlyAdded: data.recentlyAdded?.map(transformAnime) || [],
          genres: data.genres || []
      };
  }

  // Get Schedule
  async getSchedule(date: string): Promise<ScheduleItem[]> {
      return await this.fetch<ScheduleItem[]>(`/api/schedule?date=${date}`, { cache: 'no-store' });
  }

  // Get Characters
  async getCharacters(id: string): Promise<CharacterListResponse> {
      try {
          return await this.fetch<CharacterListResponse>(`/api/character/list/${id}`);
      } catch {
          console.error("Failed to fetch characters for", id);
          return { currentPage: 0, totalPages: 0, data: [] };
      }
  }

  // Get Servers
  async getServers(episodeId: string): Promise<Server[]> {
      try {
          return await this.fetch<Server[]>(`/api/servers/${episodeId}`);
      } catch {
          return [];
      }
  }

  // Get QTip (Hover Info)
  async getQTip(id: string, data_id?: number): Promise<QTipAnime | null> {
      try {
          const queryId = data_id ? data_id.toString() : id;
          const res = await this.fetch<QTipAnime>(`/api/qtip/${queryId}`);
          return res || null;
      } catch (e) {
          console.error(`Failed to fetch QTip for ${id} (data_id: ${data_id})`, e);
          return null;
      }
  }
}

export const animeService = new AnimeService();
