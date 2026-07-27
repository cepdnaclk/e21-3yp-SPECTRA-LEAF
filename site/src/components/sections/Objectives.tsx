"use client";

import { motion } from "framer-motion";
import { Database, Gauge, ScanLine, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { project } from "@/data/project";

const icons = [ScanLine, Gauge, Database, Sparkles];

export function Objectives() {
  return (
    <section id="objectives" className="section objectives">
      <SectionHeading
        index="02"
        eyebrow="Key objectives"
        title="A deliberate path from observation to automation."
        description="Four connected capabilities create value now while preparing the system for future intelligence."
      />
      <div className="objective-track">
        {project.objectives.map((objective, index) => {
          const Icon = icons[index];
          return (
            <motion.article
              key={objective.title}
              className="objective-card"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="objective-index">0{index + 1}</div>
              <Icon aria-hidden="true" />
              <h3>{objective.title}</h3>
              <p>{objective.text}</p>
              <span className="objective-node" aria-hidden="true" />
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
