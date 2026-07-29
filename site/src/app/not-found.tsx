import { ArrowLeft, Leaf } from "lucide-react";

export default function NotFound() {
  return (
    <main className="not-found">
      <Leaf />
      <span>404 / SIGNAL LOST</span>
      <h1>This telemetry path does not exist.</h1>
      <p>Return to the Spectra Leaf system overview.</p>
      <a href="./"><ArrowLeft /> Back to system</a>
    </main>
  );
}
