import { Movie } from '@/types/movie';

const HISTORY_KEY = 'vjeetos_watch_history';
const MAX_HISTORY = 20;

export interface SavedMovie {
  id: string;
  name: string;
  poster: string;
  slug: string;
}

export interface HistoryItem extends SavedMovie {
  lastTreated: number;
}

export const historyUtil = {
  add: (movie: Movie) => {
    if (typeof window === 'undefined') return;
    const history = historyUtil.get();
    const newItem: HistoryItem = {
      id: movie._id,
      name: movie.name,
      poster: movie.thumb_url,
      slug: movie.slug,
      lastTreated: Date.now()
    };

    const filteredHistory = history.filter(item => item.id !== movie._id);
    const updatedHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  },

  get: (): HistoryItem[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  },
};
