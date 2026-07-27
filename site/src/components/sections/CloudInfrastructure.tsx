"use client";

import { motion } from "framer-motion";
import { Braces, Cloud, Database, KeyRound, Network, RefreshCcw, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";

const services = [
  [Cloud, "AWS IoT Core", "Secure MQTT gateway and device communication layer."],
  [RefreshCcw, "Device Shadow", "Synchronizes desired dashboard state with the ESP32 reported state."],
  [Braces, "AWS Lambda", "Runs validation, processing and control logic without persistent servers."],
  [Network, "API Gateway", "Provides secure REST endpoints for the dashboard."],
  [Database, "DynamoDB", "Stores batch-linked time-series telemetry at cloud scale."],
  [KeyRound, "Amazon Cognito", "Provides SRP authentication and token-based access."],
  [ShieldCheck, "AWS Amplify", "Integrates the Next.js frontend with Cognito and cloud services."],
];

const payload = `{
  "device_id": "SL-EDGE-01",
  "batch_id": "SLF-024",
  "timestamp": "2026-07-24T10:30:00Z",
  "temperature_c": 27.8,
  "voc_index": 342,
  "colour_stage": 0.68,
  "state": "RUNNING"
}`;

export function CloudInfrastructure() {
  return (
    <section id="cloud" className="section cloud-section">
      <SectionHeading
        index="05"
        eyebrow="Cloud infrastructure"
        title="Serverless by design. Synchronized by state."
        description="Each AWS service has one focused responsibility across device communication, identity, storage and secure access."
      />
      <div className="cloud-grid">
        {services.map(([Icon, title, text], index) => {
          const ServiceIcon = Icon as typeof Cloud;
          return (
            <motion.article key={title as string} tabIndex={0} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.055 }}>
              <ServiceIcon /><span>0{index + 1}</span><h3>{title as string}</h3><p>{text as string}</p>
            </motion.article>
          );
        })}
      </div>
      <div className="api-layout">
        <div className="endpoint-panel">
          <span className="chip-label">SECURE REST SURFACE</span>
          <h3>Dashboard endpoints</h3>
          {[
            ["POST", "/api/fermentation/control"],
            ["GET", "/api/batches"],
            ["GET", "/api/batches/{batchId}/telemetry"],
            ["POST", "/api/batches/{batchId}/quality"],
          ].map(([method, path]) => <div key={path}><span>{method}</span><code>{path}</code></div>)}
        </div>
        <div className="code-panel">
          <div><span>telemetry.payload.json</span><i /><i /><i /></div>
          <pre><code>{payload}</code></pre>
        </div>
      </div>
    </section>
  );
}
