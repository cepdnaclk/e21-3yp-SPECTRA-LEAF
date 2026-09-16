"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getAssetPath } from "@/lib/paths";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const filmSource = "/assets/complete-vedio-scroll-optimized.mp4?v=20260916c";

const moments = [
  {
    label: "SENSOR ASSEMBLY",
    title: "Build the sensing layer.",
    description: "Mount the temperature, humidity, gas and vision sensors that observe the leaf bed.",
  },
  {
    label: "PUMP + PCB",
    title: "Integrate flow control and the custom PCB.",
    description: "Connect the pump system, relay interfaces and the project-specific controller board.",
  },
  {
    label: "FINAL DEVICE",
    title: "Complete the full device assembly.",
    description: "Bring sensing, flow control, enclosure and edge connectivity together as one operational unit.",
  },
];

export function ProductVideos() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const momentRefs = useRef<Array<HTMLLIElement | null>>([]);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const section = sectionRef.current;
      const media = videoRef.current;
      if (!section || !media) return;

      let metadataReady = false;
      let targetProgress = 0;
      let renderedProgress = 0;
      let lastSeekAt = 0;
      let frameRequest = 0;
      let trigger: ScrollTrigger | undefined;

      const updateInterface = (progress: number) => {
        const activeMoment = Math.min(moments.length - 1, Math.floor(progress * moments.length));
        momentRefs.current.forEach((moment, index) => {
          if (!moment) return;
          const isDone = progress >= (index + 1) / moments.length;
          moment.classList.toggle("is-active", index === activeMoment);
          moment.classList.toggle("is-done", isDone);
        });
      };

      const renderFrame = (timestamp: number) => {
        frameRequest = 0;
        if (!metadataReady) return;

        const distance = targetProgress - renderedProgress;
        renderedProgress += distance * 0.14;
        if (Math.abs(distance) < 0.00015) renderedProgress = targetProgress;

        const targetTime = Math.min(media.duration - 0.001, renderedProgress * media.duration);
        const settled = renderedProgress === targetProgress;
        if (!media.seeking && (timestamp - lastSeekAt >= 32 || settled) && Math.abs(media.currentTime - targetTime) > 1 / 60) {
          media.currentTime = targetTime;
          lastSeekAt = timestamp;
        }
        updateInterface(renderedProgress);

        if (!settled || media.seeking) frameRequest = window.requestAnimationFrame(renderFrame);
      };

      const queueFrame = (progress: number) => {
        targetProgress = Math.max(0, Math.min(1, progress));
        if (!frameRequest) frameRequest = window.requestAnimationFrame(renderFrame);
      };

      const onSeeked = () => {
        if (!frameRequest && Math.abs(targetProgress - renderedProgress) > 0.00015) {
          frameRequest = window.requestAnimationFrame(renderFrame);
        }
      };

      const onMetadata = () => {
        metadataReady = Number.isFinite(media.duration) && media.duration > 0;
        if (!metadataReady) return;
        const scrollHeight = Math.max(420, Math.min(760, media.duration * 20));
        if (!reduced) section.style.height = `${scrollHeight}svh`;
        else section.style.removeProperty("height");
        media.pause();
        renderedProgress = trigger?.progress ?? 0;
        queueFrame(renderedProgress);
        window.requestAnimationFrame(() => ScrollTrigger.refresh());
      };

      media.addEventListener("loadedmetadata", onMetadata);
      media.addEventListener("durationchange", onMetadata);
      media.addEventListener("seeked", onSeeked);
      if (media.readyState >= HTMLMediaElement.HAVE_METADATA) onMetadata();

      if (!reduced) {
        trigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => queueFrame(self.progress),
          onRefresh: (self) => queueFrame(self.progress),
        });
      } else {
        updateInterface(0);
      }

      return () => {
        window.cancelAnimationFrame(frameRequest);
        trigger?.kill();
        media.pause();
        media.removeEventListener("loadedmetadata", onMetadata);
        media.removeEventListener("durationchange", onMetadata);
        media.removeEventListener("seeked", onSeeked);
      };
    },
    { scope: sectionRef, dependencies: [reduced] },
  );

  return (
    <section
      ref={sectionRef}
      id="product-videos"
      className={`section product-video-section ${reduced ? "product-video-reduced" : ""}`}
      aria-labelledby="product-video-title"
    >
      <div className="product-video-sticky">
        <div className="product-video-stage">
          <video
            ref={videoRef}
            src={getAssetPath(filmSource)}
            muted
            playsInline
            preload="auto"
            controls={reduced}
            aria-label="Spectra Leaf device assembly film"
          >
            Your browser does not support the product film.
          </video>
          <div className="product-video-shade" aria-hidden="true" />
        </div>

        <div className="product-video-grid">
          <div className="product-video-copy">
            <div className="section-kicker">
              <span>ASSEMBLY FILM</span>
              <span>Scroll-driven build sequence</span>
            </div>
            <h2 id="product-video-title">From components to one complete device.</h2>
            <p className="product-video-lead">
              Scroll through the three assembly stages, from the first sensor connection to the finished enclosure.
            </p>

            <ol className="product-video-moments" aria-label="Device assembly stages">
              {moments.map((moment, index) => (
                <li
                  key={moment.label}
                  ref={(node) => { momentRefs.current[index] = node; }}
                  className={index === 0 ? "is-active" : ""}
                >
                  <span>0{index + 1}</span>
                  <div>
                    <small>{moment.label}</small>
                    <strong>{moment.title}</strong>
                    <p>{moment.description}</p>
                  </div>
                </li>
              ))}
            </ol>

          </div>
        </div>
      </div>
    </section>
  );
}
