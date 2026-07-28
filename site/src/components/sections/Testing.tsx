"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { CheckCircle2, ChevronRight, FlaskConical, Gauge, LockKeyhole, Workflow } from "lucide-react";
import { useRef, useState } from "react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { testingGroups } from "@/data/project";

const icons = [Workflow, Gauge, LockKeyhole, FlaskConical];

export function Testing() {
  const [active, setActive] = useState(0);
  const storyRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ["start start", "end end"],
  });
  const group = testingGroups[active];

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = Math.min(testingGroups.length - 1, Math.floor(progress * testingGroups.length));
    setActive(next);
  });

  const goToGroup = (index: number) => {
    setActive(index);
    const story = storyRef.current;
    if (!story) return;

    const storyTop = window.scrollY + story.getBoundingClientRect().top;
    const travel = Math.max(1, story.offsetHeight - window.innerHeight);
    const destination = storyTop + travel * (index / (testingGroups.length - 1));
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
                    aria-selected={active === index}
                    aria-controls="testing-panel"
                    className={active === index ? "active" : ""}
                    onClick={() => goToGroup(index)}
                  >
                    <Icon /><span><strong>{item.name}</strong><small>{item.status}</small></span><ChevronRight />
                  </button>
                );
              })}
            </div>
            <div id="testing-panel" className="testing-panel" role="tabpanel" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div key={group.name} initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.28 }}>
                  <div className="testing-panel-head"><span>TEST SUITE / {String(active + 1).padStart(2, "0")}</span><em className={`status-${group.status.toLowerCase().replaceAll(" ", "-")}`}>{group.status}</em></div>
                  <h3>{group.name}</h3>
                  <p>The following work areas define the validation scope for this layer.</p>
                  <div className="testing-checks">
                    {group.items.map((item) => <div key={item}><CheckCircle2 /><span>{item}</span><small>Editable status</small></div>)}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="testing-stage-label" aria-hidden="true">
            <span>{String(active + 1).padStart(2, "0")}</span>
            <i />
            <span>{String(testingGroups.length).padStart(2, "0")}</span>
          </div>
        </div>
      </div>
      <div className="testing-note">Security validation scope includes SRP authentication, no plaintext password transmission, JWT authorization, token refresh and intermittent Wi-Fi session handling. Hardware scope includes watchdog behaviour and Device Shadow resynchronization.</div>
    </section>
  );
}
