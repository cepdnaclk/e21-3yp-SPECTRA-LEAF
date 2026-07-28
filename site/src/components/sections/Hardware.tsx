"use client";

import { motion } from "framer-motion";
import { CircuitBoard, Palette, RadioTower, Thermometer, Wifi } from "lucide-react";
import Image from "next/image";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getAssetPath } from "@/lib/paths";

const firmware = [
  "Connect securely to Wi-Fi",
  "Connect to AWS IoT Core",
  "Subscribe to Device Shadow",
  "Read RUNNING / STOPPED state",
  "Sample all sensor domains",
  "Attach device, batch and timestamp",
  "Publish telemetry using MQTT",
  "Update reported Shadow state",
  "Reconnect after interruption",
  "Continue the sensing loop",
];

export function Hardware() {
  return (
    <section id="hardware" className="section hardware">
      <SectionHeading
        index="05"
        eyebrow="Hardware design"
        title="Built to observe the chemistry of change."
        description="An ESP32 edge unit fuses three sensor domains into a resilient MQTT telemetry stream."
      />
      <div className="hardware-hero">
        <Reveal className="hardware-image">
          <Image
            src={getAssetPath("/assets/images/hardware_design/image_2.png")}
            alt="Completed Spectra Leaf sensing prototype with control electronics, pumps and sample chamber"
            width={1200}
            height={900}
            sizes="(max-width: 760px) 100vw, 62vw"
          />
          <span>REAL PROTOTYPE / EDGE NODE 01</span>
        </Reveal>
        <Reveal className="controller-copy" delay={0.1}>
          <span className="chip-label">MAIN CONTROLLER</span>
          <CircuitBoard />
          <h3>ESP32 Microcontroller</h3>
          <p>Selected for integrated Wi-Fi, dual-core processing, suitable embedded performance, low-power operation, secure MQTT support and a strong IoT ecosystem.</p>
          <div className="controller-tags"><span>DUAL CORE</span><span>2.4 GHz WI-FI</span><span>MQTT/TLS</span><span>EDGE READY</span></div>
        </Reveal>
      </div>
      <div className="sensor-grid">
        {[
          [Thermometer, "Temperature sensors", "Monitor the exothermic behaviour of tea fermentation.", "27.8 °C"],
          [RadioTower, "Gas sensors", "Measure volatile organic compound patterns released during fermentation.", "VOC 342"],
          [Palette, "Colour sensors", "Track oxidation-related colour development toward coppery-brown tones.", "STAGE 68%"],
        ].map(([Icon, title, text, value], index) => {
          const SensorIcon = Icon as typeof Thermometer;
          return (
            <motion.article key={title as string} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
              <SensorIcon /><span className="sensor-value">{value as string}</span><h3>{title as string}</h3><p>{text as string}</p>
            </motion.article>
          );
        })}
      </div>
      <div className="firmware-layout">
        <Reveal>
          <span className="chip-label">FIRMWARE SEQUENCE</span>
          <h3>A loop designed to recover, report and continue.</h3>
          <div className="firmware-flow">
            {firmware.map((step, index) => <div key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></div>)}
          </div>
        </Reveal>
        <Reveal className="telemetry-terminal" delay={0.12}>
          <div className="terminal-head"><span><i /> LIVE EDGE SIMULATION</span><small>DEMONSTRATION VALUES</small></div>
          <div className="terminal-grid">
            <span>Temperature<strong>27.8 °C</strong></span>
            <span>VOC Index<strong>342</strong></span>
            <span>Colour Stage<strong>68%</strong></span>
            <span>Batch<strong>SLF-024</strong></span>
          </div>
          <div className="terminal-status"><span><i /> DEVICE STATE <strong>RUNNING</strong></span><span><Wifi /> MQTT <strong>CONNECTED</strong></span></div>
          <div className="terminal-wave" aria-hidden="true">{Array.from({ length: 34 }, (_, index) => <i key={index} style={{ height: `${18 + ((index * 17) % 58)}%` }} />)}</div>
        </Reveal>
      </div>
    </section>
  );
}
