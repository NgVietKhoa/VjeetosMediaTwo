"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useInViewOnce } from "@/hooks/useInViewOnce";

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  minHeight?: number | string;
  rootMargin?: string;
  /** Called once when the section first enters the viewport */
  onVisible?: () => void;
}

function PulseBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-bg-elevated border border-border/50 ${className ?? ""}`} />;
}

/** Title bar shared across section skeletons */
function SkeletonTitle({ wide = false }: { wide?: boolean }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <PulseBlock className={`h-7 ${wide ? "w-64 sm:w-80" : "w-48 sm:w-64"}`} />
    </div>
  );
}

/** Top 10 portrait cards rail */
export function Top10Skeleton() {
  return (
    <section className="py-8" aria-hidden="true">
      <SkeletonTitle />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[160px] sm:w-[200px] flex flex-col">
            <PulseBlock className="aspect-[2/3] rounded-2xl" />
            <div className="flex items-start mt-3 gap-2.5">
              <PulseBlock className="h-8 w-6 sm:h-10 sm:w-7 shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col gap-1.5 pt-1">
                <PulseBlock className="h-3 w-full" />
                <PulseBlock className="h-2.5 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Landscape cinema rail */
export function CinemaSkeleton() {
  return (
    <section className="py-8" aria-hidden="true">
      <SkeletonTitle wide />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[280px] sm:w-[320px] flex flex-col relative">
            <PulseBlock className="aspect-[16/9] rounded-2xl" />
            <div className="pl-[58px] sm:pl-[70px] mt-2.5 flex flex-col gap-1.5">
              <PulseBlock className="h-3.5 w-3/4" />
              <PulseBlock className="h-2.5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Combined Top10 + cinema block (same fetch) */
export function TopSeriesBlockSkeleton() {
  return (
    <div className="w-full">
      <Top10Skeleton />
      <div className="my-2 h-px w-full bg-border/40" />
      <CinemaSkeleton />
    </div>
  );
}

/** Anime showcase banner */
export function AnimeSkeleton() {
  return (
    <section className="py-8" aria-hidden="true">
      <SkeletonTitle wide />
      <PulseBlock className="w-full h-[380px] sm:h-[420px] lg:h-[480px] rounded-3xl" />
    </section>
  );
}

/** Regional country rows */
export function RegionalSkeleton() {
  return (
    <section className="py-8" aria-hidden="true">
      <div className="bg-bg-surface/50 border border-border/80 p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
        {Array.from({ length: 3 }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 items-center py-4 border-b border-border/40 last:border-b-0"
          >
            <div className="flex flex-col gap-2.5">
              <PulseBlock className="h-6 w-40" />
              <PulseBlock className="h-3 w-24" />
            </div>
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[180px] sm:w-[220px]">
                  <PulseBlock className="aspect-[16/10] rounded-lg" />
                  <div className="mt-2.5 flex flex-col gap-1.5 px-0.5">
                    <PulseBlock className="h-3 w-4/5" />
                    <PulseBlock className="h-2.5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Generic fallback (prefer typed skeletons above) */
export function SectionSkeleton({
  height = 240,
}: {
  height?: number | string;
}) {
  return (
    <div className="w-full py-8" style={{ minHeight: height }} aria-hidden="true">
      <SkeletonTitle />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[140px] sm:w-[170px]">
            <PulseBlock className="aspect-[2/3] rounded-xl" />
            <PulseBlock className="h-3 w-full mt-2.5" />
            <PulseBlock className="h-2.5 w-2/3 mt-1.5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LazySection({
  children,
  fallback,
  className,
  minHeight,
  rootMargin,
  onVisible,
}: LazySectionProps) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>({ rootMargin });
  const called = useRef(false);

  useEffect(() => {
    if (!inView || !onVisible || called.current) return;
    called.current = true;
    onVisible();
  }, [inView, onVisible]);

  return (
    <div
      ref={ref}
      className={className}
      style={!inView && minHeight != null ? { minHeight } : undefined}
    >
      {inView ? children : fallback ?? <SectionSkeleton height={minHeight ?? 280} />}
    </div>
  );
}
