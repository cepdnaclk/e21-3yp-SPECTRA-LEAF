"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BrainCircuit, CloudCog, Gauge, RadioTower, RefreshCw, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";

const features = [
  {
    icon: RadioTower,
    number: "01",
    title: "Six synchronized inputs",
    text: "Temperature, humidity, vision and three gas-response channels capture one batch-linked view of the changing tea bed.",
    value: "06",
    readout: "SENSOR CHANNELS",
    tags: ["ONE TIMELINE", "BATCH LINKED"],
  },
  {
    icon: Gauge,
    number: "02",
    title: "Shared live batch control",
    text: "Starting or stopping fermentation updates the backend-owned process state seen by connected web and mobile clients.",
    value: "LIVE",
    readout: "SHARED PROCESS STATE",
    tags: ["START + STOP", "AUTO REFRESH"],
  },
  {
    icon: RefreshCw,
    number: "03",
    title: "Resilient camera edge",
    text: "The ESP32-CAM coordinates sensing and visual context, reconnects after interruptions and resumes secure publishing.",
    value: "AUTO",
    readout: "EDGE RECOVERY",
    tags: ["ESP32-CAM", "WI-FI RECONNECT"],
  },
  {
    icon: CloudCog,
    number: "04",
    title: "Serverless cloud pipeline",
    text: "AWS IoT Core, Lambda and DynamoDB move telemetry securely without fixed server infrastructure.",
    value: "MQTT",
    readout: "SECURE TELEMETRY",
    tags: ["DEVICE SHADOW", "DYNAMODB"],
  },
  {
    icon: ShieldCheck,
    number: "05",
    title: "Role-aware access",
    text: "Cognito protects operational data while officers and managers receive interfaces matched to their responsibilities.",
    value: "03",
    readout: "USER ROLES",
    tags: ["COGNITO", "WEB + MOBILE"],
  },
  {
    icon: BrainCircuit,
    number: "06",
    title: "Quality-ready evidence",
    text: "Completed sensor profiles can be paired with expert Good Leaf Percentage results for future model development.",
    value: "GLP",
    readout: "QUALITY LABEL LINK",
    tags: ["BATCH HISTORY", "MODEL READY"],
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
              <div className="feature-card-head">
                <span>CAPABILITY / {feature.number}</span>
                <i aria-hidden="true"><ArrowUpRight /></i>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <div className="feature-visual" aria-hidden="true">
                <div className="feature-visual-icon"><Icon /></div>
                <div className="feature-readout"><strong>{feature.value}</strong><small>{feature.readout}</small></div>
                <div className="feature-data-track">{Array.from({ length: 7 }, (_, item) => <i key={item} />)}</div>
              </div>
              <div className="feature-tags">{feature.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
