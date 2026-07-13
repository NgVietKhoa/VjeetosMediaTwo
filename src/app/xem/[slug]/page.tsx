'use client';

import { useEffect, useState, useMemo, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Server,
  ChevronRight,
  Info,
  ChevronLeft,
  Layout,
  Maximize,
  Lightbulb,
  LightbulbOff,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { phimApi } from "@/api/phim.api";
import { MovieDetail, Episode } from "@/types/movie";
import VideoPlayer from "@/components/player/VideoPlayer";
import { historyUtil } from "@/utils/history";
import RecommendationsCarousel from "@/components/movie/RecommendationsCarousel";

function WatchContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const slug = params?.slug as string;
  const tapFromUrl = searchParams.get("tap") || "";

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentServerIdx, setCurrentServerIdx] = useState(0);
  const [isLightsOff, setIsLightsOff] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchWatchData = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await phimApi.getMovieDetail(slug);
        if (data.status) {
          setMovie(data.movie);
          setEpisodes(data.episodes);
          historyUtil.add(data.movie);
        }
      } catch (error) {
        console.error("Error fetching watch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchData();
  }, [slug]);

  const allServerTaps = useMemo(() => {
    if (episodes.length === 0) return [];
    return episodes[currentServerIdx]?.server_data || [];
  }, [episodes, currentServerIdx]);

  const activeEpisode = useMemo(() => {
    if (allServerTaps.length === 0) return null;
    return (
      allServerTaps.find((ep) => ep.slug === tapFromUrl) || allServerTaps[0]
    );
  }, [allServerTaps, tapFromUrl]);

  const currentTap = useMemo(
    () => activeEpisode?.name || "...",
    [activeEpisode],
  );

  const isEmbed = useMemo(() => {
    if (!activeEpisode) return false;
    return !!activeEpisode.link_embed && !activeEpisode.link_m3u8;
  }, [activeEpisode]);

  const currentTapIdx = useMemo(() => {
    return allServerTaps.findIndex((ep) => ep.name === currentTap);
  }, [allServerTaps, currentTap]);

  const updateTapUrl = (newTapSlug: string) => {
    router.push(`/xem/${slug}?tap=${newTapSlug}`);
  };

  const handleNext = () => {
    if (currentTapIdx < allServerTaps.length - 1) {
      updateTapUrl(allServerTaps[currentTapIdx + 1].slug);
    }
  };

  const handlePrev = () => {
    if (currentTapIdx > 0) {
      updateTapUrl(allServerTaps[currentTapIdx - 1].slug);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="animate-spin text-accent-gold" size={48} />
        <p className="font-semibold text-sm text-text-secondary animate-pulse">Đang chuẩn bị phòng phát...</p>
      </div>
    );
  }

  if (!movie || episodes.length === 0 || !activeEpisode) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-20 text-center min-h-[70vh] flex flex-col items-center justify-center">
        <AlertTriangle className="text-accent-gold w-16 h-16 mb-4" />
        <h1 className="text-xl font-bold mb-4 text-text-primary">
          Không tìm thấy tập phim phát sóng
        </h1>
        <Link
          href="/"
          className="px-6 py-2.5 bg-accent-gold text-bg-void rounded-lg text-sm font-semibold hover:bg-accent-gold-hover"
        >
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-12 pt-6">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-medium text-text-secondary mb-4 sm:mb-6 tracking-wide">
          <Link href="/" className="hover:text-accent-gold transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={12} className="text-text-muted" />
          <Link href={`/phim/${movie.type === "series" ? "bo" : "le"}`} className="hover:text-accent-gold transition-colors">
            {movie.type === "series" ? "Phim bộ" : "Phim lẻ"}
          </Link>
          <ChevronRight size={12} className="text-text-muted" />
          <Link href={`/phim/chi-tiet/${movie.slug}`} className="hover:text-accent-gold transition-colors max-w-[120px] sm:max-w-[200px] truncate">
            {movie.name}
          </Link>
          <ChevronRight size={12} className="text-text-muted" />
          <span className="text-accent-gold">{currentTap}</span>
        </div>

        <div className={`grid grid-cols-1 gap-6 xl:gap-8 transition-all duration-500 ${isExpanded ? "xl:grid-cols-1" : "xl:grid-cols-[minmax(0,1fr)_340px]"}`}>
          {/* Main Video Area */}
          <div className="flex flex-col gap-4 min-w-0">
            <div className={`relative aspect-video bg-black rounded-lg overflow-hidden border border-border group transition-all duration-500 ${isLightsOff ? "ring-2 ring-accent-gold/40 z-[101]" : ""}`}>
              {isEmbed ? (
                <iframe
                  src={activeEpisode.link_embed}
                  title={`${movie.name} - ${activeEpisode.name}`}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              ) : (
                <VideoPlayer url={activeEpisode.link_m3u8 || activeEpisode.link_embed} />
              )}
            </div>

            {/* Video Action Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors cursor-pointer
                    ${isExpanded
                      ? "border-accent-gold bg-accent-gold/15 text-accent-gold"
                      : "border-border bg-bg-surface text-text-secondary hover:text-text-primary hover:border-border-strong"
                    }`}
                >
                  <Maximize className="h-3.5 w-3.5" />
                  <span>{isExpanded ? "Thu nhỏ" : "Rộng màn hình"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLightsOff(!isLightsOff)}
                  className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors cursor-pointer
                    ${isLightsOff
                      ? "border-accent-gold bg-accent-gold/15 text-accent-gold"
                      : "border-border bg-bg-surface text-text-secondary hover:text-text-primary hover:border-border-strong"
                    }`}
                >
                  {isLightsOff ? <LightbulbOff className="h-3.5 w-3.5" /> : <Lightbulb className="h-3.5 w-3.5" />}
                  <span>{isLightsOff ? "Bật đèn" : "Tắt đèn"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-1 rounded-md border border-border bg-bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary hover:bg-bg-elevated disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  disabled={currentTapIdx <= 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Tập trước</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1 rounded-md border border-border bg-bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary hover:bg-bg-elevated disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  disabled={currentTapIdx >= allServerTaps.length - 1}
                >
                  <span>Tập sau</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Lights Off Overlay */}
            {isLightsOff && (
              <div
                className="fixed inset-0 z-[100] bg-black/95 pointer-events-none"
                aria-hidden="true"
              />
            )}

            {/* Film Meta info */}
            <div className="flex flex-col gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary leading-tight">
                {movie.name}{" "}
                <span className="text-accent-gold ml-1">
                  - {currentTap}
                </span>
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-text-secondary">
                <span className="rounded bg-bg-surface px-2.5 py-0.5 border border-border">
                  {movie.quality} · {movie.lang}
                </span>
                <span>Năm phát hành: {movie.year}</span>
                <span>·</span>
                <span>Thời lượng: {movie.time || "N/A"}</span>
              </div>
            </div>

            {/* Server selection */}
            <div className="rounded-lg border border-border bg-bg-surface p-4 sm:p-6 mt-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-text-primary mb-4 flex items-center gap-2">
                <Server className="h-4 w-4 text-accent-gold" />
                <span>Nguồn phát phim</span>
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {episodes.map((server, idx) => (
                  <button
                    type="button"
                    key={server.server_name}
                    onClick={() => setCurrentServerIdx(idx)}
                    className={`flex items-center gap-1.5 rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all cursor-pointer
                      ${currentServerIdx === idx
                        ? "border-accent-gold bg-accent-gold text-bg-void"
                        : "border-border bg-bg-elevated text-text-secondary hover:border-border-strong hover:text-text-primary"
                      }`}
                  >
                    Nguồn {idx + 1} ({server.server_name})
                  </button>
                ))}
              </div>
            </div>

            {/* Description Card */}
            <div className="rounded-lg border border-border bg-bg-surface p-4 sm:p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-text-primary mb-4 flex items-center gap-2">
                <Info className="h-4 w-4 text-accent-gold" />
                <span>Tóm tắt phim</span>
              </h3>
              <div
                className="text-sm leading-relaxed text-text-secondary text-justify break-words whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: movie.content || "Nội dung phim đang cập nhật..." }}
              />
              <Link
                href={`/phim/chi-tiet/${movie.slug}`}
                className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-accent-gold hover:underline"
              >
                <span>Xem chi tiết phim</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Sidebar Area: Episodes selection */}
          <aside className="flex flex-col gap-6">
            <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-bg-surface">
              <div className="flex items-center justify-between border-b border-border bg-bg-elevated/40 px-4 py-3.5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-text-primary flex items-center gap-2">
                  <Layout className="h-4 w-4 text-accent-gold" />
                  <span>Danh sách tập</span>
                </h3>
                <span className="text-xs font-mono font-semibold text-accent-gold bg-bg-void/50 px-2 py-0.5 rounded border border-border">
                  {movie.episode_current}
                </span>
              </div>

              <div className="max-h-[50vh] overflow-y-auto p-4 custom-scrollbar sm:max-h-[70vh]">
                <div className={`grid gap-2 ${isExpanded ? "grid-cols-5 sm:grid-cols-8 lg:grid-cols-10" : "grid-cols-4"}`}>
                  {allServerTaps.map((ep) => (
                    <button
                      type="button"
                      key={ep.slug}
                      onClick={() => updateTapUrl(ep.slug)}
                      className={`flex aspect-square items-center justify-center rounded-md border text-xs font-bold transition-all cursor-pointer
                        ${currentTap === ep.name
                          ? "border-accent-gold bg-accent-gold text-bg-void shadow-md shadow-accent-gold/15"
                          : "border-border bg-bg-elevated text-text-secondary hover:border-border-strong hover:text-text-primary"
                        }`}
                    >
                      {ep.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <RecommendationsCarousel
        slug={slug}
        movieType={movie.type}
        className="max-w-[1600px] mx-auto px-4 sm:px-6 mt-12 sm:mt-16"
      />
    </main>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-accent-gold w-10 h-10" />
      </div>
    }>
      <WatchContent />
    </Suspense>
  );
}
