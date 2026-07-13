'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search as SearchIcon, XCircle, Loader2 } from "lucide-react";
import { phimApi } from "@/api/phim.api";
import { Movie } from "@/types/movie";
import MovieCard from "@/components/movie/MovieCard";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (!query) {
      const timer = setTimeout(() => {
        setMovies([]);
        setTotalResults(0);
        setTotalPages(1);
      }, 0);
      return () => clearTimeout(timer);
    }

    const fetchSearchData = async () => {
      setLoading(true);
      try {
        const res = await phimApi.searchMovies(query, page);
        if (res.status) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalResults(res.pagination.totalItems || 0);
          setMovies(res.items);
        } else {
          setMovies([]);
          setTotalPages(1);
          setTotalResults(0);
        }
      } catch (error) {
        console.error("Movie search error:", error);
        setMovies([]);
        setTotalPages(1);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchData();
    window.scrollTo(0, 0);
  }, [query, page]);

  const handlePageChange = (newPage: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('page', newPage.toString());
    router.push(`/tim-kiem?${current.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 py-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-3 tracking-tight">
            <SearchIcon className="text-accent-gold" size={32} />
            <span>Tìm kiếm phim</span>
          </h1>
          {query && !loading ? (
            <p className="text-text-secondary text-sm">
              Kết quả tìm kiếm cho từ khóa: <span className="text-text-primary font-bold italic">&ldquo;{query}&rdquo;</span> ({totalResults} phim được tìm thấy)
            </p>
          ) : (
            <p className="text-text-secondary text-sm">
              Nhập từ khóa để tìm kiếm các bộ phim yêu thích của bạn
            </p>
          )}
        </div>
      </div>

      {!query ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <SearchIcon size={80} className="text-bg-elevated mb-6" />
          <h2 className="text-xl font-bold text-text-secondary">
            Nhập từ khóa để bắt đầu tìm kiếm
          </h2>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="animate-spin text-accent-gold" size={48} />
          <p className="font-bold text-base text-text-secondary animate-pulse">
            Đang tìm kiếm phim...
          </p>
        </div>
      ) : movies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-x-4 gap-y-12">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-12 select-none">
              <button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3.5 py-1.5 rounded bg-bg-surface border border-border hover:border-accent-gold hover:text-accent-gold disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-primary text-xs font-semibold transition-colors cursor-pointer"
              >
                Trước
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                let pNum = page;
                if (page <= 3) {
                  pNum = idx + 1;
                } else if (page >= totalPages - 2) {
                  pNum = totalPages - 4 + idx;
                } else {
                  pNum = page - 2 + idx;
                }

                if (pNum < 1 || pNum > totalPages) return null;

                return (
                  <button
                    key={pNum}
                    onClick={() => handlePageChange(pNum)}
                    className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors border cursor-pointer
                      ${page === pNum
                        ? 'bg-accent-gold text-bg-void border-accent-gold'
                        : 'bg-bg-surface border-border hover:border-accent-gold hover:text-accent-gold'
                      }`}
                  >
                    {pNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3.5 py-1.5 rounded bg-bg-surface border border-border hover:border-accent-gold hover:text-accent-gold disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-primary text-xs font-semibold transition-colors cursor-pointer"
              >
                Sau
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-bg-surface rounded-lg border border-border border-dashed px-6">
          <XCircle size={48} className="text-accent-gold mb-6" />
          <h2 className="text-xl font-semibold mb-2">
            Không tìm thấy phim phù hợp
          </h2>
          <p className="text-text-secondary text-sm max-w-sm">
            Thử tìm kiếm với một từ khóa khác hoặc kiểm tra lại lỗi chính tả.
          </p>
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-accent-gold w-10 h-10" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
