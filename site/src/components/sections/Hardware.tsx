"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Camera } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import type { CSSProperties, UIEvent } from "react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getAssetPath } from "@/lib/paths";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const components = [
  {
    model: "DS18B20 / 1-WIRE",
    name: "Temperature probe",
    image: "/assets/images/hardware_components/ds18b20-probe.png",
    alt: "Stainless steel DS18B20 temperature probe with a wired 1-Wire connection",
    domain: "LEAF-BED THERMAL",
    description: "The stainless probe sits inside the tea bed and records process temperature without exposing the sensing element to moisture.",
    reason: "Direct leaf-bed temperature is the clearest signal for checking whether oxidation is progressing inside the material rather than only measuring chamber air.",
    reads: "Temperature",
    output: "°C · DIGITAL",
  },
  {
    model: "DHT22 / AM2302",
    name: "Humidity sensor",
    image: "/assets/images/hardware_components/dht22-humidity.png",
    alt: "DHT22 digital relative humidity sensor",
    domain: "CHAMBER CLIMATE",
    description: "A calibrated capacitive channel measures relative humidity around the leaf bed so moisture conditions can be compared across batches.",
    reason: "Humidity explains how much moisture the surrounding air can still accept, helping the team interpret temperature and gas changes in the correct chamber conditions.",
    reads: "Relative humidity",
    output: "%RH · DIGITAL",
  },
  {
    model: "ESP32-CAM / OV2640",
    name: "Vision edge module",
    image: "/assets/images/hardware_components/esp32-cam.png",
    alt: "ESP32-CAM edge module with an OV2640 camera",
    domain: "VISUAL CONTEXT",
    description: "The Wi-Fi camera module captures chamber imagery and coordinates sensor data with the batch and device identity used by the cloud platform.",
    reason: "Images preserve visual evidence of leaf spread and colour while the ESP32-CAM also provides the connected edge controller in one compact module.",
    reads: "Leaf-bed frames",
    output: "2 MP · WI-FI",
  },
  {
    model: "WINSEN MQ137",
    name: "Ammonia response sensor",
    image: "/assets/images/hardware_components/mq137.png",
    alt: "Winsen MQ137 semiconductor ammonia gas sensor",
    domain: "NH₃ / AMINE RESPONSE",
    description: "The MQ137 supplies an analog response sensitive to ammonia and organic amines. Spectra Leaf follows its calibrated trend during oxidation.",
    reason: "Its ammonia and amine sensitivity adds a targeted chemical-response channel that the broader organic-vapor sensors do not provide on their own.",
    reads: "NH₃ response",
    output: "ANALOG · ADC",
  },
  {
    model: "FIGARO TGS2620",
    name: "Organic-vapor sensor",
    image: "/assets/images/hardware_components/tgs2620.png",
    alt: "Figaro TGS2620 organic solvent vapor sensor",
    domain: "ALCOHOL / VOC RESPONSE",
    description: "A low-power metal-oxide channel responds strongly to alcohol and organic solvent vapors, adding a volatile-compound profile to each batch.",
    reason: "Alcohol and volatile-organic response helps reveal changes in the aroma-producing chemistry that cannot be inferred from temperature and humidity alone.",
    reads: "Organic vapors",
    output: "ANALOG · ADC",
  },
  {
    model: "FIGARO TGS822",
    name: "Solvent-vapor sensor",
    image: "/assets/images/hardware_components/tgs822.png",
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
  const [activeSensor, setActiveSensor] = useState(0);
  const activeSensorRef = useRef(0);
  const storyRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const story = storyRef.current;
    const wheel = wheelRef.current;
    if (!story || !wheel) return;

    const media = gsap.matchMedia();
    media.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
      const cutouts = gsap.utils.toArray<HTMLElement>(".sensor-orbit-cutout", story);
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: story,
          start: "top 72px",
          end: () => `+=${Math.max(window.innerHeight * 0.82 * (components.length - 1), 2600)}`,
          scrub: 0.55,
          snap: {
            snapTo: 1 / (components.length - 1),
            duration: { min: 0.18, max: 0.42 },
            delay: 0.08,
            ease: "power1.inOut",
          },
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const next = Math.min(components.length - 1, Math.round(self.progress * (components.length - 1)));
            if (next !== activeSensorRef.current) {
              activeSensorRef.current = next;
              setActiveSensor(next);
            }
          },
        },
      });

      timeline
        .to(wheel, { rotation: -60 * (components.length - 1), ease: "none" }, 0)
        .to(cutouts, { rotation: 60 * (components.length - 1), ease: "none" }, 0);

      return () => timeline.kill();
    });

    return () => media.revert();
  }, { scope: storyRef });

  const syncScrollableSensor = (event: UIEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(max-width: 900px), (prefers-reduced-motion: reduce)").matches) return;

    const firstPanel = event.currentTarget.querySelector<HTMLElement>(".sensor-detail");
    if (!firstPanel) return;

    const next = Math.min(
      components.length - 1,
      Math.max(0, Math.round(event.currentTarget.scrollLeft / firstPanel.offsetWidth)),
    );
    if (next !== activeSensorRef.current) {
      activeSensorRef.current = next;
      setActiveSensor(next);
    }
  };

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
      <div
        ref={storyRef}
        className="sensor-story"
        data-reveal
        style={{
          "--mobile-wheel-rotation": `${activeSensor * -60}deg`,
          "--mobile-cutout-rotation": `${activeSensor * 60}deg`,
        } as CSSProperties}
      >
        <strong className="sensor-story-count">{String(activeSensor + 1).padStart(2, "0")} / {String(components.length).padStart(2, "0")}</strong>

        <div className="sensor-story-layout">
          <div className="sensor-orbit-stage" aria-hidden="true">
            <div ref={wheelRef} className="sensor-orbit-wheel">
              <i className="sensor-orbit-ring" />
              {components.map((component, index) => (
                <div
                  className={`sensor-orbit-node ${activeSensor === index ? "is-active" : ""}`}
                  key={component.model}
                  style={{
                    "--sensor-angle": `${index * 60}deg`,
                    "--sensor-angle-inverse": `${index * -60}deg`,
                  } as CSSProperties}
                >
                  <div className="sensor-orbit-cutout">
                    <Image
                      src={getAssetPath(component.image)}
                      alt=""
                      fill
                      sizes="96px"
                      loading="lazy"
                    />
                    <span>0{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sensor-detail-viewport" onScroll={syncScrollableSensor}>
            <div className="sensor-detail-track">
              {components.map((component, index) => {
                return (
                  <article
                    className={`sensor-detail ${index === activeSensor ? "is-active" : index < activeSensor ? "is-before" : "is-after"}`}
                    aria-hidden={index !== activeSensor}
                    key={component.model}
                  >
                    <span className="sensor-detail-model">CHANNEL {String(index + 1).padStart(2, "0")} · {component.model}</span>
                    <h3>{component.name}</h3>
                    <p>{component.description}</p>
                    <div className="sensor-detail-reason">
                      <small>WHY THIS SIGNAL MATTERS</small>
                      <p>{component.reason}</p>
                    </div>
                    <div className="sensor-detail-specs">
                      <span><small>READS</small><strong>{component.reads}</strong></span>
                      <span><small>OUTPUT</small><strong>{component.output}</strong></span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      <div className="pcb-feature" data-hardware-pair>
        <figure data-hardware-visual>
          <Image
            src={getAssetPath("/assets/images/PCB/PCB.png")}
            alt="Spectra Leaf V1.0 custom PCB with labelled ESP32, sensor, display, relay and power connections"
            width={2752}
            height={1536}
            sizes="(max-width: 760px) 100vw, 48vw"
          />
          <figcaption>Spectra Leaf V1.0 · Team-designed control PCB</figcaption>
        </figure>
        <div className="pcb-copy" data-hardware-copy>
          <span className="chip-label">TEAM-DESIGNED HARDWARE</span>
          <h3>Custom control PCB</h3>
          <p>The Spectra Leaf V1.0 board consolidates ESP32-CAM control, temperature and humidity inputs, three conditioned gas channels, relay interfaces and regulated power on one project-specific PCB.</p>
          <ul>
            <li>Labelled connections for repeatable sensor assembly</li>
            <li>Integrated controller, display and relay interfaces</li>
            <li>A compact base for field trials and enclosure revisions</li>
          </ul>
        </div>
      </div>

      <div className="firmware-layout" data-hardware-pair>
        <div className="firmware-copy" data-hardware-copy>
          <span className="chip-label">FIRMWARE SEQUENCE</span>
          <h3>A loop designed to recover, report and continue.</h3>
          <div className="firmware-flow">
            {firmware.map((step, index) => <div key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></div>)}
          </div>
        </div>
        <div className="firmware-sequence-visual" data-hardware-visual>
          <Image
            src={getAssetPath("/assets/images/frameare sequense/dashbord.png")}
            alt="Spectra Leaf firmware sequence dashboard"
            width={1632}
            height={944}
            sizes="(max-width: 760px) 100vw, 46vw"
          />
        </div>
      </div>
    </section>
  );
}
