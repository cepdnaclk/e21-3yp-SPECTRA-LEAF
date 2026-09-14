"use client";

import {
  Activity,
  ArrowRight,
  Check,
  Clock3,
  GitBranch,
  History,
  Palette,
  Percent,
  Thermometer,
  Timer,
  TrendingUp,
  TriangleAlert,
  Wind,
} from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";

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
    <section className="section ml-section" aria-label="Future machine learning concept">
      <SectionHeading
        index="09"
        eyebrow="Future ML concept"
        title="First build the evidence. Then build the model."
        description="Machine learning is planned future work. The current contribution is a reliable, batch-linked and expert-labelled dataset."
      />
      <div className="future-label">FUTURE WORK · NOT YET DEPLOYED</div>
      <div className="ml-visual">
        <div className="ml-inputs">
          <span>MODEL FEATURES</span>
          {features.map(([Icon, feature]) => {
            const FeatureIcon = Icon as typeof Thermometer;
            return <div data-reveal key={feature as string}><FeatureIcon />{feature as string}</div>;
          })}
        </div>
        <div className="ml-core">
          <div className="brain-rings" aria-hidden="true"><i /><i /><i /></div>
          <GitBranch />
          <span>FUTURE MODEL</span>
          <small>Multi-sensor time-series classification</small>
        </div>
        <div className="ml-outputs">
          <span>POSSIBLE OUTPUTS</span>
          {outputs.map(([label, Icon]) => {
            const OutputIcon = Icon as typeof Clock3;
            return (
              <div data-reveal key={label as string}>
                <OutputIcon />{label as string}<ArrowRight />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
