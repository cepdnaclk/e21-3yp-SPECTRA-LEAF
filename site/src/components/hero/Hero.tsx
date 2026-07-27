"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowDown, ArrowRight, Cloud, Cpu, Database, Radio } from "lucide-react";
import { type MouseEvent } from "react";
import { project } from "@/data/project";

const telemetry = [
  { label: "TEMP", value: "27.8 °C", x: "10%", y: "27%" },
  { label: "VOC", value: "342 IDX", x: "75%", y: "22%" },
  { label: "COLOUR", value: "68%", x: "79%", y: "68%" },
  { label: "MQTT", value: "SYNCED", x: "12%", y: "74%" },
];

export function Hero() {
  const x = useSpring(useMotionValue(0), { stiffness: 80, damping: 20 });
  const y = useSpring(useMotionValue(0), { stiffness: 80, damping: 20 });
  const move = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) / 35);
    y.set((event.clientY - rect.top - rect.height / 2) / 35);
  };

  return (
    <section id="home" className="hero" onMouseMove={move}>
      <div className="hero-grid" aria-hidden="true" />
      <div className="scan-beam" aria-hidden="true" />
      <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
      <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
      <motion.div className="hero-telemetry" style={{ x, y }} aria-hidden="true">
        {telemetry.map((item) => (
          <div key={item.label} className="floating-reading" style={{ left: item.x, top: item.y }}>
            <span>{item.label}</span><strong>{item.value}</strong>
          </div>
        ))}
      </motion.div>
      <div className="hero-content">
        <motion.p className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {project.eyebrow}
        </motion.p>
        <h1 aria-label="Spectra Leaf">
          {"SPECTRA".split("").map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              initial={{ opacity: 0, filter: "blur(14px)", y: 24 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 + index * 0.045 }}
            >{letter}</motion.span>
          ))}
          <br />
          <motion.em
            initial={{ opacity: 0, filter: "blur(14px)", y: 24 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.7, delay: 0.48 }}
          >LEAF</motion.em>
        </h1>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          {project.subtitle}
        </motion.h2>
        <motion.p className="hero-description" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          {project.description}
        </motion.p>
        <motion.div className="hero-actions" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <a className="button button-primary" href="#introduction">Explore the System <ArrowRight /></a>
          <a className="button button-secondary" href="#architecture">View Architecture</a>
        </motion.div>
      </div>
      <div className="hero-status">
        {[
          [Cpu, "ESP32 Edge Sensing"],
          [Cloud, "AWS Serverless Cloud"],
          [Radio, "Live Batch Telemetry"],
          [Database, "AI-Ready Dataset"],
        ].map(([Icon, label]) => {
          const StatusIcon = Icon as typeof Cpu;
          return <div key={label as string}><StatusIcon /><span>{label as string}</span></div>;
        })}
      </div>
      <a href="#introduction" className="scroll-cue"><span>Scroll to trace the signal</span><ArrowDown /></a>
    </section>
  );
}
