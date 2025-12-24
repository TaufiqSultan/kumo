

// API Wrapper
export interface ApiResponse<T> {
  success: boolean;
  results: T;
}

export interface Anime {
  id: string;
  data_id?: number;
  title: {
      romaji?: string;
      english?: string;
      native?: string;
      userPreferred: string;
  };
  image: string; // Mapped from poster
  poster?: string; // Kept for reference
  banner?: string;
  description?: string;
  genres?: string[]; // Restored
  rating?: number;   // Restored
  status?: string;   // Restored
  releaseDate?: number | string; // Restored
  tvInfo?: {
    showType?: string;
    duration?: string;
    sub?: number;
    dub?: number;
    eps?: number;
    quality?: string;
  };
  adultContent?: boolean;
  type?: string; 
}

export interface Episode {
  id: string;
  number: number; 
  title?: string;
  japanese_title?: string;
  image?: string;
  description?: string; // Added missing field
  isFiller?: boolean;
}

export interface RawEpisode {
    id: string;
    episode_no: number;
    title?: string;
    japanese_title?: string;
    filler?: boolean;
}

export interface RawAnime {
    id: string;
    title?: string;
    name?: string;
    poster: string;
    description?: string;
    tvInfo?: {
        showType?: string;
        duration?: string;
        sub?: number;
        dub?: number;
        eps?: number;
        quality?: string;
        releaseDate?: string;
    };
}

export interface RawAnimeDetailsResponse {
    data: {
        id: string;
        title: string;
        japanese_title: string;
        poster: string;
        animeInfo: {
            Overview: string;
            Status: string;
            Genres: (string | { name: string })[]; 
            Studios?: string;
            Duration?: string;
            Aired?: string;
            Premiered?: string;
            "MAL Score"?: string;
        };
        seasons?: { id: string; name: string }[];
    }
}

// The app expects this flattened structure
export interface AnimeDetails extends Anime {
  episodes: Episode[];
  recommendations?: Anime[];
  studios?: string[];
  duration?: number;
  season?: string;
}

// Raw API Response Types
export interface RawStreamTrack {
  file: string;
  label: string;
  kind: string;
  default?: boolean;
}

export interface RawStreamingSource {
  file: string; 
  type: string; 
}

export interface RawStreamingLink {
      id: number;
      type: string; // 'sub' | 'dub'
      link: RawStreamingSource;
      tracks?: RawStreamTrack[];
      intro?: { start: number; end: number };
      outro?: { start: number; end: number };
      server: string;
}

export interface RawStreamingResponse {
  success: boolean;
  results: {
    streamingLink: RawStreamingLink | RawStreamingLink[];
    servers?: Server[];
  };
}

// Mapped Types for Frontend (VideoPlayer compatibility)
export interface Subtitle {
  url: string;
  lang: string;
  kind?: string;
}

export interface StreamingSource {
  url: string;
  isM3U8: boolean;
  quality: string;
}

export interface StreamingData {
  headers?: {
    Referer: string;
    [key: string]: string;
  };
  sources: StreamingSource[];
  subtitles: Subtitle[];
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
  servers?: Server[];
}

// Helper types for different list structures
export interface TopTenItem {
    id: string;
    number: number;
    name: string;
    poster: string;
    tvInfo: {
        eps?: number;
        showType?: string;
    };
}

export interface SearchResults {
  currentPage?: number;
  hasNextPage?: boolean;
  totalPages?: number;
  results: Anime[]; 
}


// Home Page Data Types
export interface SpotlightAnime {
  id: string;
  data_id: number;
  poster: string;
  title: string;
  japanese_title: string;
  description: string;
  tvInfo: {
    showType: string;
    duration: string;
    releaseDate: string;
    quality: string;
    episodeInfo?: { sub?: number; dub?: number };
  };
}

export interface HomeData {
  spotlights: SpotlightAnime[];
  trending: Anime[];
  topTen: {
      today: TopTenItem[];
      week: TopTenItem[];
      month: TopTenItem[];
  };
  topAiring: Anime[];
  mostPopular: Anime[];
  mostFavorite: Anime[];
  latestCompleted: Anime[];
  latestEpisode: Anime[];
  topUpcoming: Anime[];
  recentlyAdded: Anime[];
  genres: string[];
}

// Schedule Types
export interface ScheduleItem {
  id: string;
  data_id: number;
  title: string;
  japanese_title: string;
  releaseDate: string;
  time: string;
  episode_no: number;
}

// Character & Voice Actor Types
export interface VoiceActor {
  id: string;
  name: string;
  poster: string;
  language?: string;
}

export interface Character {
  id: string;
  name: string;
  poster: string;
  cast: string; // "Main" or "Supporting"
}

export interface CharacterEdge {
  character: Character;
  voiceActors: VoiceActor[];
}

export interface CharacterListResponse {
  currentPage: number;
  totalPages: number;
  data: CharacterEdge[];
}

// Server Types
export interface Server {
  type: string;
  data_id: number;
  server_id: number;
  serverName: string;
}

export interface QTipAnime {
  title: string;
  japaneseTitle?: string;
  rating?: string;
  quality?: string;
  subCount?: number;
  dubCount?: number;
  episodeCount?: number | string;
  type?: string;
  description: string;
  Synonyms?: string;
  airedDate?: string;
  status?: string;
  genres: string[];
}
