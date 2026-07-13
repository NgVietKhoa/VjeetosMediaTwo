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

export function SectionSkeleton({
  height = 240,
}: {
  height?: number | string;
}) {
  return (
    <div
      className="w-full animate-pulse rounded-2xl border border-border/60 bg-bg-surface/40"
      style={{ height }}
      aria-hidden="true"
    >
      <div className="h-full w-full flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-accent-gold/40 border-t-accent-gold animate-spin" />
      </div>
    </div>
  );
}

export default function LazySection({
  children,
  fallback,
  className,
  minHeight = 240,
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
      style={!inView ? { minHeight } : undefined}
    >
      {inView ? children : fallback ?? <SectionSkeleton height={minHeight} />}
    </div>
  );
}
