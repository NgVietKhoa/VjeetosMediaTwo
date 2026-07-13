'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Play, ChevronLeft, ChevronRight, Heart, Info, Loader2 } from "lucide-react";
import MovieCard from "@/components/movie/MovieCard";
import HeroBanner from "@/components/home/HeroBanner";
import Top10Carousel from "@/components/home/Top10Carousel";
import SprocketDivider from "@/components/common/SprocketDivider";
import LazySection, { SectionSkeleton } from "@/components/common/LazySection";
import { phimApi } from "@/api/phim.api";
import { Movie, MovieDetail } from "@/types/movie";
import { historyUtil, HistoryItem, SavedMovie } from "@/utils/history";
import { watchlistUtil, WatchlistItem } from "@/utils/watchlist";
import { scrollContainerByOneCard } from "@/utils/scroll";

const fixLegacyImgUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('img.ophim.live/') && !url.includes('/uploads/movies/')) {
    return url.replace('img.ophim.live/', 'img.ophim.live/uploads/movies/');
  }
  return url;
};

const TOPIC_CARDS = [
  { href: "/phim/moi?category=tam-ly&title=Chữa+lành", title: "Chữa lành", gradient: "from-[#e05697] to-[#c13c7a]", shadow: "hover:shadow-pink-500/10" },
  { href: "/tim-kiem?q=Marvel", title: "Marvel", gradient: "from-[#1e4ed8] to-[#1d40af]", shadow: "hover:shadow-blue-500/10" },
  { href: "/phim/hoat-hinh?title=Kho+Tàng+Anime+Mới...", title: "Kho Tàng<br />Anime Mới...", gradient: "from-[#7c3aed] to-[#6d28d9]", shadow: "hover:shadow-violet-500/10" },
  { href: "/phim/le?title=Top+10+phim+lẻ+hôm+nay", title: "Top 10 phim<br />lẻ hôm nay", gradient: "from-[#f59e0b] to-[#d97706]", shadow: "hover:shadow-amber-500/10" },
  { href: "/phim/moi?category=co-trang&title=Cổ+Trang", title: "Cổ Trang", gradient: "from-[#b91c1c] to-[#991b1b]", shadow: "hover:shadow-red-500/10" },
  { href: "/phim/le?title=Phim+Điện+Ảnh+Mới...", title: "Phim Điện<br />Ảnh Mới...", gradient: "from-[#10b981] to-[#059669]", shadow: "hover:shadow-emerald-500/10" },
];

const PersonalPosterCard = ({ item }: { item: SavedMovie }) => (
  <Link
    href={`/phim/chi-tiet/${item.slug}`}
    className="flex-shrink-0 w-[120px] sm:w-[150px] group relative block"
  >
    <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-border group-hover:border-accent-gold transition-all duration-180">
      <img
        src={fixLegacyImgUrl(item.poster) || '/placeholder.png'}
        alt={item.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
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
);

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  const [koreanMovies, setKoreanMovies] = useState<Movie[]>([]);
  const [chineseMovies, setChineseMovies] = useState<Movie[]>([]);
  const [usukMovies, setUsukMovies] = useState<Movie[]>([]);
  const [topSeries, setTopSeries] = useState<Movie[]>([]);
  const [cinemaMovies, setCinemaMovies] = useState<Movie[]>([]);
  const [topSingleMovies, setTopSingleMovies] = useState<Movie[]>([]);
  const [animeMovies, setAnimeMovies] = useState<Movie[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<Movie | null>(null);
  const [selectedAnimeDetail, setSelectedAnimeDetail] = useState<MovieDetail | null>(null);

  const historyRef = useRef<HTMLDivElement>(null);
  const watchlistRef = useRef<HTMLDivElement>(null);
  const cinemaMoviesRef = useRef<HTMLDivElement>(null);

  const [topSeriesReady, setTopSeriesReady] = useState(false);
  const [topSingleReady, setTopSingleReady] = useState(false);
  const [animeReady, setAnimeReady] = useState(false);
  const [regionalReady, setRegionalReady] = useState(false);

  // Only load hero / "phim mới" on first paint — other sections wait for scroll
  useEffect(() => {
    const fetchHero = async () => {
      setIsLoading(true);
      try {
        const res = await phimApi.getNewUpdates(1);
        if (res?.items) {
          setMovies(res.items);
          setHasMore(1 < res.pagination.totalPages);
        }
      } catch (error) {
        console.error("Failed to load hero updates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHero();

    const timer = setTimeout(() => {
      setHistory(historyUtil.get());
      setWatchlist(watchlistUtil.get());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const loadTopSeriesBlock = useCallback(async () => {
    if (topSeriesReady) return;
    try {
      const [topSeriesRes, cinemaRes] = await Promise.all([
        phimApi.getMovieList("bo", { page: 1 }).catch(() => null),
        phimApi.getMovieList("phim-chieu-rap", { page: 1 }).catch(() => null),
      ]);
      if (topSeriesRes?.items) setTopSeries(topSeriesRes.items.slice(0, 10));
      if (cinemaRes?.items) setCinemaMovies(cinemaRes.items);
    } catch (error) {
      console.error("Failed to load top series block:", error);
    } finally {
      setTopSeriesReady(true);
    }
  }, [topSeriesReady]);

  const loadTopSingleBlock = useCallback(async () => {
    if (topSingleReady) return;
    try {
      const topSingleRes = await phimApi.getMovieList("le", { page: 1 }).catch(() => null);
      if (topSingleRes?.items) setTopSingleMovies(topSingleRes.items.slice(0, 10));
    } catch (error) {
      console.error("Failed to load top single block:", error);
    } finally {
      setTopSingleReady(true);
    }
  }, [topSingleReady]);

  const loadAnimeBlock = useCallback(async () => {
    if (animeReady) return;
    try {
      const animeRes = await phimApi
        .getMovieList("hoat-hinh", { country: "nhat-ban", page: 1 })
        .catch(() => null);
      if (animeRes?.items && animeRes.items.length > 0) {
        const list = animeRes.items.slice(0, 14);
        setAnimeMovies(list);
        setSelectedAnime(list[0]);
      }
    } catch (error) {
      console.error("Failed to load anime block:", error);
    } finally {
      setAnimeReady(true);
    }
  }, [animeReady]);

  const loadRegionalBlock = useCallback(async () => {
    if (regionalReady) return;
    try {
      const [krRes, cnRes, usRes] = await Promise.all([
        phimApi.getMovieList("moi", { country: "han-quoc", page: 1 }).catch(() => null),
        phimApi.getMovieList("moi", { country: "trung-quoc", page: 1 }).catch(() => null),
        phimApi.getMovieList("moi", { country: "au-my", page: 1 }).catch(() => null),
      ]);
      if (krRes?.items) setKoreanMovies(krRes.items);
      if (cnRes?.items) setChineseMovies(cnRes.items);
      if (usRes?.items) setUsukMovies(usRes.items);
    } catch (error) {
      console.error("Failed to load regional block:", error);
    } finally {
      setRegionalReady(true);
    }
  }, [regionalReady]);

  // Fetch detailed info of selected Anime
  useEffect(() => {
    if (!selectedAnime) {
      const timer = setTimeout(() => {
        setSelectedAnimeDetail(null);
      }, 0);
      return () => clearTimeout(timer);
    }
    const fetchAnimeDetail = async () => {
      try {
        const res = await phimApi.getMovieDetail(selectedAnime.slug);
        if (res?.movie) {
          setSelectedAnimeDetail(res.movie);
        }
      } catch (error) {
        console.error("Failed to fetch selected anime detail:", error);
      }
    };
    fetchAnimeDetail();
  }, [selectedAnime]);

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
              onScrollLeft={() => scrollContainerByOneCard(historyRef.current, "left")}
              onScrollRight={() => scrollContainerByOneCard(historyRef.current, "right")}
            >
              {history.map((item) => (
                <PersonalPosterCard key={item.id} item={item} />
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
              onScrollLeft={() => scrollContainerByOneCard(watchlistRef.current, "left")}
              onScrollRight={() => scrollContainerByOneCard(watchlistRef.current, "right")}
            >
              {watchlist.map((item) => (
                <PersonalPosterCard key={item.id} item={item} />
              ))}
            </PersonalCarouselSection>
            <SprocketDivider />
          </>
        )}

        {/* Topics Section */}
        <section className="py-6">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              Bạn đang quan tâm gì?
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {TOPIC_CARDS.map((topic) => (
              <Link
                key={topic.href}
                href={topic.href}
                className={`group relative aspect-[2.1/1] lg:aspect-[1.5/1] flex flex-col justify-between p-5 bg-gradient-to-br ${topic.gradient} rounded-tl-[32px] rounded-br-[32px] rounded-tr-[8px] rounded-bl-[8px] shadow-lg ${topic.shadow} hover:scale-[1.03] transition-all duration-200 cursor-pointer`}
              >
                <span
                  className="text-[17px] sm:text-[19px] lg:text-[21px] font-bold text-white leading-tight"
                  dangerouslySetInnerHTML={{ __html: topic.title }}
                />
                <span className="text-[11px] font-medium text-white/90 flex items-center gap-1">
                  Xem chủ đề <span className="transition-transform group-hover:translate-x-0.5">&gt;</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Top 10 Series Section — load when scrolled near */}
        <LazySection minHeight={420} onVisible={loadTopSeriesBlock}>
          {!topSeriesReady ? (
            <SectionSkeleton height={420} />
          ) : topSeries.length > 0 ? (
          <>
            <Top10Carousel
              title="Top 10 phim bộ hôm nay"
              movies={topSeries}
              metaLine={(movie) => `T16 · ${movie.lang} · ${movie.episode_current || 'Full'}`}
            />
            <SprocketDivider />

            {/* Cinema Movies Section */}
            {cinemaMovies.length > 0 && (
              <>
                <section className="py-8">
                  <div className="mb-6 flex items-center gap-3">
                    <Link
                      href="/phim/chieu-rap?title=Phim+Chiếu+Rạp"
                      className="group flex items-center gap-2 hover:text-accent-gold transition-colors"
                    >
                      <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight group-hover:text-accent-gold transition-colors">
                        Mãn Nhãn với Phim Chiếu Rạp
                      </h2>
                      <div className="w-5 h-5 rounded-full border border-border/80 flex items-center justify-center text-text-primary group-hover:border-accent-gold group-hover:text-accent-gold transition-colors">
                        <ChevronRight size={12} className="translate-x-px" />
                      </div>
                    </Link>
                  </div>
                  <div className="relative group/cinema w-full">
                    {/* Scroll Left Button */}
                    <button
                      onClick={() => scrollContainerByOneCard(cinemaMoviesRef.current, 'left')}
                      className="absolute left-3 top-[78px] sm:top-[90px] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-bg-surface/90 border border-border/80 text-text-primary flex items-center justify-center opacity-0 group-hover/cinema:opacity-100 transition-opacity hover:border-accent-gold cursor-pointer shadow-lg"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    {/* Scroll Right Button */}
                    <button
                      onClick={() => scrollContainerByOneCard(cinemaMoviesRef.current, 'right')}
                      className="absolute right-3 top-[78px] sm:top-[90px] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-bg-surface/90 border border-border/80 text-text-primary flex items-center justify-center opacity-0 group-hover/cinema:opacity-100 transition-opacity hover:border-accent-gold cursor-pointer shadow-lg"
                    >
                      <ChevronRight size={20} />
                    </button>

                    {/* Scroll Row */}
                    <div
                      ref={cinemaMoviesRef}
                      className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory"
                    >
                      {cinemaMovies.map((movie) => (
                        <Link
                          key={movie._id}
                          href={`/phim/chi-tiet/${movie.slug}`}
                          className="flex-shrink-0 w-[280px] sm:w-[320px] group/card snap-start flex flex-col relative"
                        >
                          {/* Landscape backdrop image container */}
                          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-border group-hover/card:border-accent-gold transition-all duration-180 bg-bg-elevated">
                            <img
                              src={movie.thumb_url || movie.poster_url || '/placeholder.png'}
                              alt={movie.name}
                              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />

                            {/* Badges on bottom-right of landscape image */}
                            <span className="absolute bottom-2 right-2 bg-bg-void/70 backdrop-blur-sm text-text-primary font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-border">
                              {movie.quality}
                            </span>

                            {/* Badges on bottom-left of landscape image (shifted right to not overlap the mini poster) */}
                            {movie.lang && (
                              <span className="absolute bottom-2 left-[58px] sm:left-[70px] bg-accent-gold/90 text-bg-void font-bold text-[9px] px-1.5 py-0.5 rounded shadow-sm">
                                {movie.lang}
                              </span>
                            )}

                            {/* Play hover effect */}
                            <div className="absolute inset-0 bg-bg-void/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-180 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-accent-gold flex items-center justify-center transform scale-90 group-hover/card:scale-100 transition-transform duration-180">
                                <Play size={16} className="fill-bg-void text-bg-void translate-x-0.5" />
                              </div>
                            </div>
                          </div>

                          {/* Small portrait card overlapping bottom-left of landscape image */}
                          <div className="absolute bottom-[44px] sm:bottom-[48px] left-3 z-10 w-[42px] sm:w-[52px] aspect-[2/3] rounded-lg overflow-hidden border border-border/80 shadow-2xl bg-bg-elevated transition-transform group-hover/card:scale-105 duration-300">
                            <img
                              src={movie.poster_url || movie.thumb_url || '/placeholder.png'}
                              alt={movie.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>

                          {/* Text info block, shifted left-padding to not overlap the mini poster */}
                          <div className="pl-[58px] sm:pl-[70px] mt-2.5 flex flex-col gap-0.5">
                            <h4 className="text-xs sm:text-sm font-bold text-text-primary group-hover/card:text-accent-gold transition-colors truncate leading-tight">
                              {movie.name}
                            </h4>
                            <p className="text-[10px] text-text-secondary truncate mt-0.5 font-medium">
                              {movie.origin_name}
                            </p>
                            <p className="text-[10px] text-text-muted truncate font-mono mt-0.5">
                              T16 · {movie.year} · {movie.quality}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
                <SprocketDivider />
              </>
            )}
          </>
          ) : null}
        </LazySection>

        {/* Top 10 Single Movies Section */}
        <LazySection minHeight={420} onVisible={loadTopSingleBlock}>
          {!topSingleReady ? (
            <SectionSkeleton height={420} />
          ) : topSingleMovies.length > 0 ? (
          <>
            <Top10Carousel
              title="Top 10 phim lẻ hôm nay"
              movies={topSingleMovies}
              metaLine={(movie) => `T16 · ${movie.year} · ${movie.quality}`}
            />
            <SprocketDivider />
          </>
          ) : null}
        </LazySection>

        {/* Anime Showcase Section */}
        <LazySection minHeight={480} onVisible={loadAnimeBlock}>
          {!animeReady ? (
            <SectionSkeleton height={480} />
          ) : animeMovies.length > 0 ? (
          <>
            <section className="py-8">
              <div className="mb-6 flex items-center gap-3">
                <Link
                  href="/phim/hoat-hinh?title=Hoạt+Hình"
                  className="group flex items-center gap-2 hover:text-accent-gold transition-colors"
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight group-hover:text-accent-gold transition-colors">
                    Kho Tàng Anime Mới Nhất
                  </h2>
                  <div className="w-5 h-5 rounded-full border border-border/80 flex items-center justify-center text-text-primary group-hover:border-accent-gold group-hover:text-accent-gold transition-colors">
                    <ChevronRight size={12} className="translate-x-px" />
                  </div>
                </Link>
              </div>

              {/* Showcase Banner Container Wrapper */}
              <div className="relative group/anime w-full">
                {/* Main Showcase Banner Container (with overflow-hidden) */}
                <div className="relative w-full min-h-[380px] sm:min-h-[420px] lg:min-h-[480px] rounded-3xl overflow-hidden border border-border/80 bg-bg-surface shadow-2xl flex flex-col justify-end">
                  {/* Backdrop background image */}
                  {selectedAnime && (
                    <img
                      src={selectedAnime.thumb_url || selectedAnime.poster_url || '/placeholder.png'}
                      alt={selectedAnime.name}
                      className="absolute top-0 right-0 w-full h-full object-cover select-none"
                    />
                  )}

                  {/* Left side dark gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-r from-bg-void via-bg-void/95 via-bg-void/80 to-bg-void/0 z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-void/90 via-bg-void/40 to-bg-void/0 lg:hidden z-10" />

                  {/* Left content details */}
                  {selectedAnime && (
                    <div className="absolute top-0 left-0 right-0 bottom-[80px] sm:bottom-[90px] p-6 sm:p-10 flex flex-col justify-center items-start z-20 w-full lg:w-[50%] select-none">
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary tracking-tight leading-tight">
                        {selectedAnime.name}
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-accent-gold mt-1.5">
                        {selectedAnime.origin_name}
                      </p>

                      {/* Metadata Badges */}
                      <div className="flex items-center gap-2 mt-3.5 flex-wrap">
                        <span className="border border-accent-gold text-accent-gold px-1.5 py-0.5 rounded text-[10px] font-bold bg-bg-void/40">
                          IMDb {((selectedAnime.name.charCodeAt(0) || 0) % 20) / 10 + 6.9}
                        </span>
                        <span className="bg-bg-elevated/70 border border-border/80 text-text-primary px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {((selectedAnime.name.charCodeAt(1) || 0) % 2 === 0) ? 'PG-13' : 'PG'}
                        </span>
                        <span className="bg-bg-elevated/70 border border-border/80 text-text-primary px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {selectedAnime.year || '2024'}
                        </span>
                        <span className="bg-bg-elevated/70 border border-border/80 text-text-primary px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {selectedAnimeDetail?.time || '1h 56m'}
                        </span>
                      </div>

                      {/* Category Label */}
                      <span className="bg-bg-elevated/80 backdrop-blur-sm border border-border/80 text-text-secondary px-2 py-0.5 rounded text-[10px] font-semibold mt-3">
                        Hoạt hình
                      </span>

                      {/* Description Paragraph */}
                      <p className="text-xs sm:text-sm text-text-muted mt-4 max-w-full sm:max-w-[420px] line-clamp-3 leading-relaxed">
                        {selectedAnimeDetail?.content 
                          ? selectedAnimeDetail.content.replace(/<[^>]*>/g, '') 
                          : `Hành trình đầy kịch tính và cảm xúc của các nhân vật trong bộ phim anime ${selectedAnime.name}. Hãy cùng đón xem những thử thách, tình bạn và sức mạnh vươn lên trong thế giới hoạt hình đặc sắc này.`}
                      </p>

                      {/* Play and Action buttons */}
                      <div className="flex items-center gap-3.5 mt-5 sm:mt-6">
                        <Link
                          href={`/phim/chi-tiet/${selectedAnime.slug}`}
                          className="w-11 h-11 rounded-full bg-accent-gold text-bg-void flex items-center justify-center hover:scale-105 transition-transform shadow-lg cursor-pointer"
                        >
                          <Play size={18} className="fill-bg-void text-bg-void translate-x-0.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedAnime) return;
                            watchlistUtil.toggle(selectedAnime);
                            setWatchlist(watchlistUtil.get());
                          }}
                          className={`w-10 h-10 rounded-full bg-bg-surface/80 border border-border/80 flex items-center justify-center hover:border-accent-gold transition-colors cursor-pointer ${
                            selectedAnime && watchlist.some((item) => item.id === selectedAnime._id)
                              ? "text-accent-gold border-accent-gold"
                              : "text-text-primary hover:text-accent-gold"
                          }`}
                        >
                          <Heart
                            size={16}
                            className={
                              selectedAnime && watchlist.some((item) => item.id === selectedAnime._id)
                                ? "fill-accent-gold"
                                : ""
                            }
                          />
                        </button>
                        <Link
                          href={`/phim/chi-tiet/${selectedAnime.slug}`}
                          className="w-10 h-10 rounded-full bg-bg-surface/80 border border-border/80 text-text-primary flex items-center justify-center hover:border-accent-gold hover:text-accent-gold transition-colors cursor-pointer"
                        >
                          <Info size={16} />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Center-Aligned Miniatures Navigation (sitting exactly on the bottom border) */}
                <div className="absolute bottom-0 translate-y-1/2 left-0 right-0 z-30 flex justify-center px-6">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 justify-center max-w-full">
                    {animeMovies.map((anime) => {
                      const isSelected = selectedAnime?._id === anime._id;
                      return (
                        <button
                          key={anime._id}
                          onClick={() => setSelectedAnime(anime)}
                          className={`flex-shrink-0 w-[36px] sm:w-[48px] aspect-[2/3] rounded-lg overflow-hidden border transition-all duration-200 cursor-pointer ${
                            isSelected 
                              ? 'border-accent-gold ring-1 ring-accent-gold scale-105' 
                              : 'border-border/80 hover:border-accent-gold hover:scale-[1.03]'
                          }`}
                        >
                          <img
                            src={anime.poster_url || anime.thumb_url || '/placeholder.png'}
                            alt={anime.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
            <SprocketDivider />
          </>
          ) : null}
        </LazySection>

        {/* Regional Movies Section */}
        <LazySection minHeight={360} onVisible={loadRegionalBlock}>
          {!regionalReady ? (
            <SectionSkeleton height={360} />
          ) : (koreanMovies.length > 0 || chineseMovies.length > 0 || usukMovies.length > 0) ? (
          <>
            <section className="py-8">
              <div className="bg-bg-surface/50 border border-border/80 p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col gap-4">
                <RegionalRow
                  titlePrefix="Phim"
                  titleHighlight="Hàn Quốc"
                  countrySlug="han-quoc"
                  movies={koreanMovies}
                />
                <RegionalRow
                  titlePrefix="Phim"
                  titleHighlight="Trung Quốc"
                  countrySlug="trung-quoc"
                  movies={chineseMovies}
                />
                <RegionalRow
                  titlePrefix="Phim"
                  titleHighlight="US-UK"
                  countrySlug="au-my"
                  movies={usukMovies}
                />
              </div>
            </section>
            <SprocketDivider />
          </>
          ) : null}
        </LazySection>

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
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-gold" />
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

const RegionalRow = ({
  titlePrefix,
  titleHighlight,
  countrySlug,
  movies,
}: {
  titlePrefix: string;
  titleHighlight: string;
  countrySlug: string;
  movies: Movie[];
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  if (!movies || movies.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 items-center py-6 border-b border-border/40 last:border-b-0">
      {/* Left Column: Title and action */}
      <div className="flex flex-col justify-center items-start lg:pr-4">
        <h3 className="text-xl font-bold text-text-primary tracking-tight leading-snug">
          {titlePrefix} <span className="text-accent-gold block lg:inline">{titleHighlight}</span> mới
        </h3>
        <Link
          href={`/phim/moi?country=${countrySlug}`}
          className="text-xs font-semibold text-text-secondary hover:text-accent-gold transition-colors mt-2.5 flex items-center gap-1 group"
        >
          Xem toàn bộ <span className="transition-transform group-hover:translate-x-0.5">›</span>
        </Link>
      </div>

      {/* Right Column: Landscape Horizontal Scroll List */}
      <div className="relative group/row w-full min-w-0">
        {/* Scroll Left Button */}
        <button
          onClick={() => scrollContainerByOneCard(rowRef.current, 'left')}
          className="absolute left-3 top-[56px] sm:top-[69px] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-bg-surface/90 border border-border/80 text-text-primary flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:border-accent-gold cursor-pointer shadow-lg"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Scroll Right Button */}
        <button
          onClick={() => scrollContainerByOneCard(rowRef.current, 'right')}
          className="absolute right-3 top-[56px] sm:top-[69px] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-bg-surface/90 border border-border/80 text-text-primary flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:border-accent-gold cursor-pointer shadow-lg"
        >
          <ChevronRight size={20} />
        </button>

        {/* Scroll Row */}
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {movies.map((movie) => (
            <Link
              key={movie._id}
              href={`/phim/chi-tiet/${movie.slug}`}
              className="flex-shrink-0 w-[180px] sm:w-[220px] group/card snap-start"
            >
              {/* Landscape image container */}
              <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-border group-hover/card:border-accent-gold transition-all duration-180 bg-bg-elevated">
                <img
                  src={movie.thumb_url || movie.poster_url || '/placeholder.png'}
                  alt={movie.name}
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                
                {/* Badge Bottom-Left */}
                <span className="absolute bottom-2 left-2 bg-bg-void/70 backdrop-blur-sm text-text-primary font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-border">
                  {movie.quality}
                </span>

                {/* Play hover effect */}
                <div className="absolute inset-0 bg-bg-void/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-180 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-accent-gold flex items-center justify-center transform scale-90 group-hover/card:scale-100 transition-transform duration-180">
                    <Play size={16} className="fill-bg-void text-bg-void translate-x-0.5" />
                  </div>
                </div>
              </div>

              {/* Title & Origin Name */}
              <div className="mt-2.5 px-0.5">
                <h4 className="text-xs sm:text-sm font-semibold text-text-primary group-hover/card:text-accent-gold transition-colors truncate leading-tight">
                  {movie.name}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-text-muted mt-0.5 truncate font-medium">
                  {movie.origin_name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
