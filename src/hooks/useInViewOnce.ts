"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewOnceOptions {
  rootMargin?: string;
  threshold?: number;
}

/** Fires once when the element enters (or approaches) the viewport. */
export function useInViewOnce<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOnceOptions = {}
) {
  const { rootMargin = "280px 0px", threshold = 0.01 } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        observer.disconnect();
      },
      { rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, rootMargin, threshold]);

  return { ref, inView };
}
