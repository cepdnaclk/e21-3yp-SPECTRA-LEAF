"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BarChart3, Building2, Check, Factory, Monitor, Radio, Smartphone } from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { getAssetPath } from "@/lib/paths";

const roles = [
  {
    id: "officer",
    Icon: Factory,
    title: "Factory Officer",
    scope: "Live operations",
    summary: "A live workspace for starting batches, following every sensor and recording the final GLP result.",
    image: "/assets/images/dashbord/Factory_Officer_dashbord.png",
    width: 1917,
    height: 944,
    features: ["Start and stop fermentation", "Assign batch and device IDs", "Follow live sensors and trends", "Review batch history and enter GLP"],
  },
  {
    id: "manager",
    Icon: BarChart3,
    title: "Factory Manager",
    scope: "Factory performance",
    summary: "A management view for batch pricing, pending work, revenue tracking and factory-level analysis.",
    image: "/assets/images/dashbord/Factory_Manager_dashbord.png",
    width: 1919,
    height: 941,
    features: ["Review priced and pending batches", "Manage batch pricing", "Track factory revenue", "Compare batch-level analytics"],
  },
  {
    id: "general-manager",
    Icon: Building2,
    title: "General Manager",
    scope: "Multi-factory view",
    summary: "An executive view that brings factory status, consolidated revenue and organization-wide comparisons together.",
    image: "/assets/images/dashbord/General_Manager_dashbord.png",
    width: 1919,
    height: 947,
    features: ["See consolidated factory status", "Compare revenue contribution", "Identify top batches and factories", "Review organization-wide charts"],
  },
];

export function DashboardPreview() {
  return (
    <section id="dashboard" className="section dashboard-section">
      <SectionHeading
        index="10"
        eyebrow="Role-based platform"
        title="One operation. The right view for every decision."
        description="Three authenticated roles share one data platform while receiving the controls, detail and reporting appropriate to their responsibilities."
      />

      <div className="role-grid" aria-label="Dashboard functionality by user role">
        {roles.map(({ id, Icon, title, scope, features }, index) => (
          <motion.article key={id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
            <div className="role-card-head"><Icon /><span>{String(index + 1).padStart(2, "0")}</span></div>
            <small>{scope}</small><h3>{title}</h3>
            <ul>{features.map((feature) => <li key={feature}><Check />{feature}</li>)}</ul>
            <a href={`#dashboard-role-${id}`}>View interface <Monitor /></a>
          </motion.article>
        ))}
      </div>

      <div className="role-dashboard-gallery">
        {roles.map(({ id, Icon, title, scope, summary, image, width, height }, index) => (
          <motion.article
            id={`dashboard-role-${id}`}
            className="role-dashboard-panel"
            key={id}
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.16 }}
            transition={{ duration: 0.65 }}
          >
            <div className="role-dashboard-copy">
              <span><Icon /> ROLE {String(index + 1).padStart(2, "0")} · {scope}</span>
              <h3>{title} dashboard</h3>
              <p>{summary}</p>
            </div>
            <figure>
              <div className="dashboard-window-bar">
                <div><i /><i /><i /></div>
                <span>spectraleaf / {id}</span>
                <small><Radio /> SECURE ROLE VIEW</small>
              </div>
              <Image
                src={getAssetPath(image)}
                alt={`Spectra Leaf ${title} dashboard interface`}
                width={width}
                height={height}
                sizes="(max-width: 760px) 96vw, 88vw"
              />
              <figcaption>{title} · {scope}</figcaption>
            </figure>
          </motion.article>
        ))}
      </div>

      <motion.div className="mobile-dashboard-companion" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div><span className="chip-label">MOBILE COMPANION</span><h3>Live batch context travels with the factory officer.</h3><p>The mobile interface keeps active batches, latest readings and sensor trends visible away from the desktop command centre.</p></div>
        <figure><Image src={getAssetPath("/assets/images/dashbord/mobile_dashbord.jpeg")} alt="Spectra Leaf mobile dashboard" width={812} height={1600} sizes="(max-width: 760px) 68vw, 280px" /><figcaption><Smartphone /> Field-ready monitoring</figcaption></figure>
      </motion.div>
    </section>
  );
}
