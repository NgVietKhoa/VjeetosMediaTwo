"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  page,
  totalPages,
  onChange,
  className = "flex flex-wrap items-center justify-center gap-2 mt-16 select-none",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
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
            type="button"
            key={pNum}
            onClick={() => onChange(pNum)}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors border cursor-pointer
              ${
                page === pNum
                  ? "bg-accent-gold text-bg-void border-accent-gold"
                  : "bg-bg-surface border-border hover:border-accent-gold hover:text-accent-gold"
              }`}
          >
            {pNum}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-3.5 py-1.5 rounded bg-bg-surface border border-border hover:border-accent-gold hover:text-accent-gold disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-primary text-xs font-semibold transition-colors cursor-pointer"
      >
        Sau
      </button>
    </div>
  );
}
