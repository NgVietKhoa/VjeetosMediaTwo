'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import MovieCard from "@/components/movie/MovieCard";
import HeroBanner from "@/components/home/HeroBanner";
import SprocketDivider from "@/components/common/SprocketDivider";
import { phimApi } from "@/api/phim.api";
import { Movie } from "@/types/movie";
import { historyUtil, HistoryItem } from "@/utils/history";
import { watchlistUtil, WatchlistItem } from "@/utils/watchlist";

const fixLegacyImgUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('img.ophim.live/') && !url.includes('/uploads/movies/')) {
    return url.replace('img.ophim.live/', 'img.ophim.live/uploads/movies/');
  }
  return url;
};

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  const historyRef = useRef<HTMLDivElement>(null);
  const watchlistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load initial updates
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const res = await phimApi.getNewUpdates(1);
        if (res?.items) {
          setMovies(res.items);
          setHasMore(1 < res.pagination.totalPages);
        }
      } catch (error) {
        console.error("Failed to load initial updates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();

    // Load local history & watchlist asynchronously to avoid synchronous setState in effect warnings
    const timer = setTimeout(() => {
      setHistory(historyUtil.get());
      setWatchlist(watchlistUtil.get());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const res = await phimApi.getNewUpdates(nextPage);
      if (res?.items) {
        setMovies((prev) => {
          const combined = [...prev, ...res.items];
          // De-duplicate items
          return Array.from(new Map(combined.map((m) => [m._id, m])).values());
        });
        setPage(nextPage);
        setHasMore(nextPage < res.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to load more movies:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right"
  ) => {
    if (!ref.current) return;
    const { clientWidth } = ref.current;
    ref.current.scrollBy({
      left: direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <div className="pb-16">
      {/* Hero Banner with Ken Burns Backdrop */}
      <HeroBanner movies={movies} loading={isLoading} />

      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6">
        {/* Continue Watching Section */}
        {history.length > 0 && (
          <>
            <PersonalCarouselSection
              title="Tiếp tục xem"
              scrollRef={historyRef}
              onScrollLeft={() => handleScroll(historyRef, "left")}
              onScrollRight={() => handleScroll(historyRef, "right")}
            >
              {history.map((item) => (
                <Link
                  key={item.id}
                  href={`/phim/chi-tiet/${item.slug}`}
                  className="flex-shrink-0 w-[120px] sm:w-[150px] group relative block"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-border group-hover:border-accent-gold transition-all duration-180">
                    <img
                      src={fixLegacyImgUrl(item.poster) || '/placeholder.png'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-bg-void/40 opacity-0 group-hover:opacity-100 transition-opacity duration-180 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-accent-gold flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-180">
                        <Play size={16} className="fill-bg-void text-bg-void translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-semibold truncate text-text-secondary group-hover:text-accent-gold transition-colors leading-snug">
                    {item.name}
                  </p>
                </Link>
              ))}
            </PersonalCarouselSection>
            <SprocketDivider />
          </>
        )}

        {/* Watchlist Section */}
        {watchlist.length > 0 && (
          <>
            <PersonalCarouselSection
              title="Danh sách yêu thích"
              scrollRef={watchlistRef}
              onScrollLeft={() => handleScroll(watchlistRef, "left")}
              onScrollRight={() => handleScroll(watchlistRef, "right")}
            >
              {watchlist.map((item) => (
                <Link
                  key={item.id}
                  href={`/phim/chi-tiet/${item.slug}`}
                  className="flex-shrink-0 w-[120px] sm:w-[150px] group relative block"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-border group-hover:border-accent-gold transition-all duration-180">
                    <img
                      src={fixLegacyImgUrl(item.poster) || '/placeholder.png'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-bg-void/40 opacity-0 group-hover:opacity-100 transition-opacity duration-180 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-accent-gold flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-180">
                        <Play size={16} className="fill-bg-void text-bg-void translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-semibold truncate text-text-secondary group-hover:text-accent-gold transition-colors leading-snug">
                    {item.name}
                  </p>
                </Link>
              ))}
            </PersonalCarouselSection>
            <SprocketDivider />
          </>
        )}

        {/* Topics Section */}
        <section className="py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-6 w-1 rounded-full bg-accent-gold" />
            <h2 className="text-lg font-bold uppercase tracking-tight text-text-primary">
              Bạn đang quan tâm gì?
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {/* Card 1 */}
            <Link
              href="/phim/moi?category=tam-ly&title=Chữa+lành"
              className="group relative aspect-[2.1/1] lg:aspect-[1.5/1] flex flex-col justify-between p-5 bg-gradient-to-br from-[#e05697] to-[#c13c7a] rounded-tl-[32px] rounded-br-[32px] rounded-tr-[8px] rounded-bl-[8px] shadow-lg hover:shadow-pink-500/10 hover:scale-[1.03] transition-all duration-200 cursor-pointer"
            >
              <span className="text-sm sm:text-base font-bold text-white leading-tight">Chữa lành</span>
              <span className="text-[10px] font-semibold text-white/95 flex items-center gap-1">
                Xem chủ đề <span className="transition-transform group-hover:translate-x-1">›</span>
              </span>
            </Link>
            {/* Card 2 */}
            <Link
              href="/tim-kiem?q=Marvel"
              className="group relative aspect-[2.1/1] lg:aspect-[1.5/1] flex flex-col justify-between p-5 bg-gradient-to-br from-[#1e4ed8] to-[#1d40af] rounded-tl-[32px] rounded-br-[32px] rounded-tr-[8px] rounded-bl-[8px] shadow-lg hover:shadow-blue-500/10 hover:scale-[1.03] transition-all duration-200 cursor-pointer"
            >
              <span className="text-sm sm:text-base font-bold text-white leading-tight">Marvel</span>
              <span className="text-[10px] font-semibold text-white/95 flex items-center gap-1">
                Xem chủ đề <span className="transition-transform group-hover:translate-x-1">›</span>
              </span>
            </Link>
            {/* Card 3 */}
            <Link
              href="/phim/hoat-hinh?title=Kho+Tàng+Anime+Mới..."
              className="group relative aspect-[2.1/1] lg:aspect-[1.5/1] flex flex-col justify-between p-5 bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] rounded-tl-[32px] rounded-br-[32px] rounded-tr-[8px] rounded-bl-[8px] shadow-lg hover:shadow-violet-500/10 hover:scale-[1.03] transition-all duration-200 cursor-pointer"
            >
              <span className="text-sm sm:text-base font-bold text-white leading-tight">Kho Tàng Anime Mới...</span>
              <span className="text-[10px] font-semibold text-white/95 flex items-center gap-1">
                Xem chủ đề <span className="transition-transform group-hover:translate-x-1">›</span>
              </span>
            </Link>
            {/* Card 4 */}
            <Link
              href="/phim/le?title=Top+10+phim+lẻ+hôm+nay"
              className="group relative aspect-[2.1/1] lg:aspect-[1.5/1] flex flex-col justify-between p-5 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-tl-[32px] rounded-br-[32px] rounded-tr-[8px] rounded-bl-[8px] shadow-lg hover:shadow-amber-500/10 hover:scale-[1.03] transition-all duration-200 cursor-pointer"
            >
              <span className="text-sm sm:text-base font-bold text-white leading-tight">Top 10 phim lẻ hôm nay</span>
              <span className="text-[10px] font-semibold text-white/95 flex items-center gap-1">
                Xem chủ đề <span className="transition-transform group-hover:translate-x-1">›</span>
              </span>
            </Link>
            {/* Card 5 */}
            <Link
              href="/phim/moi?category=co-trang&title=Cổ+Trang"
              className="group relative aspect-[2.1/1] lg:aspect-[1.5/1] flex flex-col justify-between p-5 bg-gradient-to-br from-[#b91c1c] to-[#991b1b] rounded-tl-[32px] rounded-br-[32px] rounded-tr-[8px] rounded-bl-[8px] shadow-lg hover:shadow-red-500/10 hover:scale-[1.03] transition-all duration-200 cursor-pointer"
            >
              <span className="text-sm sm:text-base font-bold text-white leading-tight">Cổ Trang</span>
              <span className="text-[10px] font-semibold text-white/95 flex items-center gap-1">
                Xem chủ đề <span className="transition-transform group-hover:translate-x-1">›</span>
              </span>
            </Link>
            {/* Card 6 */}
            <Link
              href="/phim/le?title=Phim+Điện+Ảnh+Mới..."
              className="group relative aspect-[2.1/1] lg:aspect-[1.5/1] flex flex-col justify-between p-5 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-tl-[32px] rounded-br-[32px] rounded-tr-[8px] rounded-bl-[8px] shadow-lg hover:shadow-emerald-500/10 hover:scale-[1.03] transition-all duration-200 cursor-pointer"
            >
              <span className="text-sm sm:text-base font-bold text-white leading-tight">Phim Điện Ảnh Mới...</span>
              <span className="text-[10px] font-semibold text-white/95 flex items-center gap-1">
                Xem chủ đề <span className="transition-transform group-hover:translate-x-1">›</span>
              </span>
            </Link>
          </div>
        </section>

        <SprocketDivider />

        {/* New Updates Section */}
        <section className="pt-8">
          <div className="flex items-center justify-between border-b border-border pb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-accent-gold" />
              <div className="flex flex-col gap-0.5">
                <h2 className="text-lg font-bold uppercase tracking-tight text-text-primary">
                  Phim mới cập nhật
                </h2>
                <p className="text-text-muted text-xs hidden sm:block">
                  Những bộ phim mới cập nhật gần đây nhất
                </p>
              </div>
            </div>
            <Link
              href="/phim/moi"
              className="group flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-accent-gold transition-colors shrink-0"
            >
              Xem tất cả{" "}
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <div className="pt-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-x-4 gap-y-6">
              {movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}

              {isLoading &&
                Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[2/3] bg-bg-elevated rounded-lg border border-border mb-3" />
                    <div className="h-3 bg-bg-elevated rounded-full w-3/4 mb-2" />
                    <div className="h-2 bg-bg-elevated rounded-full w-1/2" />
                  </div>
                ))}
            </div>

            {movies.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-text-secondary text-sm">Không tìm thấy phim mới nào.</p>
              </div>
            )}

            {hasMore && movies.length > 0 && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="px-8 py-3 rounded-lg bg-bg-surface border border-border hover:border-accent-gold hover:text-accent-gold text-text-primary text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center gap-2.5 cursor-pointer"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    "Tải thêm phim"
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <div className={`border-2 border-current border-t-transparent rounded-full animate-spin ${className}`} />
  );
}

const PersonalCarouselSection = ({
  title,
  scrollRef,
  onScrollLeft,
  onScrollRight,
  children,
}: {
  title: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScrollLeft: () => void;
  onScrollRight: () => void;
  children: React.ReactNode;
}) => (
  <section className="py-6">
    <div className="flex items-center gap-3.5 mb-5">
      <div className="h-6 w-1 rounded-full bg-accent-gold" />
      <h2 className="text-sm font-semibold tracking-tight uppercase text-text-secondary">{title}</h2>
    </div>
    <div className="relative group/carousel">
      {/* Scroll Controls */}
      <button
        onClick={onScrollLeft}
        className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-bg-surface border border-border text-text-primary flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:border-accent-gold cursor-pointer"
      >
        ‹
      </button>
      <button
        onClick={onScrollRight}
        className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-bg-surface border border-border text-text-primary flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:border-accent-gold cursor-pointer"
      >
        ›
      </button>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth"
      >
        {children}
      </div>
    </div>
  </section>
);
