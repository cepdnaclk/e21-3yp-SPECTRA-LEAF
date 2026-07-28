"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const statuses = [
  "Initializing edge sensors",
  "Connecting telemetry channels",
  "Synchronizing cloud state",
  "Experience ready",
];

export function LoadingIntro() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduced) {
      setVisible(false);
      return;
    }
    const sequence = window.setInterval(
      () => setStep((current) => Math.min(current + 1, statuses.length - 1)),
      260,
    );
    const close = window.setTimeout(() => setVisible(false), 1250);
    return () => {
      window.clearInterval(sequence);
      window.clearTimeout(close);
    };
  }, [reduced]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="loading-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: "-8%" }}
          transition={{ duration: 0.45 }}
          aria-hidden="true"
        >
          <div className="loading-mark">SL</div>
          <div>
            <p className="loading-title">SPECTRA LEAF</p>
            <p className="loading-status">{statuses[step]}</p>
          </div>
          <div className="loading-track"><span style={{ width: `${((step + 1) / statuses.length) * 100}%` }} /></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
