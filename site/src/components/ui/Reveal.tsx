"use client";

import type { ReactNode } from "react";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={className}
      data-reveal
      data-reveal-delay={delay}
    >
      {children}
    </div>
  );
}
