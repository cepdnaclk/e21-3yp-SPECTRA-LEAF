"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Camera,
  Droplets,
  FlaskConical,
  Info,
  ScanLine,
  Thermometer,
  Wifi,
} from "lucide-react";
import Image from "next/image";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getAssetPath } from "@/lib/paths";

const components = [
  {
    Icon: Thermometer,
    model: "DS18B20 / 1-WIRE",
    name: "Temperature probe",
    image: "/assets/images/hardware_components/ds18b20-probe.jpg",
    alt: "Stainless steel DS18B20 temperature probe with a wired 1-Wire connection",
    domain: "LEAF-BED THERMAL",
    description: "The stainless probe sits inside the tea bed and records process temperature without exposing the sensing element to moisture.",
    reason: "Direct leaf-bed temperature is the clearest signal for checking whether oxidation is progressing inside the material rather than only measuring chamber air.",
    reads: "Temperature",
    output: "°C · DIGITAL",
  },
  {
    Icon: Droplets,
    model: "DHT22 / AM2302",
    name: "Humidity sensor",
    image: "/assets/images/hardware_components/dht22-humidity.jpg",
    alt: "DHT22 digital relative humidity sensor",
    domain: "CHAMBER CLIMATE",
    description: "A calibrated capacitive channel measures relative humidity around the leaf bed so moisture conditions can be compared across batches.",
    reason: "Humidity explains how much moisture the surrounding air can still accept, helping the team interpret temperature and gas changes in the correct chamber conditions.",
    reads: "Relative humidity",
    output: "%RH · DIGITAL",
  },
  {
    Icon: Camera,
    model: "ESP32-CAM / OV2640",
    name: "Vision edge module",
    image: "/assets/images/hardware_components/esp32-cam.jpg",
    alt: "ESP32-CAM edge module with an OV2640 camera",
    domain: "VISUAL CONTEXT",
    description: "The Wi-Fi camera module captures chamber imagery and coordinates sensor data with the batch and device identity used by the cloud platform.",
    reason: "Images preserve visual evidence of leaf spread and colour while the ESP32-CAM also provides the connected edge controller in one compact module.",
    reads: "Leaf-bed frames",
    output: "2 MP · WI-FI",
  },
  {
    Icon: FlaskConical,
    model: "WINSEN MQ137",
    name: "Ammonia response sensor",
    image: "/assets/images/hardware_components/mq137.jpg",
    alt: "Winsen MQ137 semiconductor ammonia gas sensor",
    domain: "NH₃ / AMINE RESPONSE",
    description: "The MQ137 supplies an analog response sensitive to ammonia and organic amines. Spectra Leaf follows its calibrated trend during oxidation.",
    reason: "Its ammonia and amine sensitivity adds a targeted chemical-response channel that the broader organic-vapor sensors do not provide on their own.",
    reads: "NH₃ response",
    output: "ANALOG · ADC",
  },
  {
    Icon: Activity,
    model: "FIGARO TGS2620",
    name: "Organic-vapor sensor",
    image: "/assets/images/hardware_components/tgs2620.jpg",
    alt: "Figaro TGS2620 organic solvent vapor sensor",
    domain: "ALCOHOL / VOC RESPONSE",
    description: "A low-power metal-oxide channel responds strongly to alcohol and organic solvent vapors, adding a volatile-compound profile to each batch.",
    reason: "Alcohol and volatile-organic response helps reveal changes in the aroma-producing chemistry that cannot be inferred from temperature and humidity alone.",
    reads: "Organic vapors",
    output: "ANALOG · ADC",
  },
  {
    Icon: ScanLine,
    model: "FIGARO TGS822",
    name: "Solvent-vapor sensor",
    image: "/assets/images/hardware_components/tgs822.jpg",
    alt: "Red Figaro TGS822 organic solvent vapor sensor",
    domain: "SOLVENT RESPONSE",
    description: "The TGS822 adds a complementary organic-solvent response, helping the system compare the shape and timing of volatile changes.",
    reason: "A second broad vapor channel provides a different response pattern, improving comparison and reducing reliance on a single gas-sensor signal.",
    reads: "Solvent vapors",
    output: "ANALOG · ADC",
  },
];

const firmware = [
  "Connect securely to Wi-Fi",
  "Connect to AWS IoT Core",
  "Subscribe to Device Shadow",
  "Read RUNNING / STOPPED state",
  "Sample temperature and humidity",
  "Read MQ137, TGS2620 and TGS822",
  "Capture an ESP32-CAM frame when required",
  "Attach device, batch and timestamp",
  "Publish telemetry using MQTT",
  "Update reported Shadow state",
  "Reconnect after interruption",
  "Continue the sensing loop",
];

export function Hardware() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="hardware" className="section hardware">
      <SectionHeading
        index="05"
        eyebrow="Hardware system"
        title="Six physical channels read the changing leaf bed."
        description="The device combines temperature, humidity, imaging and three complementary gas-response sensors around an ESP32-CAM edge node."
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
          <Camera />
          <h3>ESP32-CAM edge controller</h3>
          <p>The ESP32-CAM coordinates synchronized sensing, adds OV2640 visual context and publishes batch-linked telemetry over secure Wi-Fi. Device Shadow commands keep the physical node aligned with fermentation sessions.</p>
          <div className="controller-tags"><span>OV2640 CAMERA</span><span>2.4 GHz WI-FI</span><span>MQTT/TLS</span><span>EDGE CAPTURE</span></div>
        </Reveal>
      </div>

      <div className="component-heading">
        <span className="chip-label">HARDWARE COMPONENTS</span>
        <h3>One synchronized sensor array, six distinct signals.</h3>
      </div>
      <div className="component-stack">
        {components.map((component, index) => {
          const ComponentIcon = component.Icon;

          return (
            <motion.article
              className="component-card"
              key={component.model}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 54, scale: reducedMotion ? 1 : 0.975 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
            >
              <figure className="component-media">
                <Image
                  src={getAssetPath(component.image)}
                  alt={component.alt}
                  fill
                  sizes="(max-width: 760px) calc(100vw - 56px), (max-width: 1100px) 46vw, 42vw"
                />
                <figcaption><ComponentIcon /> {component.model}</figcaption>
              </figure>
              <div className="component-panel">
                <div className="component-card-head">
                  <span>CHANNEL 0{index + 1} / 06</span>
                  <small>{component.model}</small>
                </div>
                <div className="component-copy">
                  <div className="component-icon"><ComponentIcon /></div>
                  <small>{component.domain}</small>
                  <h3>{component.name}</h3>
                  <p>{component.description}</p>
                </div>
                <div className="component-reason">
                  <small>WHY WE USE IT</small>
                  <p>{component.reason}</p>
                </div>
                <div className="component-specs">
                  <span><small>READS</small><strong>{component.reads}</strong></span>
                  <span><small>OUTPUT</small><strong>{component.output}</strong></span>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
      <Reveal className="component-calibration-note">
        <Info />
        <p><strong>Measurement note</strong> Gas channels are stored as response signals until chamber calibration maps them to concentration. This avoids presenting raw ADC values as ppm.</p>
      </Reveal>

      <Reveal className="pcb-feature">
        <div className="pcb-copy">
          <span className="chip-label">TEAM-DESIGNED HARDWARE</span>
          <h3>Custom control PCB</h3>
          <p>The Spectra Leaf V1.0 board consolidates ESP32-CAM control, temperature and humidity inputs, three conditioned gas channels, relay interfaces and regulated power on one project-specific PCB.</p>
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
            <span>Leaf temperature<strong>27.2 °C</strong></span>
            <span>Relative humidity<strong>53.0 %RH</strong></span>
            <span>MQ137 response<strong>ADC 1860</strong></span>
            <span>TGS2620 response<strong>ADC 1672</strong></span>
            <span>TGS822 response<strong>ADC 1548</strong></span>
            <span>ESP32-CAM<strong>FRAME READY</strong></span>
          </div>
          <div className="terminal-status"><span><i /> DEVICE STATE <strong>RUNNING</strong></span><span><Wifi /> MQTT <strong>CONNECTED</strong></span></div>
          <div className="terminal-wave" aria-hidden="true">{Array.from({ length: 34 }, (_, index) => <i key={index} style={{ height: `${18 + ((index * 17) % 58)}%` }} />)}</div>
        </Reveal>
      </div>
    </section>
  );
}
