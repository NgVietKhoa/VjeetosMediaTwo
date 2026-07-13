'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Clapperboard, Loader2, SlidersHorizontal } from 'lucide-react';
import MovieCard from '@/components/movie/MovieCard';
import Pagination from '@/components/common/Pagination';
import { phimApi } from '@/api/phim.api';
import { Movie, Genre, Country } from '@/types/movie';

function MovieListContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const typeFromUrl = (params?.type as string) || 'bo';

  const page = parseInt(searchParams.get('page') || '1', 10);
  const selectedCategory = searchParams.get('category') || '';
  const selectedCountry = searchParams.get('country') || '';
  const selectedYear = searchParams.get('year') || '';

  const selectedTitle = searchParams.get('title') || '';

  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const [genres, setGenres] = useState<Genre[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  // Local filter states (committed when user clicks "Lọc kết quả")
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempCategory, setTempCategory] = useState(selectedCategory);
  const [tempCountry, setTempCountry] = useState(selectedCountry);
  const [tempYear, setTempYear] = useState(selectedYear);
  const [tempType, setTempType] = useState(typeFromUrl);

  const getTitle = () => {
    if (selectedTitle) {
      return selectedTitle;
    }
    if (selectedCategory) {
      const genreObj = genres.find(g => g.slug === selectedCategory);
      return genreObj ? `Thể loại: ${genreObj.name}` : 'Danh sách phim';
    }
    if (selectedCountry) {
      const countryObj = countries.find(c => c.slug === selectedCountry);
      return countryObj ? `Quốc gia: ${countryObj.name}` : 'Danh sách phim';
    }
    if (selectedYear) {
      return `Năm sản xuất: ${selectedYear}`;
    }

    switch (typeFromUrl) {
      case 'bo':
        return 'Phim bộ';
      case 'le':
        return 'Phim lẻ';
      case 'hoat-hinh':
        return 'Phim hoạt hình';
      case 'tv-shows':
        return 'TV Shows';
      case 'moi':
        return 'Phim mới';
      case 'phim-chieu-rap':
        return 'Phim chiếu rạp';
      default:
        return 'Danh sách phim';
    }
  };

  const handleToggleFilter = () => {
    if (!isFilterOpen) {
      setTempCategory(selectedCategory);
      setTempCountry(selectedCountry);
      setTempYear(selectedYear);
      setTempType(typeFromUrl);
    }
    setIsFilterOpen(!isFilterOpen);
  };

  // Load genres, countries, and movies together
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [gRes, cRes, mRes] = await Promise.all([
          phimApi.getGenres(),
          phimApi.getCountries(),
          phimApi.getMovieList(typeFromUrl, {
            page,
            category: selectedCategory,
            country: selectedCountry,
            year: selectedYear,
          })
        ]);

        setGenres(gRes);
        setCountries(cRes);

        if (mRes && mRes.items) {
          setMovies(mRes.items);
          setTotalPages(mRes.pagination.totalPages || 1);
          setTotalItems(mRes.pagination.totalItems || 0);
        }
      } catch (err) {
        console.error("Error loading movie listing data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [typeFromUrl, page, selectedCategory, selectedCountry, selectedYear]);

  const handleApplyFilter = () => {
    const query = new URLSearchParams();
    if (tempCategory) query.set('category', tempCategory);
    if (tempCountry) query.set('country', tempCountry);
    if (tempYear) query.set('year', tempYear);
    
    // Redirect to type page with search parameters
    router.push(`/phim/${tempType}?${query.toString()}`);
    setIsFilterOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('page', newPage.toString());
    router.push(`/phim/${typeFromUrl}?${current.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const years = Array.from({ length: 2026 - 2010 + 1 }, (_, i) => (2026 - i).toString());

  // Show full-page loader until all data (movies/schemas) are loaded
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <Loader2 className="animate-spin text-accent-gold" size={48} />
        <p className="font-semibold text-sm text-text-secondary animate-pulse">Đang tải danh sách phim...</p>
      </div>
    );
  }

  return (
    <main className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 py-8 min-h-screen">
      {/* Header and Toggle Filter Button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-3 tracking-tight">
            <Clapperboard className="text-accent-gold" size={32} />
            <span>{getTitle()}</span>
          </h1>
          <p className="text-text-secondary text-sm">
            Tổng cộng có {totalItems} phim được tìm thấy
          </p>
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={handleToggleFilter}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer select-none active:scale-[0.98]
            ${isFilterOpen 
              ? 'border-accent-gold bg-accent-gold text-bg-void shadow-lg shadow-accent-gold/15'
              : 'border-border bg-bg-surface text-text-primary hover:border-accent-gold'
            }`}
        >
          <SlidersHorizontal size={14} />
          <span>Bộ lọc</span>
        </button>
      </div>

      {/* Custom Asymmetrical Filter Panel (matching screenshot design) */}
      {isFilterOpen && (
        <div className="bg-bg-surface border border-border/80 rounded-lg p-6 mb-8 flex flex-col gap-6 animate-fade-in shadow-2xl">
          {/* Header icon */}
          <div className="flex items-center gap-2 border-b border-border/80 pb-3">
            <SlidersHorizontal className="text-accent-gold" size={16} />
            <span className="text-sm font-bold uppercase tracking-wider text-text-primary">Bộ lọc phim nâng cao</span>
          </div>

          <div className="flex flex-col gap-5">
            {/* Row 1: Quốc gia */}
            <div className="grid grid-cols-[100px_1fr] items-start gap-4">
              <span className="text-xs font-bold uppercase text-text-muted mt-1.5">Quốc gia:</span>
              <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                <button
                  onClick={() => setTempCountry('')}
                  className={`px-3 py-1 rounded text-xs font-medium border transition-colors cursor-pointer
                    ${tempCountry === '' 
                      ? 'border-accent-gold bg-accent-gold/10 text-accent-gold font-semibold' 
                      : 'border-border bg-bg-elevated text-text-secondary hover:border-border-strong hover:text-text-primary'
                    }`}
                >
                  Tất cả
                </button>
                {countries.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => setTempCountry(c.slug)}
                    className={`px-3 py-1 rounded text-xs font-medium border transition-colors cursor-pointer
                      ${tempCountry === c.slug 
                        ? 'border-accent-gold bg-accent-gold/10 text-accent-gold font-semibold' 
                        : 'border-border bg-bg-elevated text-text-secondary hover:border-border-strong hover:text-text-primary'
                      }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-border/50" />

            {/* Row 2: Loại phim */}
            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
              <span className="text-xs font-bold uppercase text-text-muted">Loại phim:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Tất cả', slug: 'moi' },
                  { name: 'Phim lẻ', slug: 'le' },
                  { name: 'Phim bộ', slug: 'bo' },
                  { name: 'Hoạt hình', slug: 'hoat-hinh' },
                  { name: 'TV Shows', slug: 'tv-shows' },
                ].map((t) => (
                  <button
                    key={t.slug}
                    onClick={() => setTempType(t.slug)}
                    className={`px-3 py-1 rounded text-xs font-medium border transition-colors cursor-pointer
                      ${tempType === t.slug 
                        ? 'border-accent-gold bg-accent-gold/10 text-accent-gold font-semibold' 
                        : 'border-border bg-bg-elevated text-text-secondary hover:border-border-strong hover:text-text-primary'
                      }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-border/50" />

            {/* Row 3: Thể loại */}
            <div className="grid grid-cols-[100px_1fr] items-start gap-4">
              <span className="text-xs font-bold uppercase text-text-muted mt-1.5">Thể loại:</span>
              <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                <button
                  onClick={() => setTempCategory('')}
                  className={`px-3 py-1 rounded text-xs font-medium border transition-colors cursor-pointer
                    ${tempCategory === '' 
                      ? 'border-accent-gold bg-accent-gold/10 text-accent-gold font-semibold' 
                      : 'border-border bg-bg-elevated text-text-secondary hover:border-border-strong hover:text-text-primary'
                    }`}
                >
                  Tất cả
                </button>
                {genres.map((g) => (
                  <button
                    key={g.slug}
                    onClick={() => setTempCategory(g.slug)}
                    className={`px-3 py-1 rounded text-xs font-medium border transition-colors cursor-pointer
                      ${tempCategory === g.slug 
                        ? 'border-accent-gold bg-accent-gold/10 text-accent-gold font-semibold' 
                        : 'border-border bg-bg-elevated text-text-secondary hover:border-border-strong hover:text-text-primary'
                      }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-border/50" />

            {/* Row 4: Năm sản xuất */}
            <div className="grid grid-cols-[100px_1fr] items-start gap-4">
              <span className="text-xs font-bold uppercase text-text-muted mt-1.5">Năm sản xuất:</span>
              <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto pr-2 custom-scrollbar">
                <button
                  onClick={() => setTempYear('')}
                  className={`px-3 py-1 rounded text-xs font-medium border transition-colors cursor-pointer
                    ${tempYear === '' 
                      ? 'border-accent-gold bg-accent-gold/10 text-accent-gold font-semibold' 
                      : 'border-border bg-bg-elevated text-text-secondary hover:border-border-strong hover:text-text-primary'
                    }`}
                >
                  Tất cả
                </button>
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => setTempYear(y)}
                    className={`px-3 py-1 rounded text-xs font-medium border transition-colors cursor-pointer
                      ${tempYear === y 
                        ? 'border-accent-gold bg-accent-gold/10 text-accent-gold font-semibold' 
                        : 'border-border bg-bg-elevated text-text-secondary hover:border-border-strong hover:text-text-primary'
                      }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons at bottom */}
          <div className="flex items-center gap-3 pt-4 border-t border-border/80 mt-2">
            <button
              onClick={handleApplyFilter}
              className="px-6 py-2.5 bg-accent-gold hover:bg-accent-gold-hover text-bg-void rounded-full text-xs font-bold uppercase tracking-wider transition-all select-none active:scale-95 cursor-pointer shadow-lg shadow-accent-gold/15"
            >
              Lọc kết quả ➔
            </button>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="px-6 py-2.5 border border-border bg-bg-surface hover:bg-bg-elevated text-text-secondary hover:text-text-primary rounded-full text-xs font-bold uppercase tracking-wider transition-all select-none active:scale-95 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Movies Grid */}
      {movies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-x-4 gap-y-12">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-bg-surface rounded-lg border border-border border-dashed px-6">
          <p className="text-text-secondary text-sm max-w-sm mb-4">
            Không tìm thấy bộ phim nào khớp với các lựa chọn lọc hiện tại.
          </p>
          <button
            onClick={() => router.push(`/phim/${typeFromUrl}`)}
            className="px-4 py-2 bg-accent-gold hover:bg-accent-gold-hover text-bg-void text-xs font-bold rounded uppercase tracking-wider transition-all cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}
    </main>
  );
}

export default function MovieListPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="animate-spin text-accent-gold w-10 h-10" />
      </div>
    }>
      <MovieListContent />
    </Suspense>
  );
}
