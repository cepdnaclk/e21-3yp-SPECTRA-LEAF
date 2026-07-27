"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Leaf } from "lucide-react";
import { project } from "@/data/project";

export function Conclusion() {
  return (
    <section id="conclusion" className="conclusion">
      <div className="leaf-veins" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <span className="conclusion-mark"><Leaf /> CLOSING SIGNAL</span>
        <h2>Measure the process.<br />Understand the profile.<br /><em>Perfect the leaf.</em></h2>
        <p>Spectra Leaf bridges traditional tea-manufacturing expertise with modern digital infrastructure. The current platform improves fermentation visibility through synchronized sensor telemetry and remote factory guidance. Every monitored batch also contributes to a structured quality dataset—the foundation for future automated detection of the fermentation sweet spot.</p>
        <a href={project.githubUrl} target="_blank" rel="noreferrer">Explore the repository <ArrowUpRight /></a>
      </motion.div>
      <div className="conclusion-telemetry" aria-hidden="true">
        {Array.from({ length: 22 }, (_, index) => <i key={index} style={{ "--delay": `${index * 0.11}s`, "--x": `${(index * 47) % 100}%` } as React.CSSProperties} />)}
      </div>
    </section>
  );
}
