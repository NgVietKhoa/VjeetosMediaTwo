'use client';

import React from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { Movie } from '@/types/movie';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  // Extract category display string
  const categoryStr = Array.isArray(movie.category)
    ? movie.category.map((c) => c.name).join(', ')
    : movie.category || '';

  return (
    <Link href={`/phim/chi-tiet/${movie.slug}`} className="group relative block rounded-lg overflow-hidden border border-border bg-bg-surface hover:border-accent-gold transition-all duration-180 ease-out hover:scale-104 select-none">
      {/* Aspect Ratio Box (2:3) */}
      <div className="relative w-full aspect-[2/3] bg-bg-elevated overflow-hidden">
        <img
          src={movie.poster_url || movie.thumb_url || '/placeholder.png'}
          alt={movie.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-void/90 via-transparent to-transparent opacity-100" />

        {/* Quality Tag - Top Left */}
        {movie.quality && (
          <span className="absolute top-2 left-2 bg-bg-void/70 backdrop-blur-sm text-text-primary font-mono text-[10px] font-semibold px-2 py-0.5 rounded-sm border border-border select-none">
            {movie.quality}
          </span>
        )}

        {/* Episode current / Status Tag - Top Right */}
        {movie.episode_current && (
          <span className="absolute top-2 right-2 bg-accent-crimson text-[#FCEBEB] text-[10px] font-semibold px-2 py-0.5 rounded-sm shadow-md rounded-tr-none select-none transform rotate-[2deg]">
            {movie.episode_current}
          </span>
        )}

        {/* Play Button Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-bg-void/40 opacity-0 group-hover:opacity-100 transition-opacity duration-180">
          <div className="w-12 h-12 rounded-full bg-accent-gold hover:bg-accent-gold-hover text-bg-void flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-180">
            <Play size={20} className="fill-bg-void translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Info details */}
      <div className="p-3">
        <h3 className="font-display font-semibold text-sm text-text-primary line-clamp-1 group-hover:text-accent-gold transition-colors duration-180">
          {movie.name}
        </h3>
        <p className="text-[11px] text-text-secondary mt-1 line-clamp-1">
          {movie.year && <span>{movie.year}</span>}
          {movie.year && categoryStr && <span className="mx-1.5">•</span>}
          <span>{categoryStr}</span>
        </p>
      </div>
    </Link>
  );
};

export default MovieCard;
