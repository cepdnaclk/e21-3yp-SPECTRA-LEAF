"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, BrainCircuit, CircleCheck, Clock3, TrendingUp } from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";

const features = [
  "Rate of temperature rise",
  "VOC trend slope",
  "Colour change rate",
  "Elapsed fermentation time",
  "Combined sensor signatures",
  "Historical batch similarity",
  "Good Leaf Percentage labels",
];
const outputs = [
  ["Under-fermented", Clock3],
  ["Approaching optimum", TrendingUp],
  ["Sweet spot reached", CircleCheck],
  ["Over-fermentation risk", AlertTriangle],
];

export function MachineLearning() {
  return (
    <section className="section ml-section" aria-labelledby="ml-title">
      <SectionHeading
        index="08"
        eyebrow="Future ML concept"
        title="First build the evidence. Then build the model."
        description="Machine learning is planned future work. The current contribution is a reliable, batch-linked and expert-labelled dataset."
      />
      <div className="future-label" id="ml-title">FUTURE WORK · NOT YET DEPLOYED</div>
      <div className="ml-visual">
        <div className="ml-inputs">
          <span>MODEL FEATURES</span>
          {features.map((feature, index) => (
            <motion.div key={feature} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
              <i />{feature}
            </motion.div>
          ))}
        </div>
        <div className="ml-core">
          <div className="brain-rings" aria-hidden="true"><i /><i /><i /></div>
          <BrainCircuit />
          <span>FUTURE MODEL</span>
          <small>Multi-sensor time-series classification</small>
        </div>
        <div className="ml-outputs">
          <span>POSSIBLE OUTPUTS</span>
          {outputs.map(([label, Icon], index) => {
            const OutputIcon = Icon as typeof Clock3;
            return (
              <motion.div key={label as string} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
                <OutputIcon />{label as string}<ArrowRight />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
