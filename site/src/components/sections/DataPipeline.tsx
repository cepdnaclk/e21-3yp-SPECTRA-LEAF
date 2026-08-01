"use client";

import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Database, Factory, ScanLine, Tags } from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const stages = [
  ["Capture", "The officer starts a batch and the ESP32 samples temperature, gas response and colour together."],
  ["Transmit", "Readings are identified by device, batch and timestamp, then published securely through MQTT."],
  ["Validate + store", "Cloud functions check the payload and persist the time-series profile in DynamoDB."],
  ["Add quality label", "After grading, the expert-evaluated Good Leaf Percentage is linked to the completed batch."],
  ["Curate the dataset", "Profiles are cleaned, aligned and organized into trustworthy model-ready examples."],
  ["Train + guide", "Future models learn process-to-quality patterns and can return stage estimates or alerts."],
];

const aiFlow = [
  [Database, "DynamoDB", "Raw readings + batch records"],
  [Tags, "Labelled dataset", "Sensor profile + final GLP"],
  [BrainCircuit, "ML training", "Feature engineering + validation"],
  [ScanLine, "Operational guidance", "Future stage estimate + alert"],
];

export function DataPipeline() {
  return (
    <section id="data" className="section data-section">
      <SectionHeading
        index="08"
        eyebrow="Data and AI"
        title="The system guides today while building evidence for tomorrow."
        description="Every batch creates a synchronized record that connects physical change, cloud data and expert-evaluated final quality."
      />
      <div className="data-statement">
        <Reveal>
          <p>Open datasets correlating detailed tea-oxidation sensor readings with final factory quality measurements are limited.</p>
        </Reveal>
        <Reveal delay={0.1}>
          <p>Spectra Leaf captures synchronized temperature, gas and colour readings, then links the completed profile to an expert-evaluated Good Leaf Percentage.</p>
        </Reveal>
      </div>

      <Reveal className="ai-architecture">
        <div className="ai-architecture-heading"><span className="chip-label">DATABASE → AI MODEL → FACTORY GUIDANCE</span><p>The prediction layer is the planned outcome of the dataset now being collected; it is not presented as a production model.</p></div>
        <div className="ai-flow">
          {aiFlow.map(([Icon, title, text], index) => {
            const FlowIcon = Icon as typeof Database;
            return <div className="ai-node" key={title as string}><span>0{index + 1}</span><FlowIcon /><strong>{title as string}</strong><small>{text as string}</small>{index < aiFlow.length - 1 && <ArrowRight aria-hidden="true" />}</div>;
          })}
        </div>
      </Reveal>

      <div className="pipeline-summary" aria-hidden="true">
        <span><Factory /> Physical batch</span><ArrowRight /><span><ScanLine /> Edge sensing</span><ArrowRight /><span><Database /> Labelled profile</span><ArrowRight /><span><BrainCircuit /> Future model</span>
      </div>
      <div className="pipeline-grid">
        {stages.map(([stage, explanation], index) => (
          <motion.div
            key={stage}
            initial={{ opacity: 0.25 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: index * 0.07 }}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{stage}</h3>
            <p>{explanation}</p>
            <i aria-hidden="true" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
