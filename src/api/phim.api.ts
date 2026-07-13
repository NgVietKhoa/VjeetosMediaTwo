import {
  MovieResponse,
  MovieDetailResponse,
  Genre,
  Country,
  Movie,
  MovieDetail,
  Episode
} from '@/types/movie';

const PROXY_BASE = '/api/ophim/v1/api';

interface RawTaxonomy {
  id?: string;
  _id?: string;
  name?: string;
  slug?: string;
}

interface RawMovie {
  _id?: string;
  id?: string;
  name?: string;
  origin_name?: string;
  thumb_url?: string;
  poster_url?: string;
  slug?: string;
  year?: string | number;
  quality?: string;
  lang?: string;
  episode_current?: string;
  modified?: { time?: string } | string;
  category?: string | RawTaxonomy[];
  country?: RawTaxonomy[];
  content?: string;
  status?: string;
  type?: 'series' | 'single' | 'hoathinh' | 'tvshows';
  time?: string;
  episode_total?: string;
  actor?: string | string[];
  director?: string | string[];
  episodes?: RawEpisodeServer[];
}

interface RawEpisodeItem {
  name?: string;
  slug?: string;
  filename?: string;
  link_embed?: string;
  link_m3u8?: string;
}

interface RawEpisodeServer {
  server_name?: string;
  server_data?: RawEpisodeItem[];
}

interface RawListPayload {
  status?: string;
  data?: {
    APP_DOMAIN_CDN_IMAGE?: string;
    items?: RawMovie[];
    params?: {
      pagination?: {
        totalItems?: number;
        totalItemsPerPage?: number;
        currentPage?: number;
        totalPages?: number;
      };
    };
  };
}

const INVALID_PERSON = new Set(['', 'null', 'đang cập nhật', 'n/a']);

const getImageUrl = (url: string, cdnDomain: string = 'https://img.ophim.cc/uploads/movies/'): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;

  let baseDomain = cdnDomain;
  if (!baseDomain.endsWith('/uploads/movies') && !baseDomain.endsWith('/uploads/movies/')) {
    if (baseDomain.endsWith('/')) {
      baseDomain = baseDomain.slice(0, -1);
    }
    baseDomain = `${baseDomain}/uploads/movies/`;
  }

  if (!baseDomain.endsWith('/')) {
    baseDomain = `${baseDomain}/`;
  }

  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  return `${baseDomain}${cleanUrl}`;
};

const mapTaxonomy = (items: RawTaxonomy[] | undefined) =>
  (items || []).map((item) => ({
    id: item.id || item.slug || '',
    name: item.name || '',
    slug: item.slug || '',
  }));

const normalizePersonList = (value: string | string[] | undefined): string[] =>
  (Array.isArray(value) ? value : value ? [value] : [])
    .map((person) => String(person).trim())
    .filter((person) => person && !INVALID_PERSON.has(person.toLowerCase()));

const emptyMovieResponse = (page: number = 1): MovieResponse => ({
  status: false,
  items: [],
  pagination: {
    totalItems: 0,
    totalItemsPerPage: 24,
    currentPage: page,
    totalPages: 1,
  },
});

const parseListResponse = (data: RawListPayload, page: number): MovieResponse => {
  if (data.status !== 'success') return emptyMovieResponse(page);

  const cdnDomain = data.data?.APP_DOMAIN_CDN_IMAGE;
  const rawItems = data.data?.items || [];
  const pagination = data.data?.params?.pagination || {
    currentPage: page,
    totalItems: rawItems.length,
    totalItemsPerPage: 24,
  };
  const totalItems = pagination.totalItems || rawItems.length;
  const totalItemsPerPage = pagination.totalItemsPerPage || 24;

  return {
    status: true,
    items: rawItems.map((item) => normalizeMovie(item, cdnDomain)),
    pagination: {
      totalItems,
      totalItemsPerPage,
      currentPage: pagination.currentPage || page,
      totalPages: pagination.totalPages || Math.ceil(totalItems / totalItemsPerPage),
    },
  };
};

const normalizeMovie = (item: RawMovie, cdnDomain?: string): Movie => {
  const imgDomain = cdnDomain || 'https://img.ophim.cc/uploads/movies/';
  return {
    _id: item._id || item.id || item.slug || '',
    name: item.name || '',
    origin_name: item.origin_name || '',
    thumb_url: getImageUrl(item.thumb_url || '', imgDomain),
    poster_url: getImageUrl(item.poster_url || item.thumb_url || '', imgDomain),
    slug: item.slug || '',
    year: item.year || '',
    quality: item.quality || 'HD',
    lang: item.lang || 'Vietsub',
    episode_current: item.episode_current || '',
    modified: (typeof item.modified === 'object' && item.modified?.time) || (typeof item.modified === 'string' && item.modified) || '',
    category: Array.isArray(item.category) ? mapTaxonomy(item.category) : item.category || '',
    country: Array.isArray(item.country) ? mapTaxonomy(item.country) : [],
  };
};

const normalizeMovieDetail = (item: RawMovie, cdnDomain?: string): MovieDetail => {
  const imgDomain = cdnDomain || 'https://img.ophim.cc/uploads/movies/';
  return {
    ...normalizeMovie(item, imgDomain),
    content: item.content || '',
    status: item.status || '',
    type: item.type || 'single',
    time: item.time || '',
    episode_total: item.episode_total || '',
    actor: normalizePersonList(item.actor),
    director: normalizePersonList(item.director),
    category: Array.isArray(item.category) ? mapTaxonomy(item.category) : [],
    country: Array.isArray(item.country) ? mapTaxonomy(item.country) : [],
  };
};

const normalizeEpisodes = (episodes: RawEpisodeServer[]): Episode[] => {
  if (!Array.isArray(episodes)) return [];
  return episodes.map((server) => ({
    server_name: server.server_name || 'VIP',
    server_data: (server.server_data || []).map((item) => ({
      name: item.name || '',
      slug: item.slug || '',
      filename: item.filename || item.name || '',
      link_embed: item.link_embed || '',
      link_m3u8: item.link_m3u8 || '',
    })),
  }));
};

const fetchTaxonomy = async (path: string, label: string): Promise<Genre[]> => {
  try {
    const res = await fetch(`${PROXY_BASE}/${path}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    const items = data.data?.items;
    if (data.status !== 'success' || !Array.isArray(items)) return [];
    return items.map((item: RawTaxonomy) => ({
      _id: item._id || item.slug || '',
      name: item.name || '',
      slug: item.slug || '',
    }));
  } catch (error) {
    console.error(`API Error (${label}):`, error);
    return [];
  }
};

export const phimApi = {
  getNewUpdates: async (page: number = 1): Promise<MovieResponse> => {
    return phimApi.getMovieList('moi', { page });
  },

  getMovieDetail: async (slug: string): Promise<MovieDetailResponse> => {
    try {
      const res = await fetch(`${PROXY_BASE}/phim/${slug}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.status !== 'success' || !data.data?.item) {
        return { status: false } as unknown as MovieDetailResponse;
      }

      const cdnDomain = data.data.APP_DOMAIN_CDN_IMAGE;
      const item = data.data.item as RawMovie;
      return {
        status: true,
        movie: normalizeMovieDetail(item, cdnDomain),
        episodes: normalizeEpisodes(item.episodes || []),
      };
    } catch (error) {
      console.error('API Error (getMovieDetail):', error);
      return { status: false } as unknown as MovieDetailResponse;
    }
  },

  getMovieList: async (
    type: string,
    params: { page?: number; category?: string; country?: string; year?: string } = {}
  ): Promise<MovieResponse> => {
    const page = params.page || 1;
    const queryParams = new URLSearchParams();
    queryParams.set('page', page.toString());
    queryParams.set('limit', '24');

    const slugMap: Record<string, string> = {
      'bo': 'phim-bo',
      'phim-bo': 'phim-bo',
      'le': 'phim-le',
      'phim-le': 'phim-le',
      'hoat-hinh': 'hoat-hinh',
      'tv-shows': 'tv-shows',
      'moi': 'phim-moi',
      'phim-moi': 'phim-moi',
      'phim-chieu-rap': 'phim-chieu-rap',
      'chieu-rap': 'phim-chieu-rap',
    };

    const apiType = slugMap[type] || type;
    const url = `${PROXY_BASE}/danh-sach/${apiType}`;

    if (params.country) queryParams.set('country', params.country);
    if (params.category) queryParams.set('category', params.category);
    if (params.year) queryParams.set('year', params.year);

    try {
      const res = await fetch(`${url}?${queryParams.toString()}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return parseListResponse(data, page);
    } catch (error) {
      console.error('API Error (getMovieList):', error);
      return emptyMovieResponse(page);
    }
  },

  searchMovies: async (keyword: string, page: number = 1): Promise<MovieResponse> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('keyword', keyword);
      queryParams.set('page', page.toString());
      queryParams.set('limit', '24');

      const res = await fetch(`${PROXY_BASE}/tim-kiem?${queryParams.toString()}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return parseListResponse(data, page);
    } catch (error) {
      console.error('API Error (searchMovies):', error);
      return emptyMovieResponse(page);
    }
  },

  getGenres: async (): Promise<Genre[]> => fetchTaxonomy('the-loai', 'getGenres'),

  getCountries: async (): Promise<Country[]> => fetchTaxonomy('quoc-gia', 'getCountries'),
};
