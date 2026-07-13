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

  // Auto transition every 6 seconds
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
      <section className="relative w-full h-[550px] lg:h-[75vh] flex items-center justify-center bg-bg-void border-b border-border/50">
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

  return (
    <section className="relative w-full min-h-[650px] lg:h-[80vh] flex items-center justify-center overflow-hidden bg-bg-void py-12 lg:py-0 select-none border-b border-border/50">
      {/* Background Backdrops Container */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, idx) => (
          <div
            key={slide._id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === activeIndex ? "opacity-35 scale-100" : "opacity-0 scale-105"
            } transform duration-1000`}
            style={{
              backgroundImage: slide.poster_url ? `url(${slide.poster_url})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center 20%",
              filter: "blur(4px)",
            }}
          />
        ))}
        {/* Projector Ambient Light Beam Overlay */}
        <div className="projector-beam" />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-void via-bg-void/85 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(244,196,91,0.04)_0%,transparent_60%)]" />
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center h-full">
        {/* Left Column: Movie Detail Description */}
        <div className="lg:col-span-7 text-left flex flex-col gap-5 sm:gap-6 animate-fade-in">
          {/* Spotlight Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/30 text-accent-gold w-fit text-xs font-semibold uppercase tracking-wider">
            <Ticket size={14} className="text-accent-gold animate-pulse" />
            <span>Đang Trình Chiếu · Spotlight #{activeIndex + 1}</span>
          </div>

          {/* Dynamic Categories */}
          <div className="flex flex-wrap gap-2">
            {Array.isArray(activeMovie.category) &&
              activeMovie.category.slice(0, 3).map((cat) => (
                <span
                  key={cat.id || cat.slug}
                  className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-bg-surface/80 border border-border/80 text-text-secondary"
                >
                  {cat.name}
                </span>
              ))}
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1 sm:gap-2">
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-text-primary tracking-tight max-w-2xl">
              {activeMovie.name}
            </h1>
            <h2 className="text-sm sm:text-lg font-medium text-text-secondary tracking-wide">
              {activeMovie.origin_name}
            </h2>
          </div>

          {/* Metadata Row */}
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

          {/* Call to Actions */}
          <div className="flex flex-wrap gap-3 mt-2">
            <button
              onClick={() => router.push(`/xem/${activeMovie.slug}`)}
              className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-accent-gold hover:bg-accent-gold-hover text-bg-void font-bold text-sm rounded-md transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-accent-gold/15 select-none"
            >
              <Play className="w-4 h-4 fill-bg-void" />
              <span>Xem Ngay</span>
            </button>
            <button
              onClick={() => router.push(`/phim/chi-tiet/${activeMovie.slug}`)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border bg-bg-surface/60 hover:bg-bg-elevated text-text-primary font-bold text-sm rounded-md transition-all active:scale-[0.98] cursor-pointer select-none"
            >
              <Info className="w-4 h-4" />
              <span>Thông tin chi tiết</span>
            </button>
          </div>
        </div>

        {/* Right Column: Ticket Showcase */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="ticket-card w-full max-w-[330px] rounded-lg overflow-hidden border border-border p-5 flex flex-col gap-4 transform rotate-[1deg] hover:rotate-0 transition-all duration-300 shadow-2xl bg-bg-surface/90 backdrop-blur-md">
            {/* Ticket Header */}
            <div className="flex justify-between items-center border-b border-border/80 pb-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-accent-gold animate-pulse" />
                <span className="font-mono text-[10px] font-bold tracking-wider text-text-secondary">VJEETOS CINEMA</span>
              </div>
              <span className="font-mono text-[10px] font-bold text-accent-gold px-2 py-0.5 bg-accent-gold/10 rounded">VIP PASS</span>
            </div>

            {/* Poster Image */}
            <div
              className="relative w-full aspect-[16/10] bg-bg-elevated rounded-md overflow-hidden border border-border group/poster cursor-pointer"
              onClick={() => router.push(`/phim/chi-tiet/${activeMovie.slug}`)}
            >
              <img
                src={activeMovie.poster_url}
                alt={activeMovie.name}
                className="w-full h-full object-cover group-hover/poster:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2.5 left-2.5 bg-accent-gold text-bg-void text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">
                {activeMovie.quality}
              </div>
              <div className="absolute bottom-2.5 right-2.5 bg-black/65 backdrop-blur-sm text-text-primary text-[9px] font-bold px-2 py-0.5 rounded">
                {activeMovie.year}
              </div>
            </div>

            {/* Movie Title & Info */}
            <div className="flex flex-col gap-1 text-left">
              <h4 className="font-display font-bold text-base text-text-primary leading-tight tracking-wide truncate">
                {activeMovie.name}
              </h4>
              <p className="text-[11px] text-text-secondary truncate">{activeMovie.origin_name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-mono text-accent-gold bg-accent-gold/10 px-1.5 py-0.5 rounded border border-accent-gold/20 truncate max-w-[150px]">
                  {activeMovie.episode_current}
                </span>
                <span className="text-[9px] text-text-muted font-medium">
                  {activeMovie.lang}
                </span>
              </div>
            </div>

            {/* Middle Notch separator */}
            <div className="relative flex items-center justify-between my-1">
              <div className="absolute left-[-26px] w-4 h-4 rounded-full bg-bg-void border-r border-border/50" />
              <div className="w-full border-t border-dashed border-border/80" />
              <div className="absolute right-[-26px] w-4 h-4 rounded-full bg-bg-void border-l border-border/50" />
            </div>

            {/* Ticket Footer details */}
            <div className="grid grid-cols-3 gap-2 text-center py-1">
              <div className="flex flex-col">
                <span className="font-mono text-[8px] text-text-muted uppercase">Phòng</span>
                <span className="font-mono text-[10px] text-text-secondary font-bold">VJ-02</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[8px] text-text-muted uppercase">Ghế</span>
                <span className="font-mono text-[10px] text-text-secondary font-bold">F-12 · VIP</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[8px] text-text-muted uppercase">Mã vé</span>
                <span className="font-mono text-[10px] text-accent-gold font-bold">#VJ-{activeMovie.year || "7789"}</span>
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="mt-1.5 pt-2 border-t border-border/80 flex flex-col gap-1.5 items-center">
              <div className="barcode" />
              <span className="font-mono text-[8px] text-text-muted tracking-[0.25em] truncate max-w-full">
                VJ-{activeMovie.slug.slice(0, 10).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Slide Switch Arrows & Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6 bg-black/35 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
        <button
          onClick={handlePrev}
          className="text-text-secondary hover:text-accent-gold transition-colors p-1 cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex gap-2.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeIndex ? "w-6 bg-accent-gold" : "w-2 bg-text-muted/50 hover:bg-text-secondary"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
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
