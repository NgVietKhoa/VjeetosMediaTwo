"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieDetail } from "@/types/movie";
import MovieCard from "@/components/movie/MovieCard";
import SprocketDivider from "@/components/common/SprocketDivider";
import { scrollContainerByOneCard } from "@/utils/scroll";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { useRecommendations } from "@/hooks/useRecommendations";

interface RecommendationsCarouselProps {
  slug?: string;
  movieType?: MovieDetail["type"];
  className?: string;
}

export default function RecommendationsCarousel({
  slug,
  movieType,
  className = "w-full max-w-[1800px] mx-auto px-4 sm:px-6 mt-12 sm:mt-16",
}: RecommendationsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInViewOnce<HTMLDivElement>({ rootMargin: "240px 0px" });
  const movies = useRecommendations(slug, movieType, inView);

  return (
    <div ref={ref} className={className}>
      {movies.length === 0 ? null : (
        <>
          <div className="w-full my-8">
            <SprocketDivider />
          </div>
          <div className="mb-6 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-accent-gold" />
            <h3 className="text-base font-semibold text-text-primary sm:text-xl">
              Đề xuất cho bạn
            </h3>
          </div>
          <div className="relative group/rec w-full">
            <button
              type="button"
              onClick={() => scrollContainerByOneCard(scrollRef.current, "left")}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-bg-surface/90 border border-border/80 text-text-primary flex items-center justify-center opacity-0 group-hover/rec:opacity-100 transition-opacity hover:border-accent-gold cursor-pointer shadow-lg"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scrollContainerByOneCard(scrollRef.current, "right")}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-bg-surface/90 border border-border/80 text-text-primary flex items-center justify-center opacity-0 group-hover/rec:opacity-100 transition-opacity hover:border-accent-gold cursor-pointer shadow-lg"
            >
              <ChevronRight size={20} />
            </button>
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pt-2 pb-4 px-2 -mx-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
            >
              {movies.map((recMovie) => (
                <div
                  key={recMovie._id}
                  className="flex-shrink-0 w-[140px] sm:w-[170px] md:w-[190px] snap-start"
                >
                  <MovieCard movie={recMovie} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
