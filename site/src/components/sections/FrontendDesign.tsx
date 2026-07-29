import { CheckCircle2, KeyRound, MonitorSmartphone, RefreshCw, ShieldCheck, Smartphone } from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const features = [
  [MonitorSmartphone, "Next.js + React", "Responsive operational interface"],
  [KeyRound, "Amazon Cognito", "Secure SRP authentication"],
  [ShieldCheck, "Protected requests", "JWT attached to authorized APIs"],
  [RefreshCw, "Session continuity", "Token refresh across active work"],
  [Smartphone, "Responsive access", "Desktop, tablet and mobile"],
  [CheckCircle2, "Clear batch state", "Active work stays visually prominent"],
];

export function FrontendDesign() {
  return (
    <section id="software" className="section software-section">
      <SectionHeading
        index="07"
        eyebrow="Frontend software"
        title="A calm interface for a live industrial process."
        description="The dashboard turns a complex telemetry stream into clear actions for factory officers."
      />
      <div className="software-layout">
        <Reveal className="software-copy">
          <span className="chip-label">CLIENT STACK / AWS AMPLIFY v6</span>
          <h3>Secure access without operational friction.</h3>
          <p>Next.js and React power the responsive interface, while Tailwind CSS provides a consistent system language. Amplify connects Cognito identity to protected cloud services and preserves session continuity through token refresh.</p>
          <p>Active batches, device connectivity and fermentation progress remain visible across desktop, tablet and mobile.</p>
        </Reveal>
        <div className="software-features">
          {features.map(([Icon, title, text]) => {
            const FeatureIcon = Icon as typeof CheckCircle2;
            return <Reveal key={title as string} className="software-feature"><FeatureIcon /><div><h3>{title as string}</h3><p>{text as string}</p></div></Reveal>;
          })}
        </div>
      </div>
    </section>
  );
}
