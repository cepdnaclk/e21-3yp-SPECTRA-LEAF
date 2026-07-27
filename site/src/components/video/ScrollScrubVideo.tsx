"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Pause, Play } from "lucide-react";
import { useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getAssetPath } from "@/lib/paths";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type VideoStory = {
  label: string;
  title: string;
  description: string;
};

export function ScrollScrubVideo({
  source,
  eyebrow,
  scenes,
  tone = "green",
}: {
  source: string;
  eyebrow: string;
  scenes: VideoStory[];
  tone?: "green" | "copper";
}) {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const sceneRefs = useRef<Array<HTMLDivElement | null>>([]);
  const metadataReady = useRef(false);
  const active = useRef(false);
  const raf = useRef(0);
  const reduced = useReducedMotion();
  const [inlinePlaying, setInlinePlaying] = useState(false);

  useGSAP(
    () => {
      const root = rootRef.current;
      const media = videoRef.current;
      if (!root || !media) return;
      const playbackMedia: HTMLVideoElement = media;

      const loadObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !media.src) {
            media.src = getAssetPath(source);
            media.load();
            loadObserver.disconnect();
          }
        },
        { rootMargin: "900px 0px" },
      );
      loadObserver.observe(root);

      const onMetadata = () => {
        metadataReady.current = Number.isFinite(media.duration) && media.duration > 0;
        if (!metadataReady.current) return;

        updateStory(media.currentTime / media.duration);
        if (active.current) void startPlayback();
        ScrollTrigger.refresh();
      };
      media.addEventListener("loadedmetadata", onMetadata);
      media.addEventListener("durationchange", onMetadata);

      if (reduced) {
        sceneRefs.current.forEach((scene) => {
          if (scene) gsap.set(scene, { opacity: 1, y: 0 });
        });
        return () => {
          loadObserver.disconnect();
          media.removeEventListener("loadedmetadata", onMetadata);
          media.removeEventListener("durationchange", onMetadata);
        };
      }

      function updateStory(rawProgress: number) {
        const progress = Math.max(0, Math.min(1, rawProgress));
        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${progress})`;
        }
        sceneRefs.current.forEach((scene, index) => {
          if (!scene) return;
          const center = scenes.length === 1 ? 0.5 : index / (scenes.length - 1);
          const distance = Math.abs(progress - center);
          const opacity = Math.max(0, Math.min(1, 1 - distance * (scenes.length - 0.7)));
          const y = (progress - center) * -38;
          gsap.set(scene, { opacity, y, pointerEvents: opacity > 0.5 ? "auto" : "none" });
        });
      }

      function renderPlayback() {
        raf.current = 0;
        if (metadataReady.current && Number.isFinite(playbackMedia.duration) && playbackMedia.duration > 0) {
          updateStory(playbackMedia.currentTime / playbackMedia.duration);
        }
        if (active.current && !playbackMedia.paused && !playbackMedia.ended) {
          raf.current = window.requestAnimationFrame(renderPlayback);
        }
      }

      async function startPlayback() {
        if (!metadataReady.current) return;
        if (playbackMedia.ended || playbackMedia.currentTime >= playbackMedia.duration - 0.08) {
          playbackMedia.currentTime = 0;
          updateStory(0);
        }
        try {
          await playbackMedia.play();
          window.cancelAnimationFrame(raf.current);
          raf.current = window.requestAnimationFrame(renderPlayback);
        } catch {
          // Muted autoplay can still be blocked by strict browser settings.
        }
      }

      const trigger = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        onEnter: () => {
          active.current = true;
          void startPlayback();
        },
        onEnterBack: () => {
          active.current = true;
          void startPlayback();
        },
        onLeave: () => {
          active.current = false;
          media.pause();
        },
        onLeaveBack: () => {
          active.current = false;
          media.pause();
        },
      });

      return () => {
        active.current = false;
        window.cancelAnimationFrame(raf.current);
        raf.current = 0;
        trigger.kill();
        loadObserver.disconnect();
        media.pause();
        media.removeEventListener("loadedmetadata", onMetadata);
        media.removeEventListener("durationchange", onMetadata);
      };
    },
    { scope: rootRef, dependencies: [reduced, scenes.length, source] },
  );

  const toggleInline = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      await video.play();
      setInlinePlaying(true);
    } else {
      video.pause();
      setInlinePlaying(false);
    }
  };

  return (
    <section
      ref={rootRef}
      className={`scrub-story scrub-story-autoplay scrub-story-${tone} ${reduced ? "scrub-story-reduced" : ""}`}
      aria-label={eyebrow}
    >
      <div className="scrub-sticky">
        <div className="video-shell">
          <div className="video-placeholder" aria-hidden="true">
            <span>FERMENTATION VISUAL / LOADING</span>
          </div>
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            aria-label={`${eyebrow} project video`}
          >
            Your browser does not support the project video. The accompanying text describes the complete story.
          </video>
          <div className="video-vignette" aria-hidden="true" />
          <div className="scrub-topline">
            <span>{eyebrow}</span>
            <span>{reduced ? "MANUAL PLAYBACK" : "AUTO-PLAY · SCROLL TO CONTINUE"}</span>
          </div>
          <div className="scene-stack">
            {scenes.map((scene, index) => (
              <div
                key={scene.title}
                ref={(node) => { sceneRefs.current[index] = node; }}
                className="video-scene"
              >
                <span>{scene.label}</span>
                <h2>{scene.title}</h2>
                <p>{scene.description}</p>
              </div>
            ))}
          </div>
          {reduced && (
            <button className="inline-video-control" type="button" onClick={toggleInline}>
              {inlinePlaying ? <Pause /> : <Play />} {inlinePlaying ? "Pause video" : "Play video"}
            </button>
          )}
          <div className="scrub-progress" aria-hidden="true"><span ref={progressRef} /></div>
        </div>
      </div>
    </section>
  );
}
