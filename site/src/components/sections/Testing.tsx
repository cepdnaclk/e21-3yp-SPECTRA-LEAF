"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronRight, FlaskConical, Gauge, LockKeyhole, Workflow } from "lucide-react";
import { useState } from "react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { testingGroups } from "@/data/project";

const icons = [Workflow, Gauge, LockKeyhole, FlaskConical];

export function Testing() {
  const [active, setActive] = useState(0);
  const group = testingGroups[active];

  return (
    <section id="testing" className="section testing-section">
      <SectionHeading
        index="10"
        eyebrow="Testing + CI/CD"
        title="Confidence is engineered at every boundary."
        description="Statuses are editable project markers, not claimed pass rates. The test strategy spans delivery, security, cloud parity and edge resilience."
      />
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
                onClick={() => setActive(index)}
              >
                <Icon /><span><strong>{item.name}</strong><small>{item.status}</small></span><ChevronRight />
              </button>
            );
          })}
        </div>
        <div id="testing-panel" className="testing-panel" role="tabpanel" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div key={group.name} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
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
      <div className="testing-note">Security validation scope includes SRP authentication, no plaintext password transmission, JWT authorization, token refresh and intermittent Wi-Fi session handling. Hardware scope includes watchdog behaviour and Device Shadow resynchronization.</div>
    </section>
  );
}
