export interface Movie {
  _id: string;
  name: string;
  origin_name: string;
  thumb_url: string;
  poster_url: string;
  slug: string;
  year?: number | string;
  quality: string;
  lang: string;
  episode_current: string;
  modified: {
    time: string;
  } | string;
  category?: string | { id: string; name: string; slug: string }[];
}

export interface MovieDetail extends Movie {
  content: string;
  status: string;
  type: 'series' | 'single' | 'hoathinh' | 'tvshows';
  time: string;
  episode_total: string;
  actor: string[] | string;
  director: string[] | string;
  category: { id: string; name: string; slug: string }[];
  country: { id: string; name: string; slug: string }[];
}

export interface Episode {
  server_name: string;
  server_data: {
    name: string;
    slug: string;
    filename: string;
    link_embed: string;
    link_m3u8: string;
  }[];
}

export interface MovieResponse {
  status: boolean;
  items: Movie[];
  pathImage?: string;
  pagination: {
    totalItems: number;
    totalItemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface MovieDetailResponse {
  status: boolean;
  movie: MovieDetail;
  episodes: Episode[];
}

export interface Genre {
  _id: string;
  name: string;
  slug: string;
}

export interface Country {
  _id: string;
  name: string;
  slug: string;
}
