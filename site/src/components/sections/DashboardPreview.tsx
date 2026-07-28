"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Monitor, Radio, Smartphone } from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { getAssetPath } from "@/lib/paths";

export function DashboardPreview() {
  return (
    <section id="dashboard" className="section dashboard-section">
      <SectionHeading
        index="10"
        eyebrow="Live dashboard"
        title="One operation. Every screen."
        description="Factory officers can follow live fermentation, compare sensor trends and manage batches from a focused web workspace or a field-ready mobile view."
      />
      <motion.div
        className="dashboard-showcase"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="dashboard-showcase-meta" aria-hidden="true">
          <span><Monitor /> Web command centre</span>
          <span><Radio /> Live factory telemetry</span>
        </div>
        <figure className="dashboard-desktop">
          <div className="dashboard-window-bar">
            <div><i /><i /><i /></div>
            <span>spectraleaf / live dashboard</span>
            <small>FAC001 ONLINE</small>
          </div>
          <Image
            src={getAssetPath("/assets/images/dashbord/web_dashbord.png")}
            alt="Spectra Leaf desktop dashboard showing live sensor readings, fermentation batches and performance summaries"
            width={1917}
            height={944}
            sizes="(max-width: 760px) 94vw, 86vw"
            priority={false}
          />
        </figure>
        <motion.figure
          className="dashboard-mobile"
          initial={{ opacity: 0, x: 36, rotate: 2 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.25, duration: 0.65 }}
        >
          <figcaption><Smartphone /> Mobile dashboard</figcaption>
          <Image
            src={getAssetPath("/assets/images/dashbord/mobile_dashbord.jpeg")}
            alt="Spectra Leaf mobile dashboard showing active batches, latest temperature and sensor trend graphs"
            width={812}
            height={1600}
            sizes="(max-width: 760px) 68vw, 22vw"
          />
        </motion.figure>
      </motion.div>
    </section>
  );
}
