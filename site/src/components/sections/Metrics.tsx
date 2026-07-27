"use client";

import { motion } from "framer-motion";
import { project } from "@/data/project";

export function Metrics() {
  return (
    <section className="metrics" aria-label="Project metrics">
      {project.metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08 }}
        >
          <strong>{metric.value}</strong>
          <span>{metric.label}</span>
          <small>{metric.detail}</small>
        </motion.div>
      ))}
    </section>
  );
}
