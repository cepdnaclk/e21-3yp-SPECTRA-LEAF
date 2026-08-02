"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { project } from "@/data/project";

export function Roadmap() {
  return (
    <section id="roadmap" className="section roadmap-section">
      <SectionHeading
        index="13"
        eyebrow="Future roadmap"
        title="From a focused prototype to a factory intelligence layer."
        description="Every card below is a future objective, not a current deployment claim."
      />
      <div className="roadmap-label">FUTURE OBJECTIVES</div>
      <div className="roadmap-grid">
        {project.roadmap.map((item, index) => (
          <motion.article key={item} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
            <span>{String(index + 1).padStart(2, "0")}</span><h3>{item}</h3><ArrowUpRight /><small>{index < 3 ? "SYSTEM SCALE" : index < 6 ? "INTELLIGENCE" : "DEPLOYMENT"}</small>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
