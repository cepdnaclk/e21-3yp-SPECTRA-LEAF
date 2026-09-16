"use client";

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
        <p className="eyebrow">
          {project.eyebrow}
        </p>
        <h1 aria-label="Spectra Leaf">
          {"SPECTRA".split("").map((letter, index) => (
            <span key={`${letter}-${index}`}>{letter}</span>
          ))}
          <br />
          <em>LEAF</em>
        </h1>
        <h2>
          {project.subtitle}
        </h2>
        <p className="hero-description">
          {project.description}
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#introduction">Explore the System <ArrowRight /></a>
          <a className="button button-secondary" href="#architecture">View Architecture</a>
        </div>
      </div>
    </section>
  );
}
