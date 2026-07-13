"use client";

import { useEffect, useState } from "react";
import { phimApi } from "@/api/phim.api";
import { Movie, MovieDetail } from "@/types/movie";

const TYPE_MAP: Record<string, string> = {
  series: "bo",
  single: "le",
  hoathinh: "hoat-hinh",
  tvshows: "tv-shows",
};

export function useRecommendations(
  slug: string | undefined,
  movieType: MovieDetail["type"] | undefined,
  enabled: boolean = true
) {
  const [recommendations, setRecommendations] = useState<Movie[]>([]);

  useEffect(() => {
    if (!enabled || !slug || !movieType) {
      if (!enabled) return;
      setRecommendations([]);
      return;
    }

    let cancelled = false;

    const fetchRecommendations = async () => {
      try {
        const typeKey = TYPE_MAP[movieType] || "moi";
        const recData = await phimApi.getMovieList(typeKey, { page: 1 });
        if (cancelled || !recData?.items) return;
        setRecommendations(
          recData.items.filter((item) => item.slug !== slug).slice(0, 24)
        );
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };

    fetchRecommendations();
    return () => {
      cancelled = true;
    };
  }, [slug, movieType, enabled]);

  return recommendations;
}
