import { SectionHeading } from "@/components/layout/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { timeline } from "@/data/timeline";

export function Timeline() {
  return (
    <section id="timeline" className="section timeline-section">
      <SectionHeading
        index="11"
        eyebrow="Project timeline"
        title="Eight phases. One connected system."
        description="Neutral status values keep the plan honest while the hardware, cloud and data tracks converge."
      />
      <div className="timeline">
        {timeline.map(([phase, title, status], index) => (
          <Reveal className="timeline-item" delay={index * 0.035} key={phase}>
            <div className="timeline-node"><span>{phase}</span><i /></div>
            <div><small>PHASE {phase}</small><h3>{title}</h3></div>
            <em>{status}</em>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
