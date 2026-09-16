"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** One owner for page reveals. Interactive film and tab timelines keep their own state. */
export function SiteMotion() {
  useGSAP(() => {
    const root = document.getElementById("main-content");
    if (!root) return;
    const media = gsap.matchMedia();
    let disposed = false;

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const select = gsap.utils.selector(root);
      const hero = gsap.timeline({ delay: 1.25, defaults: { ease: "power3.out" } });
      hero.from(select(".hero .eyebrow"), { y: 10, opacity: 0, duration: 0.55 });
      hero.from(select(".hero h1 > span, .hero h1 > em"), {
        y: 30, opacity: 0, duration: 0.9, stagger: 0.045, clearProps: "transform,opacity",
      }, 0.1);
      hero.from(select(".hero h2, .hero-description, .hero-actions"), {
        y: 16, opacity: 0, duration: 0.75, stagger: 0.1, clearProps: "transform,opacity",
      }, 0.4);
      // A heading has its own sequence so text and metadata do not fade twice.
      select(".section-heading").forEach((heading: HTMLElement) => {
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: heading, start: "top 90%", once: true },
          defaults: { ease: "power3.out" },
        });
        timeline.from(heading.querySelector(".section-kicker"), { opacity: 0, y: 8, duration: 0.5 });
        timeline.from(heading.querySelectorAll("[data-word]"), {
          yPercent: 105, opacity: 0, duration: 0.8, stagger: 0.025,
          clearProps: "transform,opacity",
        }, 0.05);
        timeline.from(heading.querySelectorAll(":scope > p"), {
          opacity: 0, y: 12, duration: 0.7, clearProps: "transform,opacity",
        }, 0.22);
      });

      // Hardware image/copy pairs enter from their physical sides to reinforce the layout.
      select("[data-hardware-pair]").forEach((pair: HTMLElement) => {
        const visual = pair.querySelector<HTMLElement>("[data-hardware-visual]");
        const copy = pair.querySelector<HTMLElement>("[data-hardware-copy]");
        if (!visual || !copy) return;
        const visualX = pair.classList.contains("pcb-feature") ? -46 : 46;
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: pair, start: "top 88%", once: true },
          defaults: { duration: 1, ease: "power3.out", clearProps: "transform,opacity" },
        });
        timeline.from(visual, { x: visualX, opacity: 0, scale: .97 });
        timeline.from(copy, { x: -visualX, opacity: 0 }, 0.12);
      });

      select("[data-reveal]:not(.section-heading), .cloud-node, .ai-node, .stack-grid > div, .role-grid > article, .metrics > div, .firmware-flow > div, .process-steps > div").forEach((element: HTMLElement) => {
        // Children of a reveal are already carried by their parent animation.
        if (element.parentElement?.closest("[data-reveal]")) return;
        gsap.from(element, {
          opacity: 0, y: element.classList.contains("component-card") ? 0 : 20,
          duration: 0.8, delay: Number(element.dataset.revealDelay || 0),
          ease: "power3.out", clearProps: "transform,opacity",
          scrollTrigger: { trigger: element, start: "top 94%", once: true },
        });
      });

      // These headings contain intentional line breaks; animate the whole text intact.
      select(".objectives h2, .architecture h2, .conclusion h2").forEach((heading: HTMLElement) => {
        if (heading.closest("[data-reveal]")) return;
        gsap.from(heading, {
          y: 22, opacity: 0, duration: 1, ease: "power3.out",
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: heading, start: "top 92%", once: true },
        });
      });

      // Each section carries a quiet rule that fills as its story passes the viewport.
      select(".section").forEach((section: HTMLElement) => {
        gsap.fromTo(section, { "--section-travel": 0 }, {
          "--section-travel": 1, ease: "none",
          scrollTrigger: { trigger: section, start: "top 85%", end: "bottom 70%", scrub: 0.5 },
        });
      });

      select("[data-journey-pulse]").forEach((pulse: HTMLElement) => {
        gsap.fromTo(pulse, { top: "0%" }, {
          top: "98%", ease: "none",
          scrollTrigger: { trigger: pulse.parentElement, start: "top 65%", end: "bottom 65%", scrub: 0.4 },
        });
      });

      // Only decorative photography moves; engineering diagrams and dashboards stay exact.
      const desktop = gsap.matchMedia();
      desktop.add("(min-width: 900px) and (hover: hover) and (pointer: fine)", () => {
        select(".process-image img").forEach((image: HTMLElement) => {
          gsap.fromTo(image, { scale: 1.045, yPercent: -1 }, {
            scale: 1.045, yPercent: 1, ease: "none",
            scrollTrigger: { trigger: image.parentElement, start: "top bottom", end: "bottom top", scrub: 0.7 },
          });
        });
        const listeners: (() => void)[] = [];
        select(".cloud-grid article, .software-feature, .roadmap-grid article").forEach((card: HTMLElement) => {
          const icon = card.querySelector(".feature-icon, :scope > svg");
          if (!icon) return;
          const hover = gsap.to(icon, { y: -3, duration: 0.3, ease: "power2.out", paused: true });
          const enter = () => { hover.play(); };
          const leave = () => { hover.reverse(); };
          card.addEventListener("pointerenter", enter);
          card.addEventListener("pointerleave", leave);
          card.addEventListener("focusin", enter);
          card.addEventListener("focusout", leave);
          listeners.push(() => {
            card.removeEventListener("pointerenter", enter);
            card.removeEventListener("pointerleave", leave);
            card.removeEventListener("focusin", enter);
            card.removeEventListener("focusout", leave);
          });
        });
        return () => listeners.forEach((remove) => remove());
      });

      const galleryGrid = select(".gallery-grid")[0];
      if (galleryGrid) {
        gsap.from(select("[data-gallery-card]"), {
          opacity: 0,
          y: 18,
          duration: 0.65,
          stagger: 0.055,
          ease: "power2.out",
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: galleryGrid, start: "top 90%", once: true },
        });
      }

      const footer = document.querySelector(".footer");
      if (footer) gsap.from(footer.querySelectorAll(".footer-grid > div"), {
        y: 15, opacity: 0, duration: 0.7, stagger: 0.08, clearProps: "transform,opacity",
        scrollTrigger: { trigger: footer, start: "top 95%", once: true },
      });

      return () => desktop.revert();
    });

    // Fonts and lazy images can change downstream section positions.
    const refresh = () => { if (!disposed) ScrollTrigger.refresh(); };
    document.fonts.ready.then(refresh);
    root.addEventListener("load", refresh, true);
    return () => {
      disposed = true;
      root.removeEventListener("load", refresh, true);
      media.revert();
    };
  }, []);

  return null;
}
