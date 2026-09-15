"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckCircle2, ChevronRight, FlaskConical, Gauge, LockKeyhole, Workflow } from "lucide-react";
import { useRef, useState } from "react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { testingGroups } from "@/data/project";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const icons = [Workflow, Gauge, LockKeyhole, FlaskConical];

export function Testing() {
  const [active, setActive] = useState(0);
  const storyRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const group = testingGroups[active];

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.create({
        trigger: storyRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: ({ progress }) => setActive(Math.min(testingGroups.length - 1, Math.floor(progress * testingGroups.length))),
      });
    });
    return () => media.revert();
  }, { scope: storyRef });

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(panelRef.current?.children || [], {
      opacity: 0, y: 10, duration: 0.4, stagger: 0.04,
      ease: "power2.out", clearProps: "transform,opacity",
    });
  }, { scope: panelRef, dependencies: [active, reduced], revertOnUpdate: true });

  const goToGroup = (index: number) => {
    setActive(index);
    if (reduced) return;
    const story = storyRef.current;
    if (!story) return;

    const storyTop = window.scrollY + story.getBoundingClientRect().top;
    const travel = Math.max(1, story.offsetHeight - window.innerHeight);
    const destination = storyTop + travel * ((index + 0.1) / testingGroups.length);
    window.scrollTo({ top: destination, behavior: "smooth" });
  };

  return (
    <section id="testing" className="section testing-section">
      <SectionHeading
        index="11"
        eyebrow="Testing + CI/CD"
        title="Confidence is engineered at every boundary."
        description="Statuses are editable project markers, not claimed pass rates. The test strategy spans delivery, security, cloud parity and edge resilience."
      />
      <div ref={storyRef} className="testing-scroll-story">
        <div className="testing-sticky">
          <div className="testing-progress" aria-hidden="true">
            <span style={{ width: `${((active + 1) / testingGroups.length) * 100}%` }} />
          </div>
          <div className="testing-layout">
            <div className="testing-tabs" role="tablist" aria-label="Testing categories">
              {testingGroups.map((item, index) => {
                const Icon = icons[index];
                return (
                  <button
                    key={item.name}
                    type="button"
                    role="tab"
                    id={`testing-tab-${index}`}
                    tabIndex={active === index ? 0 : -1}
                    aria-selected={active === index}
                    aria-controls="testing-panel"
                    className={active === index ? "active" : ""}
                    onClick={() => goToGroup(index)}
                    onKeyDown={(event) => {
                      let next = index;
                      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % testingGroups.length;
                      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + testingGroups.length) % testingGroups.length;
                      else if (event.key === "Home") next = 0;
                      else if (event.key === "End") next = testingGroups.length - 1;
                      else return;
                      event.preventDefault();
                      document.getElementById(`testing-tab-${next}`)?.focus();
                      goToGroup(next);
                    }}
                  >
                    <Icon /><span><strong>{item.name}</strong><small>{item.status}</small></span><ChevronRight />
                  </button>
                );
              })}
            </div>
            <div id="testing-panel" className="testing-panel" role="tabpanel" aria-labelledby={`testing-tab-${active}`} tabIndex={0}>
                <div ref={panelRef}>
                  <div className="testing-panel-head"><span>TEST SUITE / {String(active + 1).padStart(2, "0")}</span><em className={`status-${group.status.toLowerCase().replaceAll(" ", "-")}`}>{group.status}</em></div>
                  <h3>{group.name}</h3>
                  <p>The following work areas define the validation scope for this layer.</p>
                  <div className="testing-checks">
                    {group.items.map((item) => <div key={item}><CheckCircle2 /><span>{item}</span><small>Editable status</small></div>)}
                  </div>
                </div>
            </div>
          </div>
          <div className="testing-stage-label" aria-hidden="true">
            <span>{String(active + 1).padStart(2, "0")}</span>
            <i />
            <span>{String(testingGroups.length).padStart(2, "0")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
