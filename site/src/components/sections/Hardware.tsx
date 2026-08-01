"use client";

import { motion } from "framer-motion";
import { CircuitBoard, Monitor, Palette, RadioTower, Thermometer, Wifi } from "lucide-react";
import Image from "next/image";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getAssetPath } from "@/lib/paths";

const components = [
  [Thermometer, "Dallas / OneWire temperature channel", "Tracks the temperature response inside the active tea bed."],
  [RadioTower, "MQ135 gas sensor", "Captures a repeatable gas-response signal as volatile compounds change."],
  [Palette, "TCS34725 colour sensor", "Measures red, green, blue and clear channels from the leaf surface."],
  [CircuitBoard, "ESP32 edge controller", "Samples the sensors, follows cloud state and publishes MQTT telemetry."],
  [Monitor, "ST7735 local display", "Shows device state and key readings beside the production process."],
  [Wifi, "Secure Wi-Fi + MQTT/TLS", "Carries identified batch data between the edge node and AWS IoT Core."],
];

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
        eyebrow="Hardware system"
        title="A complete edge instrument, not a collection of sensors."
        description="The prototype combines sensing, local feedback, secure connectivity and a team-designed control board around an ESP32 edge node."
      />
      <div className="hardware-hero">
        <Reveal className="hardware-image">
          <Image
            src={getAssetPath("/assets/images/hardware_design/image_2.png")}
            alt="Spectra Leaf hardware design integrating controller boards, a display, pumps and a sample chamber"
            width={2730}
            height={1536}
            sizes="(max-width: 760px) 100vw, 62vw"
          />
          <span>HARDWARE DESIGN / EDGE NODE 01</span>
        </Reveal>
        <Reveal className="controller-copy" delay={0.1}>
          <span className="chip-label">MAIN CONTROLLER</span>
          <CircuitBoard />
          <h3>ESP32 Microcontroller</h3>
          <p>The ESP32 coordinates synchronized sampling, local device state and secure cloud communication. Device Shadow commands keep the physical node aligned with fermentation sessions started or stopped from the dashboard.</p>
          <div className="controller-tags"><span>DUAL CORE</span><span>2.4 GHz WI-FI</span><span>MQTT/TLS</span><span>EDGE READY</span></div>
        </Reveal>
      </div>

      <div className="component-heading">
        <span className="chip-label">HARDWARE COMPONENTS</span>
        <h3>One measurement chain from leaf bed to cloud.</h3>
      </div>
      <div className="component-grid">
        {components.map(([Icon, title, text], index) => {
          const ComponentIcon = Icon as typeof CircuitBoard;
          return (
            <motion.article key={title as string} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
              <ComponentIcon /><span>0{index + 1}</span><h3>{title as string}</h3><p>{text as string}</p>
            </motion.article>
          );
        })}
      </div>

      <Reveal className="pcb-feature">
        <div className="pcb-copy">
          <span className="chip-label">TEAM-DESIGNED HARDWARE</span>
          <h3>Custom control PCB</h3>
          <p>The Spectra Leaf V1.0 board consolidates the ESP32, gas and colour sensor headers, temperature channels, TFT panel, relay interface and regulated power connections on one project-specific PCB.</p>
          <ul>
            <li>Labelled connections for repeatable sensor assembly</li>
            <li>Integrated controller, display and relay interfaces</li>
            <li>A compact base for field trials and enclosure revisions</li>
          </ul>
        </div>
        <figure>
          <Image
            src={getAssetPath("/assets/images/PCB/PCB.png")}
            alt="Spectra Leaf V1.0 custom PCB with labelled ESP32, sensor, display, relay and power connections"
            width={2752}
            height={1536}
            sizes="(max-width: 760px) 100vw, 48vw"
          />
          <figcaption>Spectra Leaf V1.0 · Team-designed control PCB</figcaption>
        </figure>
      </Reveal>

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
            <span>Gas response<strong>342</strong></span>
            <span>Colour stage<strong>68%</strong></span>
            <span>Batch<strong>SLF-024</strong></span>
          </div>
          <div className="terminal-status"><span><i /> DEVICE STATE <strong>RUNNING</strong></span><span><Wifi /> MQTT <strong>CONNECTED</strong></span></div>
          <div className="terminal-wave" aria-hidden="true">{Array.from({ length: 34 }, (_, index) => <i key={index} style={{ height: `${18 + ((index * 17) % 58)}%` }} />)}</div>
        </Reveal>
      </div>
    </section>
  );
}
