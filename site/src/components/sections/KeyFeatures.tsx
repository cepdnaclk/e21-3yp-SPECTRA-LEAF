"use client";

import { motion } from "framer-motion";
import { BrainCircuit, CloudCog, Gauge, RadioTower, RefreshCw, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";

const features = [
  {
    icon: RadioTower,
    number: "01",
    title: "Three sensing domains",
    text: "Temperature, gas and colour readings build one synchronized view of every fermentation batch.",
  },
  {
    icon: Gauge,
    number: "02",
    title: "Live operational guidance",
    text: "Factory officers can follow active batches remotely through a responsive monitoring dashboard.",
  },
  {
    icon: RefreshCw,
    number: "03",
    title: "Resilient edge control",
    text: "The ESP32 firmware reconnects, restores device state and continues publishing after interruptions.",
  },
  {
    icon: CloudCog,
    number: "04",
    title: "Serverless cloud pipeline",
    text: "AWS IoT Core, Lambda and DynamoDB move telemetry securely without fixed server infrastructure.",
  },
  {
    icon: ShieldCheck,
    number: "05",
    title: "Secure access path",
    text: "Authenticated users receive controlled access to cloud APIs, device commands and batch records.",
  },
  {
    icon: BrainCircuit,
    number: "06",
    title: "AI-ready evidence",
    text: "Structured batch profiles create the foundation for future sweet-spot prediction and quality models.",
  },
] as const;

export function KeyFeatures() {
  return (
    <section id="features" className="section features-section">
      <SectionHeading
        index="03"
        eyebrow="Key features"
        title="One platform connecting the leaf, the edge and the cloud."
        description="The current prototype combines practical sensing, reliable telemetry and usable factory insight while preparing every batch for future intelligence."
      />
      <div className="features-grid">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.article
              key={feature.number}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
            >
              <div className="feature-topline">
                <Icon aria-hidden="true" />
                <span>{feature.number}</span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
