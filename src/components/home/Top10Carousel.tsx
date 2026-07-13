"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Movie } from "@/types/movie";
import { scrollContainerByOneCard } from "@/utils/scroll";

interface Top10CarouselProps {
  title: string;
  movies: Movie[];
  metaLine: (movie: Movie) => string;
}

export default function Top10Carousel({
  title,
  movies,
  metaLine,
}: Top10CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (movies.length === 0) return null;

  return (
    <section className="py-8">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
          {title}
        </h2>
      </div>
      <div className="relative group/top10 w-full">
        <button
          type="button"
          onClick={() => scrollContainerByOneCard(scrollRef.current, "left")}
          className="absolute left-3 top-[120px] sm:top-[150px] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-bg-surface/90 border border-border/80 text-text-primary flex items-center justify-center opacity-0 group-hover/top10:opacity-100 transition-opacity hover:border-accent-gold cursor-pointer shadow-lg"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={() => scrollContainerByOneCard(scrollRef.current, "right")}
          className="absolute right-3 top-[120px] sm:top-[150px] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-bg-surface/90 border border-border/80 text-text-primary flex items-center justify-center opacity-0 group-hover/top10:opacity-100 transition-opacity hover:border-accent-gold cursor-pointer shadow-lg"
        >
          <ChevronRight size={20} />
        </button>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {movies.map((movie, index) => (
            <Link
              key={movie._id}
              href={`/movies/detail/${movie.slug}`}
              className="flex-shrink-0 w-[160px] sm:w-[200px] group/card snap-start flex flex-col"
            >
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-border group-hover/card:border-accent-gold transition-all duration-180 bg-bg-elevated">
                <img
                  src={movie.poster_url || movie.thumb_url || "/placeholder.png"}
                  alt={movie.name}
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute bottom-2 left-2 bg-bg-void/70 backdrop-blur-sm text-text-primary font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-border">
                  {movie.quality}
                </span>
                <div className="absolute inset-0 bg-bg-void/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-180 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-accent-gold flex items-center justify-center transform scale-90 group-hover/card:scale-100 transition-transform duration-180">
                    <Play
                      size={16}
                      className="fill-bg-void text-bg-void translate-x-0.5"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-start mt-3 px-0.5">
                <span className="text-3xl sm:text-4xl font-display font-black italic text-accent-gold shrink-0 select-none mr-2.5 mt-0.5">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-text-primary group-hover/card:text-accent-gold transition-colors truncate leading-tight">
                    {movie.name}
                  </h4>
                  <p className="text-[10px] text-text-secondary truncate mt-0.5 font-medium">
                    {movie.origin_name}
                  </p>
                  <p className="text-[10px] text-text-muted truncate font-mono mt-0.5">
                    {metaLine(movie)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
