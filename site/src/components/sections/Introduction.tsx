import { ArrowRight, CircleAlert, CircleCheck } from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const problem = [
  "Subjective visual judgement",
  "Inconsistent batch quality",
  "No synchronized sensor history",
  "Limited remote visibility",
  "No suitable local training dataset",
];
const solution = [
  "Quantified sensor measurements",
  "Real-time factory guidance",
  "Batch-linked historical records",
  "Secure remote access",
  "AI-ready structured telemetry",
];

export function Introduction() {
  return (
    <section id="introduction" className="section introduction">
      <SectionHeading
        index="01"
        eyebrow="The process"
        title="Where craft meets a measurable signal."
        description="Spectra Leaf does not replace tea-making expertise. It gives that expertise a synchronized digital instrument."
      />
      <div className="intro-copy">
        <Reveal>
          <p className="lead">The Spectra Leaf Fermentation System is an Industrial Internet of Things solution designed to digitize and optimize tea fermentation.</p>
        </Reveal>
        <Reveal delay={0.08}>
          <p>Traditional fermentation depends heavily on operator experience, manual observation and subjective judgement. The correct “sweet spot” can vary between operators and batches, affecting colour, aroma, quality and yield.</p>
          <p>Spectra Leaf replaces isolated observations with synchronized temperature, gas and colour telemetry. Factory officers receive live information through a remote dashboard during an active batch.</p>
          <p>Each profile is linked to the final Good Leaf Percentage, creating the proprietary evidence base needed for future machine-learning-based sweet-spot detection.</p>
        </Reveal>
      </div>
      <div className="compare-grid">
        <Reveal className="compare-card problem-card">
          <div className="compare-title"><CircleAlert /><span>Current constraint</span><strong>MANUAL</strong></div>
          {problem.map((item, index) => <div className="compare-row" key={item}><span>0{index + 1}</span>{item}</div>)}
        </Reveal>
        <div className="compare-arrow" aria-hidden="true"><ArrowRight /></div>
        <Reveal className="compare-card solution-card" delay={0.12}>
          <div className="compare-title"><CircleCheck /><span>Spectra Leaf response</span><strong>CONNECTED</strong></div>
          {solution.map((item, index) => <div className="compare-row" key={item}><span>0{index + 1}</span>{item}</div>)}
        </Reveal>
      </div>
    </section>
  );
}
