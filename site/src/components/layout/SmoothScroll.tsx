"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function SmoothScroll({ children }: { children: ReactNode }) {
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.9,
      });
      const update = (time: number) => lenis.raf(time * 1000);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(update);
      gsap.ticker.lagSmoothing(0);
      return () => {
        gsap.ticker.remove(update);
        lenis.destroy();
      };
    });
    return () => media.revert();
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
