"use client";

import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Database, Factory, ScanLine } from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const stages = [
  "Start Batch",
  "Assign Batch ID",
  "Stream Sensor Telemetry",
  "Store Time-Series Data",
  "Complete Fermentation",
  "Enter Final GLP",
  "Clean + Label Dataset",
  "Train Future ML Model",
  "Predict Fermentation Stage",
  "Alert Factory Officer",
];

export function DataPipeline() {
  return (
    <section id="data" className="section data-section">
      <SectionHeading
        index="07"
        eyebrow="Data pipeline"
        title="The system guides today while learning for tomorrow."
        description="The data strategy closes the loop between the evolving process and expert-evaluated final quality."
      />
      <div className="data-statement">
        <Reveal>
          <p>Open datasets correlating detailed tea-fermentation sensor readings with final quality measurements are limited.</p>
        </Reveal>
        <Reveal delay={0.1}>
          <p>Spectra Leaf captures synchronized temperature, gas and colour readings, then links the completed profile to an expert-evaluated Good Leaf Percentage.</p>
        </Reveal>
      </div>
      <div className="pipeline-summary" aria-hidden="true">
        <span><Factory /> Physical batch</span><ArrowRight /><span><ScanLine /> Edge sensing</span><ArrowRight /><span><Database /> Labelled profile</span><ArrowRight /><span><BrainCircuit /> Future model</span>
      </div>
      <div className="pipeline-grid">
        {stages.map((stage, index) => (
          <motion.div
            key={stage}
            initial={{ opacity: 0.25 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: index * 0.07 }}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{stage}</h3>
            <i aria-hidden="true" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
