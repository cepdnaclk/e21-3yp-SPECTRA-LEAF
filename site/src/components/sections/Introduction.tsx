import { Activity, ArrowRight, CircleAlert, CircleCheck, CloudCog, Gauge, ScanSearch } from "lucide-react";
import Image from "next/image";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getAssetPath } from "@/lib/paths";

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

const process = [
  ["01", "Wither", "Reduce leaf moisture"],
  ["02", "Roll / CTC", "Disrupt leaf cells"],
  ["03", "Oxidize", "Monitor this phase"],
  ["04", "Dry", "Stop oxidation"],
];

const method = [
  [ScanSearch, "Sense", "Sample temperature, gas and leaf colour at the same time."],
  [CloudCog, "Synchronize", "Publish batch-linked readings securely through AWS IoT."],
  [Gauge, "Guide", "Show live progress and device state to the factory officer."],
  [Activity, "Learn", "Pair each completed profile with its final Good Leaf Percentage."],
];

export function Introduction() {
  return (
    <section id="introduction" className="section introduction">
      <SectionHeading
        index="01"
        eyebrow="Project overview"
        title="Make tea oxidation visible, repeatable and ready to learn from."
        description="Spectra Leaf aims to digitize the most judgement-sensitive stage of black-tea production and help factories reproduce a better fermentation sweet spot from measured evidence."
      />

      <div className="intro-copy">
        <Reveal>
          <p className="lead">Spectra Leaf is an Industrial IoT system that measures what happens across the tea bed, sends the signals to a secure cloud platform and turns them into live operational guidance.</p>
        </Reveal>
        <Reveal delay={0.08}>
          <p>Tea makers commonly call the post-rolling stage “fermentation”. Technically, the main transformation is enzymatic oxidation: rolling or CTC ruptures the leaf cells, oxygen reaches the compounds inside, and colour and aroma develop across the moist solid leaf bed.</p>
          <p>This is the phase Spectra Leaf addresses. Temperature, volatile-gas response and colour are captured together so a factory officer can follow the batch without depending on isolated visual checks alone.</p>
        </Reveal>
      </div>

      <Reveal className="process-overview">
        <figure className="process-image">
          <Image
            src={getAssetPath("/assets/images/fermentation-trough.jpg")}
            alt="Tea leaves spread across a fermentation trough during the monitored oxidation stage"
            width={1400}
            height={900}
            sizes="(max-width: 760px) 100vw, 56vw"
          />
          <figcaption><span>MONITORED PHASE</span> Post-rolling enzymatic oxidation</figcaption>
        </figure>
        <div className="process-copy">
          <span className="chip-label">BLACK TEA PROCESS / TARGET PHASE</span>
          <h3>The project observes the window between rolling and drying.</h3>
          <p>Leaves are spread as a solid bed while oxygen-driven reactions develop the expected coppery colour and characteristic aroma. Drying then arrests the reaction. Spectra Leaf concentrates its measurements and guidance inside this changing window.</p>
          <div className="process-steps">
            {process.map(([number, title, detail], index) => (
              <div className={index === 2 ? "is-active" : ""} key={title}>
                <span>{number}</span><strong>{title}</strong><small>{detail}</small>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="automation-method">
        <div className="automation-heading">
          <span className="chip-label">THE AUTOMATED METHOD</span>
          <h3>Sense. Synchronize. Guide. Learn.</h3>
          <p>The system automates data capture, cloud synchronization, batch history and live visualization. Expert quality evaluation remains part of the loop and supplies the labels needed for future prediction.</p>
        </div>
        <div className="automation-grid">
          {method.map(([Icon, title, text], index) => {
            const MethodIcon = Icon as typeof Activity;
            return <Reveal className="automation-card" delay={index * 0.05} key={title as string}><MethodIcon /><span>0{index + 1}</span><h4>{title as string}</h4><p>{text as string}</p></Reveal>;
          })}
        </div>
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
