"use client";

import {
  Activity,
  Check,
  Clock3,
  Database,
  GitBranch,
  History,
  Layers3,
  Palette,
  Percent,
  Sparkles,
  Thermometer,
  Timer,
  TrendingUp,
  TriangleAlert,
  Wind,
} from "lucide-react";
import Image from "next/image";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { getAssetPath } from "@/lib/paths";

const features = [
  [Thermometer, "Rate of temperature rise"],
  [Wind, "VOC trend slope"],
  [Palette, "Colour change rate"],
  [Timer, "Elapsed fermentation time"],
  [Activity, "Combined sensor signatures"],
  [History, "Historical batch similarity"],
  [Percent, "Good Leaf Percentage labels"],
];
const outputs = [
  ["Under-fermented", Clock3],
  ["Approaching optimum", TrendingUp],
  ["Sweet spot reached", Check],
  ["Over-fermentation risk", TriangleAlert],
];

export function MachineLearning() {
  return (
    <section id="machine-learning" className="section ml-section" aria-label="Future machine learning concept">
      <SectionHeading
        index="09"
        eyebrow="Future ML concept"
        title="First build the evidence. Then build the model."
        description="Machine learning is planned future work. The current contribution is a reliable, batch-linked and expert-labelled dataset."
      />
      <div className="ml-status-row" data-reveal>
        <span><i /> DATASET LAYER ACTIVE</span>
        <span>INFERENCE LAYER · FUTURE WORK</span>
      </div>

      <div className="ml-workbench">
        <div className="ml-artboard" data-reveal>
          <Image
            src={getAssetPath("/assets/images/ml-signal-field.jpg")}
            alt="Concept artwork showing synchronized sensor signals converging around a tea leaf"
            fill
            sizes="(max-width: 760px) 100vw, 68vw"
            loading="lazy"
          />
          <div className="ml-artboard-shade" />
          <div className="ml-artboard-head">
            <span>01 / SIGNAL FUSION</span>
            <small>CONCEPT VISUAL</small>
          </div>
          <div className="ml-model-marker">
            <GitBranch aria-hidden="true" />
            <span><strong>Temporal model</strong><small>Multi-sensor sequence classification</small></span>
          </div>
          <div className="ml-current-note"><Database /> Batch-linked evidence available now</div>
        </div>

        <aside className="ml-decision-panel" data-reveal aria-label="Possible future model outputs">
          <div className="ml-decision-head">
            <span>02 / DECISION LAYER</span>
            <Sparkles aria-hidden="true" />
          </div>
          <h3>One evolving batch.<br />Four clear states.</h3>
          <p>The future model would interpret the full time-series—not a single threshold—and surface a simple operational signal.</p>
          <div className="ml-outputs">
            {outputs.map(([label, Icon], index) => {
              const OutputIcon = Icon as typeof Clock3;
              return (
                <div key={label as string}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <OutputIcon />
                  <strong>{label as string}</strong>
                </div>
              );
            })}
          </div>
          <small className="ml-boundary"><Layers3 /> Concept only · no live predictions</small>
        </aside>
      </div>

      <div className="ml-feature-rail" data-reveal>
        <span>PROPOSED MODEL FEATURES</span>
        <div>
          {features.map(([Icon, feature]) => {
            const FeatureIcon = Icon as typeof Thermometer;
            return <span key={feature as string}><FeatureIcon />{feature as string}</span>;
          })}
        </div>
      </div>

      <div className="ml-roadline" data-reveal>
        <div><span>01</span><strong>Capture</strong><small>Sensor profiles by batch</small><em>ACTIVE</em></div>
        <div><span>02</span><strong>Label</strong><small>Pair profiles with expert GLP</small><em>DATA PHASE</em></div>
        <div><span>03</span><strong>Train</strong><small>Validate a time-series model</small><em>FUTURE</em></div>
      </div>
    </section>
  );
}
