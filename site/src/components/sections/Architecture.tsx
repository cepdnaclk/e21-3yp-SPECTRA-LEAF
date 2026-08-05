"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowRight, Cloud, Cpu, Monitor, Radio } from "lucide-react";
import { useRef } from "react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const layers = [
  {
    label: "01 / EDGE",
    icon: Cpu,
    title: "Capture at the tea bed",
    description: "The ESP32-CAM aligns every reading with the active device, batch and timestamp before transmission.",
    items: ["Temperature", "Humidity", "Vision", "MQ137", "TGS2620", "TGS822"],
  },
  {
    label: "02 / CLOUD",
    icon: Cloud,
    title: "Synchronize and store",
    description: "AWS services validate telemetry, preserve batch history and keep the shared fermentation state consistent.",
    items: ["IoT Core", "Device Shadow", "Lambda", "API Gateway", "DynamoDB"],
  },
  {
    label: "03 / INTERFACE",
    icon: Monitor,
    title: "Guide the factory team",
    description: "Authenticated web and mobile interfaces turn the same backend state into role-appropriate controls and insight.",
    items: ["Officer mobile", "Factory dashboard", "Cognito", "Live state"],
  },
];

const architectureRows = [
  ["Sensor input", "Six physical channels", "Temperature, humidity, imaging and three gas-response signals."],
  ["Edge controller", "ESP32-CAM", "Synchronized capture, device identity and secure Wi-Fi publishing."],
  ["Cloud state", "IoT Core + Device Shadow", "Telemetry transport and one shared RUNNING or STOPPED state."],
  ["Application data", "Lambda + API Gateway + DynamoDB", "Validation, protected operations and batch history."],
  ["Authorized clients", "Cognito + web + mobile", "Role-aware access to controls, trends and completed records."],
];

export function Architecture() {
  const flowRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced || !flowRef.current) return;
    const packets = flowRef.current.querySelectorAll(".data-packet");
    gsap.fromTo(
      packets,
      { x: 0, opacity: 0 },
      { x: () => Math.max((flowRef.current?.clientWidth ?? 0) - 26, 0), opacity: 1, duration: 4.2, stagger: 1.1, repeat: -1, repeatRefresh: true, ease: "none" },
    );
  }, { scope: flowRef, dependencies: [reduced] });

  return (
    <section id="architecture" className="section architecture">
      <SectionHeading
        index="04"
        eyebrow="Solution architecture"
        title="One signal path. Three engineered layers."
        description="The architecture carries context from the fermentation trough to a secure remote interface."
      />
      <Reveal className="architecture-system">
        <div className="architecture-path">
          {layers.map((layer, index) => {
            const Icon = layer.icon;
            return (
              <article key={layer.label} className="architecture-stage" tabIndex={0}>
                <div className="architecture-stage-head"><span>{layer.label}</span><Icon /></div>
                <h3>{layer.title}</h3>
                <p>{layer.description}</p>
                <div className="architecture-stage-tags">{layer.items.map((item) => <span key={item}>{item}</span>)}</div>
                {index < layers.length - 1 && <ArrowRight className="architecture-stage-arrow" aria-hidden="true" />}
              </article>
            );
          })}
        </div>
        <div className="architecture-transfer">
          <span><Radio /> LIVE DATA PATH</span>
          <div ref={flowRef} className="architecture-rail" aria-label="Telemetry moves from the sensors through AWS to web and mobile interfaces">
            <i className="data-packet" /><i className="data-packet" /><i className="data-packet" />
          </div>
          <small>MQTT / TLS · REST API · SHARED DEVICE STATE</small>
        </div>
      </Reveal>
      <Reveal className="architecture-register">
        <div className="architecture-register-head"><span>IMPLEMENTATION REGISTER</span><small>05 CONNECTED RESPONSIBILITIES</small></div>
        {architectureRows.map((row, index) => (
          <div className="architecture-register-row" key={row[0]}>
            <span>{String(index + 1).padStart(2, "0")}</span><strong>{row[0]}</strong><small>{row[1]}</small><p>{row[2]}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
