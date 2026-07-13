'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Play, Ticket, Loader2, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Movie } from "@/types/movie";

interface HeroBannerProps {
  movies?: Movie[];
  loading?: boolean;
}

const HeroBanner = ({ movies = [], loading = true }: HeroBannerProps) => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = movies.slice(0, 6);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handlePrev = () => {
    if (slides.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    if (slides.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  if (loading) {
    return (
      <section className="relative w-full h-[520px] sm:h-[560px] lg:h-[75vh] flex items-center justify-center bg-bg-void border-b border-border/50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-accent-gold" size={40} />
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">Đang tải tiêu điểm...</span>
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  const activeMovie = slides[activeIndex];
  const categories = Array.isArray(activeMovie.category)
    ? activeMovie.category.slice(0, 3)
    : [];

  return (
    <section className="relative w-full h-[560px] sm:h-[600px] lg:h-[80vh] flex flex-col overflow-hidden bg-bg-void select-none border-b border-border/50">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          key={activeMovie._id}
          className="absolute inset-0 opacity-35 transition-opacity duration-700"
          style={{
            backgroundImage: activeMovie.poster_url ? `url(${activeMovie.poster_url})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center 20%",
            filter: "blur(4px)",
          }}
        />
        <div className="projector-beam" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-void via-bg-void/85 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(244,196,91,0.04)_0%,transparent_60%)]" />
      </div>

      {/* Content — reserved bottom space for slider controls */}
      <div className="relative z-10 flex-1 min-h-0 w-full max-w-[1800px] mx-auto px-4 sm:px-6 pt-5 pb-16 lg:pt-0 lg:pb-20 flex flex-col lg:justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-12 items-center h-full min-h-0">
          {/* Desktop text column */}
          <div className="hidden lg:flex lg:col-span-7 flex-col gap-5 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/30 text-accent-gold w-fit text-xs font-semibold uppercase tracking-wider">
              <Ticket size={14} className="text-accent-gold animate-pulse" />
              <span>Đang Trình Chiếu · Spotlight #{activeIndex + 1}</span>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[24px]">
              {categories.map((cat) => (
                <span
                  key={cat.id || cat.slug}
                  className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-bg-surface/80 border border-border/80 text-text-secondary"
                >
                  {cat.name}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-2 min-h-[120px]">
              <h1 className="font-display text-5xl lg:text-6xl font-bold leading-[1.1] text-text-primary tracking-tight max-w-2xl line-clamp-2">
                {activeMovie.name}
              </h1>
              <h2 className="text-lg font-medium text-text-secondary tracking-wide line-clamp-1">
                {activeMovie.origin_name}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-text-secondary">
              <span className="font-semibold text-text-primary">{activeMovie.year}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-border" />
              <span className="bg-accent-gold/10 border border-accent-gold/30 text-accent-gold px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                {activeMovie.quality}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-border" />
              <span className="bg-bg-surface/90 border border-border px-2 py-0.5 rounded text-[10px] font-semibold">
                {activeMovie.lang}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-border" />
              <span className="font-semibold text-accent-gold">{activeMovie.episode_current}</span>
            </div>

            <div className="flex flex-wrap gap-3 mt-2">
              <button
                type="button"
                onClick={() => router.push(`/watch/${activeMovie.slug}`)}
                className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-accent-gold hover:bg-accent-gold-hover text-bg-void font-bold text-sm rounded-md transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-accent-gold/15"
              >
                <Play className="w-4 h-4 fill-bg-void" />
                <span>Xem Ngay</span>
              </button>
              <button
                type="button"
                onClick={() => router.push(`/movies/detail/${activeMovie.slug}`)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border bg-bg-surface/60 hover:bg-bg-elevated text-text-primary font-bold text-sm rounded-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <Info className="w-4 h-4" />
                <span>Thông tin chi tiết</span>
              </button>
            </div>
          </div>

          {/* Poster + mobile info */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center gap-3 h-full min-h-0">
            {/* Mobile spotlight */}
            <div className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-[10px] font-semibold uppercase tracking-wider shrink-0">
              <Ticket size={12} className="animate-pulse" />
              <span>Spotlight #{activeIndex + 1}</span>
            </div>

            <div
              onClick={() => router.push(`/movies/detail/${activeMovie.slug}`)}
              className="group/showcase relative w-[148px] sm:w-[180px] lg:w-full lg:max-w-[310px] aspect-[2/3] rounded-xl overflow-hidden border border-border/60 bg-bg-surface/30 shadow-[0_16px_40px_rgba(0,0,0,0.7)] hover:border-accent-gold/50 transition-all duration-300 cursor-pointer shrink-0"
            >
              <img
                src={activeMovie.poster_url || "/placeholder.png"}
                alt={activeMovie.name}
                className="w-full h-full object-cover group-hover/showcase:scale-105 transition-transform duration-500"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-void via-transparent to-transparent opacity-80 z-10" />

              {/* Overlay only on desktop — mobile shows text below to avoid duplication */}
              <div className="hidden lg:flex absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-bg-void/95 via-bg-void/70 to-transparent border-t border-border/30 z-20 flex-col gap-2">
                <div className="flex flex-wrap gap-1.5 min-h-[22px]">
                  {categories.slice(0, 2).map((cat) => (
                    <span
                      key={cat.id || cat.slug}
                      className="px-2 py-0.5 rounded-[4px] text-[9px] font-bold bg-accent-gold/10 border border-accent-gold/20 text-accent-gold uppercase tracking-wider"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-0.5 min-h-[48px]">
                  <h4 className="font-display font-bold text-lg text-text-primary leading-tight line-clamp-2 group-hover/showcase:text-accent-gold transition-colors">
                    {activeMovie.name}
                  </h4>
                  <p className="text-xs text-text-secondary line-clamp-1">{activeMovie.origin_name}</p>
                </div>
                <div className="flex items-center justify-between border-t border-border/40 pt-2 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-accent-gold px-1.5 py-0.5 bg-accent-gold/10 rounded border border-accent-gold/20">
                      {activeMovie.quality}
                    </span>
                    <span className="text-[10px] font-semibold text-text-secondary">{activeMovie.year}</span>
                  </div>
                  <span className="text-[10px] font-mono text-accent-gold bg-bg-surface/90 px-2 py-0.5 rounded border border-border line-clamp-1 max-w-[100px]">
                    {activeMovie.episode_current}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile text under poster — fixed heights to prevent jump */}
            <div className="lg:hidden w-full max-w-[320px] flex flex-col items-center text-center gap-2 shrink-0">
              <div className="w-full min-h-[52px] flex flex-col justify-center gap-0.5">
                <h1 className="font-display text-xl font-bold leading-snug text-text-primary line-clamp-2">
                  {activeMovie.name}
                </h1>
                <p className="text-xs text-text-secondary line-clamp-1">{activeMovie.origin_name}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-medium text-text-secondary min-h-[22px]">
                <span className="font-semibold text-text-primary">{activeMovie.year}</span>
                <span className="bg-accent-gold/10 border border-accent-gold/30 text-accent-gold px-1.5 py-0.5 rounded font-bold uppercase">
                  {activeMovie.quality}
                </span>
                <span className="bg-bg-surface/90 border border-border px-1.5 py-0.5 rounded font-semibold">
                  {activeMovie.lang}
                </span>
                <span className="font-semibold text-accent-gold line-clamp-1 max-w-[90px]">
                  {activeMovie.episode_current}
                </span>
              </div>

              <div className="flex gap-2 w-full mt-0.5">
                <button
                  type="button"
                  onClick={() => router.push(`/watch/${activeMovie.slug}`)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-accent-gold hover:bg-accent-gold-hover text-bg-void font-bold text-xs rounded-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-bg-void" />
                  <span>Xem Ngay</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/movies/detail/${activeMovie.slug}`)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 border border-border bg-bg-surface/60 hover:bg-bg-elevated text-text-primary font-bold text-xs rounded-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Chi tiết</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slider controls — own reserved strip, never overlaps content */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 sm:gap-6 bg-black/45 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/5">
        <button
          type="button"
          onClick={handlePrev}
          className="text-text-secondary hover:text-accent-gold transition-colors p-1 cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeIndex ? "w-5 sm:w-6 bg-accent-gold" : "w-1.5 sm:w-2 bg-text-muted/50 hover:bg-text-secondary"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="text-text-secondary hover:text-accent-gold transition-colors p-1 cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
};

export default HeroBanner;
