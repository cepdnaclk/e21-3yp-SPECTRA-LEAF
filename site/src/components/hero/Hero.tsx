"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { project } from "@/data/project";
import { getAssetPath } from "@/lib/paths";

export function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-visual" aria-hidden="true">
        <Image
          className="hero-image-dark"
          src={getAssetPath("/assets/images/hero/leaf1.jpg")}
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <Image
          className="hero-image-light"
          src={getAssetPath("/assets/images/hero/leaf3.jpg")}
          alt=""
          fill
          priority
          sizes="100vw"
        />
      </div>
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
    </section>
  );
}
