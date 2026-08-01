"use client";

import { motion } from "framer-motion";
import { ArrowRight, Braces, Cloud, Database, Factory, KeyRound, Laptop, Network, RefreshCcw, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";

const services = [
  [Cloud, "AWS IoT Core", "Secure MQTT gateway and device communication layer."],
  [RefreshCcw, "Device Shadow", "Synchronizes desired dashboard state with the ESP32 reported state."],
  [Braces, "AWS Lambda", "Runs validation, processing and control logic without persistent servers."],
  [Network, "API Gateway", "Provides controlled REST endpoints for dashboard operations."],
  [Database, "DynamoDB", "Stores batch records and timestamped sensor telemetry."],
  [KeyRound, "Amazon Cognito", "Authenticates users and issues tokens for role-aware access."],
  [ShieldCheck, "AWS Amplify", "Connects the Next.js client to identity and cloud services."],
];

const cloudFlow = [
  [Factory, "Factory edge", "ESP32 samples and identifies each batch"],
  [Cloud, "IoT Core + Shadow", "MQTT telemetry and shared RUNNING state"],
  [Braces, "Lambda + API", "Validate, transform and expose operations"],
  [Database, "DynamoDB", "Persist time-series and batch quality"],
  [Laptop, "Web + mobile", "Role-specific views through Cognito"],
];

const payload = `{
  "device_id": "SL-EDGE-01",
  "batch_id": "SLF-024",
  "timestamp": "2026-07-24T10:30:00Z",
  "temperature_c": 27.8,
  "gas_response": 342,
  "colour_stage": 0.68,
  "state": "RUNNING"
}`;

export function CloudInfrastructure() {
  return (
    <section id="cloud" className="section cloud-section">
      <SectionHeading
        index="06"
        eyebrow="Cloud infrastructure"
        title="A serverless path from the tea bed to every authorized screen."
        description="The architecture separates device messaging, shared process state, validation, storage, identity and presentation so each part can scale and recover independently."
      />

      <div className="cloud-architecture" aria-label="Cloud data path from factory sensors to user dashboards">
        <div className="cloud-architecture-head">
          <span className="chip-label">CLOUD ARCHITECTURE / DATA + CONTROL</span>
          <p>Telemetry moves left to right. Start and stop commands return through the same authenticated path and are synchronized with the edge node through Device Shadow.</p>
        </div>
        <div className="cloud-flow">
          {cloudFlow.map(([Icon, title, text], index) => {
            const FlowIcon = Icon as typeof Cloud;
            return (
              <div className="cloud-node" key={title as string}>
                <span>0{index + 1}</span><FlowIcon /><strong>{title as string}</strong><small>{text as string}</small>
                {index < cloudFlow.length - 1 && <ArrowRight className="cloud-arrow" aria-hidden="true" />}
              </div>
            );
          })}
        </div>
        <div className="cloud-return"><span>CONTROL RETURN</span><i /><strong>Dashboard → API → Device Shadow → ESP32</strong></div>
      </div>

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
