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

interface RawCategory {
  id?: string;
  name?: string;
  slug?: string;
}

interface RawCountry {
  id?: string;
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
  category?: string | RawCategory[];
  country?: RawCountry[];
  content?: string;
  status?: string;
  type?: 'series' | 'single' | 'hoathinh' | 'tvshows';
  time?: string;
  episode_total?: string;
  actor?: string | string[];
  director?: string | string[];
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
    category: Array.isArray(item.category)
      ? item.category.map((c: RawCategory) => ({
          id: c.id || c.slug || '',
          name: c.name || '',
          slug: c.slug || '',
        }))
      : item.category || '',
  };
};

const normalizeMovieDetail = (item: RawMovie, cdnDomain?: string): MovieDetail => {
  const imgDomain = cdnDomain || 'https://img.ophim.cc/uploads/movies/';
  const categories = Array.isArray(item.category)
    ? item.category.map((c: RawCategory) => ({
        id: c.id || c.slug || '',
        name: c.name || '',
        slug: c.slug || '',
      }))
    : [];

  const countries = Array.isArray(item.country)
    ? item.country.map((c: RawCountry) => ({
        id: c.id || c.slug || '',
        name: c.name || '',
        slug: c.slug || '',
      }))
    : [];

  return {
    ...normalizeMovie(item, imgDomain),
    content: item.content || '',
    status: item.status || '',
    type: item.type || 'single',
    time: item.time || '',
    episode_total: item.episode_total || '',
    actor: (Array.isArray(item.actor) ? item.actor : (item.actor ? [item.actor] : []))
      .map((act: unknown) => String(act).trim())
      .filter((act: string) => act && act !== '' && act.toLowerCase() !== 'null' && act.toLowerCase() !== 'đang cập nhật' && act.toLowerCase() !== 'n/a'),
    director: (Array.isArray(item.director) ? item.director : (item.director ? [item.director] : []))
      .map((dir: unknown) => String(dir).trim())
      .filter((dir: string) => dir && dir !== '' && dir.toLowerCase() !== 'null' && dir.toLowerCase() !== 'đang cập nhật' && dir.toLowerCase() !== 'n/a'),
    category: categories,
    country: countries,
  };
};

const normalizeEpisodes = (episodes: RawEpisodeServer[]): Episode[] => {
  if (!Array.isArray(episodes)) return [];
  return episodes.map((server: RawEpisodeServer) => ({
    server_name: server.server_name || 'VIP',
    server_data: (server.server_data || []).map((item: RawEpisodeItem) => ({
      name: item.name || '',
      slug: item.slug || '',
      filename: item.filename || item.name || '',
      link_embed: item.link_embed || '',
      link_m3u8: item.link_m3u8 || '',
    })),
  }));
};

export const phimApi = {
  getNewUpdates: async (page: number = 1): Promise<MovieResponse> => {
    try {
      const res = await fetch(`${PROXY_BASE}/home`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.status !== 'success') return { status: false, items: [], pagination: { totalItems: 0, totalItemsPerPage: 24, currentPage: 1, totalPages: 1 } };
      
      const cdnDomain = data.data.APP_DOMAIN_CDN_IMAGE;
      const rawItems = (data.data.items as RawMovie[]) || [];
      const pagination = data.data.params?.pagination || {
        currentPage: page,
        totalItems: rawItems.length,
        totalItemsPerPage: 24,
      };

      return {
        status: true,
        items: rawItems.map((item: RawMovie) => normalizeMovie(item, cdnDomain)),
        pagination: {
          totalItems: pagination.totalItems || rawItems.length,
          totalItemsPerPage: pagination.totalItemsPerPage || 24,
          currentPage: pagination.currentPage || page,
          totalPages: Math.ceil((pagination.totalItems || rawItems.length) / (pagination.totalItemsPerPage || 24)),
        },
      };
    } catch (error) {
      console.error('API Error (getNewUpdates):', error);
      return { status: false, items: [], pagination: { totalItems: 0, totalItemsPerPage: 24, currentPage: page, totalPages: 1 } };
    }
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
      return {
        status: true,
        movie: normalizeMovieDetail(data.data.item as RawMovie, cdnDomain),
        episodes: normalizeEpisodes((data.data.item.episodes as RawEpisodeServer[]) || []),
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
    let url = '';
    const queryParams = new URLSearchParams();
    queryParams.set('page', page.toString());
    queryParams.set('limit', '24');

    if (params.category) {
      url = `${PROXY_BASE}/the-loai/${params.category}`;
    } else if (params.country) {
      url = `${PROXY_BASE}/quoc-gia/${params.country}`;
    } else if (params.year) {
      url = `${PROXY_BASE}/nam-phat-hanh/${params.year}`;
    } else {
      const slugMap: Record<string, string> = {
        'bo': 'phim-bo',
        'le': 'phim-le',
        'hoat-hinh': 'hoat-hinh',
        'tv-shows': 'tv-shows',
        'moi': 'phim-moi',
      };
      const apiType = slugMap[type] || type;
      url = `${PROXY_BASE}/danh-sach/${apiType}`;
    }

    try {
      const res = await fetch(`${url}?${queryParams.toString()}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.status !== 'success') return { status: false, items: [], pagination: { totalItems: 0, totalItemsPerPage: 24, currentPage: page, totalPages: 1 } };

      const cdnDomain = data.data.APP_DOMAIN_CDN_IMAGE;
      const rawItems = (data.data.items as RawMovie[]) || [];
      const pagination = data.data.params?.pagination || {
        currentPage: page,
        totalItems: rawItems.length,
        totalItemsPerPage: 24,
      };

      return {
        status: true,
        items: rawItems.map((item: RawMovie) => normalizeMovie(item, cdnDomain)),
        pagination: {
          totalItems: pagination.totalItems || rawItems.length,
          totalItemsPerPage: pagination.totalItemsPerPage || 24,
          currentPage: pagination.currentPage || page,
          totalPages: pagination.totalPages || Math.ceil((pagination.totalItems || rawItems.length) / (pagination.totalItemsPerPage || 24)),
        },
      };
    } catch (error) {
      console.error('API Error (getMovieList):', error);
      return { status: false, items: [], pagination: { totalItems: 0, totalItemsPerPage: 24, currentPage: page, totalPages: 1 } };
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
      if (data.status !== 'success') return { status: false, items: [], pagination: { totalItems: 0, totalItemsPerPage: 24, currentPage: page, totalPages: 1 } };

      const cdnDomain = data.data.APP_DOMAIN_CDN_IMAGE;
      const rawItems = (data.data.items as RawMovie[]) || [];
      const pagination = data.data.params?.pagination || {
        currentPage: page,
        totalItems: rawItems.length,
        totalItemsPerPage: 24,
      };

      return {
        status: true,
        items: rawItems.map((item: RawMovie) => normalizeMovie(item, cdnDomain)),
        pagination: {
          totalItems: pagination.totalItems || rawItems.length,
          totalItemsPerPage: pagination.totalItemsPerPage || 24,
          currentPage: pagination.currentPage || page,
          totalPages: pagination.totalPages || Math.ceil((pagination.totalItems || rawItems.length) / (pagination.totalItemsPerPage || 24)),
        },
      };
    } catch (error) {
      console.error('API Error (searchMovies):', error);
      return { status: false, items: [], pagination: { totalItems: 0, totalItemsPerPage: 24, currentPage: page, totalPages: 1 } };
    }
  },

  getGenres: async (): Promise<Genre[]> => {
    try {
      const res = await fetch(`${PROXY_BASE}/the-loai`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const items = data.data?.items;
      if (data.status !== 'success' || !Array.isArray(items)) return [];
      return items.map((g: { _id?: string; slug?: string; name?: string }) => ({
        _id: g._id || g.slug || '',
        name: g.name || '',
        slug: g.slug || '',
      }));
    } catch (error) {
      console.error('API Error (getGenres):', error);
      return [];
    }
  },

  getCountries: async (): Promise<Country[]> => {
    try {
      const res = await fetch(`${PROXY_BASE}/quoc-gia`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const items = data.data?.items;
      if (data.status !== 'success' || !Array.isArray(items)) return [];
      return items.map((c: { _id?: string; slug?: string; name?: string }) => ({
        _id: c._id || c.slug || '',
        name: c.name || '',
        slug: c.slug || '',
      }));
    } catch (error) {
      console.error('API Error (getCountries):', error);
      return [];
    }
  },
};
