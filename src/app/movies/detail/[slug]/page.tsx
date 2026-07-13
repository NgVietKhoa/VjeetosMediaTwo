'use client';

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Play,
  Calendar,
  Globe,
  Clock,
  Info,
  Check,
  Plus,
  Loader2,
} from "lucide-react";
import { phimApi } from "@/api/phim.api";
import { MovieDetail, Episode } from "@/types/movie";
import { watchlistUtil } from "@/utils/watchlist";
import SprocketDivider from "@/components/common/SprocketDivider";
import RecommendationsCarousel from "@/components/movie/RecommendationsCarousel";

function MovieDetailContent() {
  const params = useParams();
  const slug = params?.slug as string;

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await phimApi.getMovieDetail(slug);
        if (data.status) {
          setMovie(data.movie);
          setEpisodes(data.episodes);
          setIsInWatchlist(watchlistUtil.isInWatchlist(data.movie._id));
        }
      } catch (error) {
        console.error("Error fetching movie detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleWatchlistToggle = () => {
    if (!movie) return;
    const added = watchlistUtil.toggle(movie);
    setIsInWatchlist(added);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <Loader2 className="animate-spin text-accent-gold" size={48} />
        <p className="font-semibold text-sm text-text-secondary animate-pulse">Đang tải thông tin phim...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 flex min-h-[70vh] flex-col items-center justify-center text-center py-20">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-bg-surface sm:mb-8">
          <Info className="h-7 w-7 text-accent-gold" />
        </div>
        <h1 className="mb-2 text-lg font-bold leading-snug text-text-primary sm:text-2xl">
          Không tìm thấy phim
        </h1>
        <p className="mx-auto mb-6 max-w-md text-sm font-medium text-text-secondary">
          Phim bạn yêu cầu không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-accent-gold px-8 py-3 text-sm font-semibold text-bg-void transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const defaultWatchUrl = episodes[0]?.server_data[0]?.slug
    ? `/watch/${movie.slug}?tap=${episodes[0].server_data[0].slug}`
    : `/watch/${movie.slug}`;

  return (
    <main className="pb-12 sm:pb-20">
      {/* Backdrop Header */}
      <div className="relative h-[60vh] lg:h-[70vh] w-full overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 w-full h-full scale-110 blur-2xl opacity-40 bg-cover bg-top"
            style={{ backgroundImage: `url(${movie.thumb_url || movie.poster_url})` }}
            aria-hidden="true"
          />

          <img
            src={movie.thumb_url || movie.poster_url}
            alt={movie.name}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* Cinematic Overlays */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background: "linear-gradient(to right, rgba(6,7,10,0.95) 0%, rgba(6,7,10,0.6) 50%, transparent 100%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-48 z-10 bg-gradient-to-t from-bg-void to-transparent" />
        </div>

        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 relative z-10 flex h-full items-end pb-8 sm:pb-12 lg:pb-20">
          <div className="w-full flex flex-col justify-end">
            <div className="flex flex-col gap-3 sm:gap-5 lg:gap-6 max-w-4xl">
              <div className="flex flex-wrap gap-1.5 lg:gap-2">
                {Array.isArray(movie.category) && movie.category.map((cat) => (
                  <span
                    key={cat.id || cat.slug}
                    className="rounded bg-bg-surface/85 backdrop-blur-sm border border-border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-primary"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-1 sm:gap-2">
                <h1 className="font-display text-2xl font-bold leading-tight text-text-primary sm:text-4xl lg:text-5xl tracking-tight drop-shadow-sm">
                  {movie.name}
                </h1>
                <h2 className="text-sm font-medium leading-snug text-text-secondary sm:text-lg">
                  {movie.origin_name}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-text-secondary sm:gap-x-8 sm:text-sm">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-accent-gold" />
                  <span>{movie.year}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-accent-gold" />
                  <span>{movie.time || "N/A"}</span>
                </div>
                <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                  <Globe className="h-3.5 w-3.5 shrink-0 text-accent-gold" />
                  <span className="truncate">
                    {Array.isArray(movie.country) && movie.country[0]?.name || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-1 rounded bg-accent-gold/15 border border-accent-gold/30 px-2.5 py-0.5 text-accent-gold text-[10px] font-bold uppercase tracking-wider">
                  {movie.quality}
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-2 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link
                  href={defaultWatchUrl}
                  className="flex items-center justify-center gap-2 rounded-md bg-accent-gold hover:bg-accent-gold-hover px-8 py-3 text-xs font-bold uppercase tracking-wider text-bg-void transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Play fill="currentColor" className="h-4 w-4" />
                  <span>Xem phim</span>
                </Link>
                <button
                  type="button"
                  onClick={handleWatchlistToggle}
                  className="flex items-center justify-center gap-2 rounded-md border border-border bg-bg-surface hover:bg-bg-elevated px-6 py-3 text-xs font-bold uppercase tracking-wider text-text-primary transition-all active:scale-95 cursor-pointer"
                >
                  {isInWatchlist ? <Check size={14} className="text-accent-teal" /> : <Plus size={14} />}
                  <span>{isInWatchlist ? "Đã thích" : "Yêu thích"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 xl:gap-12">
          {/* Left Column: Movie Info & Episodes */}
          <div className="flex flex-col gap-8 lg:col-span-8 min-w-0 w-full overflow-hidden">
            <section>
              <div className="mb-3 flex items-center gap-2 sm:mb-6">
                <div className="h-5 w-1 rounded-full bg-accent-gold" />
                <h3 className="text-base font-semibold text-text-primary sm:text-xl">
                  Nội dung phim
                </h3>
              </div>
              <div
                className="text-[14px] font-medium leading-[1.65] text-text-secondary sm:text-base sm:leading-loose text-justify break-words whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: movie.content || "Nội dung phim đang được cập nhật..." }}
              />
            </section>

            <SprocketDivider />

            <section id="episodes">
              <div className="mb-4 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1 rounded-full bg-accent-gold" />
                  <h3 className="text-base font-semibold text-text-primary sm:text-xl">
                    Danh sách tập
                  </h3>
                </div>
                <div className="w-fit rounded-md border border-border bg-bg-surface px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-gold">
                  {movie.episode_current} / {movie.episode_total || "?"} tập · {movie.lang}
                </div>
              </div>

              {episodes.length === 0 ? (
                <div className="rounded-lg border border-border bg-bg-surface p-4 sm:p-6 text-center text-text-secondary">
                  Danh sách tập đang được cập nhật...
                </div>
              ) : (
                episodes.map((server) => (
                  <div
                    key={server.server_name}
                    className="mb-6 rounded-lg border border-border bg-bg-surface p-4 sm:p-6"
                  >
                    <h4 className="mb-4 border-b border-border pb-2 text-[12px] font-semibold uppercase tracking-wide text-text-secondary flex items-center gap-2">
                      <span className="text-text-primary">
                        Server: {server.server_name}
                      </span>
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {server.server_data.map((ep) => (
                        <Link
                          key={ep.slug}
                          href={`/watch/${movie.slug}?tap=${ep.slug}`}
                          className="flex h-9 min-w-[70px] px-3.5 items-center justify-center rounded-md border border-border bg-bg-elevated text-xs font-semibold text-text-secondary transition-colors hover:bg-accent-gold hover:text-bg-void hover:border-accent-gold active:scale-95 cursor-pointer"
                        >
                          {ep.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>

          {/* Right Column: Cast & Director details */}
          <aside className="flex flex-col gap-6 lg:col-span-4">
            <section className="rounded-lg border border-border bg-bg-surface p-5 sm:p-6">
              <h4 className="mb-4 border-b border-border pb-2 text-sm font-semibold text-text-primary uppercase tracking-wide">
                Diễn viên
              </h4>
              <div className="flex flex-col gap-3">
                {Array.isArray(movie.actor) && movie.actor.length > 0 ? (
                  movie.actor.map((a) => (
                    <PersonRow key={a} name={a} />
                  ))
                ) : (
                  <p className="text-xs italic text-text-muted">
                    Thông tin diễn viên đang được cập nhật...
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-border bg-bg-surface p-5 sm:p-6">
              <h4 className="mb-4 border-b border-border pb-2 text-sm font-semibold text-text-primary uppercase tracking-wide">
                Đạo diễn
              </h4>
              <div className="flex flex-col gap-3">
                {Array.isArray(movie.director) && movie.director.length > 0 ? (
                  movie.director.map((d) => (
                    <PersonRow key={d} name={d} />
                  ))
                ) : (
                  <p className="text-xs italic text-text-muted">
                    Thông tin đạo diễn đang được cập nhật...
                  </p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>

      <RecommendationsCarousel slug={slug} movieType={movie.type} />
    </main>
  );
}

export default function MovieDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="animate-spin text-accent-gold w-10 h-10" />
      </div>
    }>
      <MovieDetailContent />
    </Suspense>
  );
}

function PersonRow({ name }: { name: string }) {
  return (
    <div className="group flex cursor-default items-center gap-3.5">
      <div className="h-8 w-8 shrink-0 rounded-md overflow-hidden border border-border bg-bg-elevated">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1d29&color=f4c45b&bold=true`}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <span className="min-w-0 text-xs font-medium text-text-secondary group-hover:text-accent-gold transition-colors">
        {name}
      </span>
    </div>
  );
}
