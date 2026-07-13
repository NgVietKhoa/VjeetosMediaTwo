import { Movie } from '@/types/movie';

const WATCHLIST_KEY = 'vjeetos_watchlist';

export interface WatchlistItem {
  id: string;
  name: string;
  poster: string;
  slug: string;
  addedAt: number;
}

export const watchlistUtil = {
  toggle: (movie: Movie): boolean => {
    if (typeof window === 'undefined') return false;
    const list = watchlistUtil.get();
    const index = list.findIndex(item => item.id === movie._id);
    
    if (index !== -1) {
      const updatedList = list.filter(item => item.id !== movie._id);
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updatedList));
      return false;
    } else {
      const newItem: WatchlistItem = {
        id: movie._id,
        name: movie.name,
        poster: movie.thumb_url,
        slug: movie.slug,
        addedAt: Date.now()
      };
      const updatedList = [newItem, ...list];
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updatedList));
      return true;
    }
  },

  get: (): WatchlistItem[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(WATCHLIST_KEY);
    return data ? JSON.parse(data) : [];
  },

  isInWatchlist: (id: string): boolean => {
    if (typeof window === 'undefined') return false;
    const list = watchlistUtil.get();
    return list.some(item => item.id === id);
  },
};
