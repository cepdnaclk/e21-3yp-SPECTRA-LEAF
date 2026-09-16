"use client";

import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const range = document.documentElement.scrollHeight - window.innerHeight;
      const progress = range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
      if (circleRef.current) circleRef.current.style.strokeDashoffset = `${100 - progress * 100}`;
    };
    const scroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
    };
  }, []);

  return (
    <div className="page-progress" aria-hidden="true">
      <svg viewBox="0 0 44 44" focusable="false">
        <circle className="page-progress-track" cx="22" cy="22" r="19" />
        <circle ref={circleRef} className="page-progress-value" cx="22" cy="22" r="19" pathLength="100" />
      </svg>
      <span className="page-progress-arrow" />
    </div>
  );
}
