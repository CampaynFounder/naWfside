"use client";
import { useState, useEffect, useRef } from "react";
import CardHeaderWave from "./CardHeaderWave.client";

const OPTIONS: IntersectionObserverInit = {
  root: null,
  rootMargin: "100px 0px",
  threshold: 0,
};

/**
 * Only mounts CardHeaderWave when the container is in viewport.
 * Keeps active WebGL contexts under the browser limit (~8–16).
 */
export default function CardHeaderWaveInView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, OPTIONS);

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 h-full w-full">
      {inView && <CardHeaderWave />}
    </div>
  );
}
