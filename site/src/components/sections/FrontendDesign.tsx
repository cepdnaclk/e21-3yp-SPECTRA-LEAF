import { ArrowRight, CheckCircle2, Database, KeyRound, LockKeyhole, MonitorSmartphone, Network, RefreshCw, ShieldCheck, Smartphone } from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const features = [
  [MonitorSmartphone, "Next.js + React", "Responsive operational interface"],
  [KeyRound, "Amazon Cognito", "Managed user identity and sign-in"],
  [ShieldCheck, "Protected requests", "JWT attached to authorized APIs"],
  [RefreshCw, "Session continuity", "Token refresh across active work"],
  [Smartphone, "Responsive access", "Desktop, tablet and mobile"],
  [CheckCircle2, "Clear batch state", "Active work stays visually prominent"],
];

const stack = [
  [MonitorSmartphone, "Experience", "Next.js · React · TypeScript · Tailwind CSS"],
  [Network, "Integration", "AWS Amplify v6 · REST APIs · MQTT state"],
  [Database, "Cloud data", "DynamoDB · Lambda · API Gateway · IoT Core"],
  [LockKeyhole, "Identity", "Amazon Cognito · JWT · role claims"],
];

export function FrontendDesign() {
  return (
    <section id="software" className="section software-section">
      <SectionHeading
        index="07"
        eyebrow="Software platform"
        title="A calm interface for a live industrial process."
        description="The software stack turns synchronized telemetry into clear, role-appropriate actions while keeping identity and protected cloud access in one managed flow."
      />
      <div className="stack-board">
        <div className="stack-board-heading"><span className="chip-label">IMPLEMENTED TECHNOLOGY STACK</span><p>Frameworks, languages, cloud services and security components used across the platform.</p></div>
        <div className="stack-grid">
          {stack.map(([Icon, label, items]) => {
            const StackIcon = Icon as typeof MonitorSmartphone;
            return <div key={label as string}><StackIcon /><span>{label as string}</span><strong>{items as string}</strong></div>;
          })}
        </div>
      </div>
      <div className="software-layout">
        <Reveal className="software-copy">
          <span className="chip-label">CLIENT STACK / AWS AMPLIFY v6</span>
          <h3>Secure access without operational friction.</h3>
          <p>Next.js and React power the responsive interface, while TypeScript and Tailwind CSS provide a consistent implementation and visual language. Amplify connects Cognito identity to protected cloud services and preserves session continuity through token refresh.</p>
          <p>Active batches, device connectivity and fermentation progress remain visible across desktop, tablet and mobile.</p>
        </Reveal>
        <div className="software-features">
          {features.map(([Icon, title, text]) => {
            const FeatureIcon = Icon as typeof CheckCircle2;
            return <Reveal key={title as string} className="software-feature"><FeatureIcon /><div><h3>{title as string}</h3><p>{text as string}</p></div></Reveal>;
          })}
        </div>
      </div>

      <Reveal className="security-panel">
        <div className="security-copy"><span className="chip-label">SECURITY / AMAZON COGNITO</span><h3>Identity is checked before operational data is exposed.</h3><p>Cognito manages sign-in and session tokens. The client attaches a valid JSON Web Token to protected requests, where authorization rules can distinguish factory officers, factory managers and general managers.</p></div>
        <div className="security-flow" aria-label="Cognito authentication flow">
          <span><KeyRound /><strong>1. Sign in</strong><small>Cognito user pool</small></span><ArrowRight />
          <span><ShieldCheck /><strong>2. Verify</strong><small>JWT + role claims</small></span><ArrowRight />
          <span><LockKeyhole /><strong>3. Authorize</strong><small>Protected API access</small></span>
        </div>
      </Reveal>
    </section>
  );
}
