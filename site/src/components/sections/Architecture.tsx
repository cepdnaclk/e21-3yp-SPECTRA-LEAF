"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Braces, Cloud, Cpu, Database, LockKeyhole, Monitor, Radio, Thermometer } from "lucide-react";
import { useRef } from "react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const layers = [
  {
    label: "EDGE",
    tone: "copper",
    icon: Cpu,
    title: "Physical sensing",
    items: ["Temperature sensors", "Gas sensors", "Colour sensors", "ESP32", "MQTT"],
  },
  {
    label: "CLOUD",
    tone: "green",
    icon: Cloud,
    title: "Connected intelligence",
    items: ["AWS IoT Core", "Device Shadow", "Lambda", "API Gateway", "DynamoDB", "Cognito"],
  },
  {
    label: "CLIENT",
    tone: "cyan",
    icon: Monitor,
    title: "Factory visibility",
    items: ["Next.js dashboard", "React", "Tailwind CSS", "AWS Amplify"],
  },
];

const architectureRows = [
  ["Edge Hardware", "ESP32", "Sensor acquisition and secure MQTT communication."],
  ["IoT and Database", "AWS IoT Core + DynamoDB", "Device-state synchronization and time-series storage."],
  ["Cloud Backend", "Lambda + API Gateway", "Business logic, control endpoints and secure data access."],
  ["Client", "Next.js + React + Tailwind", "Factory-officer dashboard and batch management."],
  ["Security", "Amazon Cognito", "Authentication, SRP flow, token management and authorized access."],
];

export function Architecture() {
  const flowRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced || !flowRef.current) return;
    const packets = flowRef.current.querySelectorAll(".data-packet");
    gsap.fromTo(
      packets,
      { xPercent: -20, opacity: 0 },
      { xPercent: 620, opacity: 1, duration: 3.8, stagger: 0.7, repeat: -1, ease: "none" },
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
      <Reveal className="architecture-board">
        <div className="architecture-layers">
          {layers.map((layer) => {
            const Icon = layer.icon;
            return (
              <article key={layer.label} className={`architecture-layer layer-${layer.tone}`} tabIndex={0}>
                <div className="layer-head"><span>{layer.label}</span><Icon /></div>
                <h3>{layer.title}</h3>
                <div>{layer.items.map((item) => <span key={item}>{item}</span>)}</div>
              </article>
            );
          })}
        </div>
        <div ref={flowRef} className="architecture-flow" aria-label="Telemetry moves from sensors through the cloud to the dashboard">
          <svg viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden="true">
            <path d="M12 40 C150 8 210 72 350 40 S560 8 700 40 S850 72 988 40" />
          </svg>
          <span className="flow-start"><Thermometer /> Sensors</span>
          <span className="flow-mid"><Radio /> MQTT</span>
          <span className="flow-end"><Monitor /> Dashboard</span>
          <i className="data-packet packet-one" />
          <i className="data-packet packet-two" />
          <i className="data-packet packet-three" />
        </div>
        <div className="architecture-key">
          <span><Cpu /> ESP32</span><span><Cloud /> IoT Core</span><span><Braces /> Lambda</span><span><Database /> DynamoDB</span><span><LockKeyhole /> Cognito</span>
        </div>
      </Reveal>
      <Reveal className="architecture-table-wrap">
        <table className="architecture-table">
          <thead><tr><th>Layer</th><th>Technology</th><th>Role</th></tr></thead>
          <tbody>
            {architectureRows.map((row) => <tr key={row[0]}><th scope="row">{row[0]}</th><td>{row[1]}</td><td>{row[2]}</td></tr>)}
          </tbody>
        </table>
      </Reveal>
    </section>
  );
}
