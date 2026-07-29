"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getAssetPath } from "@/lib/paths";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const filmSource = "/assets/complete-vedio-scroll.mp4";

const moments = [
  {
    label: "OBSERVE",
    title: "Read the fermentation process.",
    description: "Temperature, gas and colour become a live picture of the changing tea leaf.",
  },
  {
    label: "CONNECT",
    title: "Carry every signal forward.",
    description: "ESP32 telemetry moves securely from the production floor into the cloud.",
  },
  {
    label: "DECIDE",
    title: "Turn process data into action.",
    description: "The dashboard gives operators timely context for a more consistent batch.",
  },
];

function formatTime(seconds: number) {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

export function ProductVideos() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const momentRefs = useRef<Array<HTMLLIElement | null>>([]);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const section = sectionRef.current;
      const media = videoRef.current;
      if (!section || !media) return;

      let metadataReady = false;
      let targetProgress = 0;
      let frameRequest = 0;
      let trigger: ScrollTrigger | undefined;

      const updateInterface = (progress: number) => {
        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${progress})`;
        }

        const currentTime = metadataReady ? progress * media.duration : 0;
        if (timeRef.current) {
          timeRef.current.textContent = `${formatTime(currentTime)} / ${formatTime(media.duration)}`;
        }
        if (statusRef.current) {
          statusRef.current.textContent =
            progress >= 0.998 ? "FILM COMPLETE · CONTINUE DOWN" : progress > 0.002 ? "SCROLLING FILM" : "SCROLL TO START";
        }

        const activeMoment = Math.min(moments.length - 1, Math.floor(progress * moments.length));
        momentRefs.current.forEach((moment, index) => {
          if (!moment) return;
          const isDone = progress >= (index + 1) / moments.length;
          moment.classList.toggle("is-active", index === activeMoment && progress < 0.998);
          moment.classList.toggle("is-done", isDone);
        });
      };

      const renderFrame = () => {
        frameRequest = 0;
        if (!metadataReady) return;

        const targetTime = Math.min(media.duration - 0.001, targetProgress * media.duration);
        if (Math.abs(media.currentTime - targetTime) > 1 / 30) {
          media.currentTime = targetTime;
        }
        updateInterface(targetProgress);
      };

      const queueFrame = (progress: number) => {
        targetProgress = Math.max(0, Math.min(1, progress));
        if (!frameRequest) frameRequest = window.requestAnimationFrame(renderFrame);
      };

      const onMetadata = () => {
        metadataReady = Number.isFinite(media.duration) && media.duration > 0;
        media.pause();
        queueFrame(trigger?.progress ?? 0);
      };

      media.addEventListener("loadedmetadata", onMetadata);
      media.addEventListener("durationchange", onMetadata);
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
            aria-label="Complete Spectra Leaf product film"
          >
            Your browser does not support the product film.
          </video>
          <div className="product-video-shade" aria-hidden="true" />
        </div>

        <div className="product-video-grid">
          <div className="product-video-copy">
            <div className="section-kicker">
              <span>03</span>
              <span>Complete product film</span>
            </div>
            <h2 id="product-video-title">From leaf to intelligence.</h2>
            <p className="product-video-lead">
              Follow the complete Spectra Leaf journey from fermentation sensing to connected, operator-ready insight.
            </p>

            <div className="product-video-meta" aria-label="Product film details">
              <span><small>Film</small><strong>Complete story</strong></span>
              <span><small>Duration</small><strong>30 seconds</strong></span>
              <span><small>Playback</small><strong>{reduced ? "Manual controls" : "Scroll controlled"}</strong></span>
            </div>

            <ol className="product-video-moments" aria-label="Film chapters">
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

            <div className="product-video-note">
              <i aria-hidden="true" />
              <span>{reduced ? "Use the video controls to watch the film" : "Keep scrolling to move through the film"}</span>
            </div>
          </div>

          <div className="product-video-bar" aria-live="polite">
            <span>PRODUCT FILM / COMPLETE</span>
            <span ref={statusRef}>{reduced ? "MANUAL PLAYBACK" : "SCROLL TO START"}</span>
          </div>

          <div className="product-video-progress" aria-hidden="true">
            <span ref={progressRef} />
          </div>
          <span ref={timeRef} className="product-video-time" aria-hidden="true">00:00 / 00:30</span>
        </div>
      </div>
    </section>
  );
}
