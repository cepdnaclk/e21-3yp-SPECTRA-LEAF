"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Database, Gauge, ScanLine, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { project } from "@/data/project";

const icons = [ScanLine, Gauge, Database, Sparkles];
const accents = [
  { text: "text-lime", border: "border-lime/40", glow: "shadow-[0_0_45px_rgba(156,240,91,0.12)]" },
  { text: "text-tea", border: "border-tea/40", glow: "shadow-[0_0_45px_rgba(36,200,117,0.12)]" },
  { text: "text-cyan", border: "border-cyan/40", glow: "shadow-[0_0_45px_rgba(86,200,216,0.12)]" },
  { text: "text-copper", border: "border-copper/40", glow: "shadow-[0_0_45px_rgba(198,122,67,0.12)]" },
] as const;
const outcomes = ["Observe", "Measure", "Understand", "Automate"];

export function Objectives() {
  return (
    <section id="objectives" className="section objectives overflow-hidden">
      <SectionHeading
        index="02"
        eyebrow="Key objectives"
        title="A deliberate path from observation to automation."
        description="Four connected capabilities create value now while preparing the system for future intelligence."
      />

      <div className="relative mt-20 -mx-[max(24px,calc((100vw-1440px)/2))] overflow-x-auto px-[max(24px,calc((100vw-1440px)/2))] pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="relative min-w-[980px] pb-4 pt-4 md:min-w-0">
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-sage/15" aria-hidden="true" />
          <motion.div
            className="pointer-events-none absolute left-0 top-1/2 h-px w-full origin-left -translate-y-1/2 bg-gradient-to-r from-lime/70 via-tea/70 to-copper/70"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          />

          <div className="relative grid grid-cols-4 gap-4">
            {project.objectives.map((objective, index) => {
              const Icon = icons[index];
              const accent = accents[index];
              const isTop = index % 2 === 0;

              return (
                <motion.article
                  key={objective.title}
                  className={`group relative flex min-h-[430px] flex-col ${isTop ? "justify-end pb-[calc(50%+2.25rem)]" : "pt-[calc(50%+2.25rem)]"}`}
                  initial={{ opacity: 0, y: isTop ? -24 : 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ delay: index * 0.13, duration: 0.7, ease: "easeOut" }}
                >
                  <span
                    className={`pointer-events-none absolute left-1/2 h-9 w-px -translate-x-1/2 ${isTop ? "bottom-1/2 bg-gradient-to-t" : "top-1/2 bg-gradient-to-b"} from-transparent to-sage/35`}
                    aria-hidden="true"
                  />
                  <motion.div
                    className={`absolute left-1/2 top-1/2 z-10 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-forest text-xs font-medium tracking-[0.16em] transition-transform duration-500 group-hover:scale-110 ${accent.border} ${accent.text}`}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.13 + 0.2, type: "spring", stiffness: 220, damping: 14 }}
                  >
                    <span className="absolute inset-1 rounded-full border border-sage/10" />
                    {String(index + 1).padStart(2, "0")}
                  </motion.div>

                  <div className={`relative overflow-hidden border bg-deep-green/55 p-5 backdrop-blur-md transition duration-500 group-hover:-translate-y-2 group-hover:bg-deep-green/90 ${accent.border} ${accent.glow}`}>
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-60" />
                    <div className="mb-8 flex items-start justify-between gap-4">
                      <div className={`grid h-10 w-10 place-items-center border border-sage/20 bg-forest/50 ${accent.text}`}>
                        <Icon size={17} strokeWidth={1.5} aria-hidden="true" />
                      </div>
                      <span className="pt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-sage/60">Phase {String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="mb-3 text-xl font-medium leading-tight tracking-[-0.035em] text-cream">{objective.title}</h3>
                    <p className="min-h-[4.5rem] text-[13px] leading-6 text-sage">{objective.text}</p>
                    <div className="mt-6 flex items-center justify-between border-t border-sage/15 pt-4 font-mono text-[9px] uppercase tracking-[0.15em] text-sage/55">
                      <span>{outcomes[index]}</span>
                      <ArrowUpRight className={`h-4 w-4 transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 ${accent.text}`} aria-hidden="true" />
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-sage/45">
        <span>Manual signal</span>
        <span className="mx-6 hidden h-px flex-1 bg-sage/15 sm:block" />
        <span>Intelligent response</span>
      </div>
    </section>
  );
}
