"use client";

import { motion } from "framer-motion";
import { Database, Gauge, ScanLine, Sparkles } from "lucide-react";
import { project } from "@/data/project";

const chapters = [
  {
    icon: ScanLine,
    verb: "Observe",
    note: "Replace instinct-only checks with a view of the living leaf bed.",
    accent: "text-lime",
    line: "bg-lime",
    wash: "from-lime/[0.08]",
    glow: "shadow-[0_0_24px_rgba(156,240,91,0.3)]",
  },
  {
    icon: Gauge,
    verb: "Measure",
    note: "Give the shift team immediate context while the batch is active.",
    accent: "text-tea",
    line: "bg-tea",
    wash: "from-tea/[0.08]",
    glow: "shadow-[0_0_24px_rgba(36,200,117,0.3)]",
  },
  {
    icon: Database,
    verb: "Understand",
    note: "Keep every signal attached to its batch and final quality result.",
    accent: "text-cyan",
    line: "bg-cyan",
    wash: "from-cyan/[0.08]",
    glow: "shadow-[0_0_24px_rgba(86,200,216,0.3)]",
  },
  {
    icon: Sparkles,
    verb: "Automate",
    note: "Turn accumulated evidence into future endpoint intelligence.",
    accent: "text-copper",
    line: "bg-copper",
    wash: "from-copper/[0.08]",
    glow: "shadow-[0_0_24px_rgba(198,122,67,0.3)]",
  },
] as const;

export function Objectives() {
  return (
    <section id="objectives" className="section objectives overflow-visible">
      <motion.header
        className="grid grid-cols-1 gap-7 border-t [border-color:var(--line)] pt-6 lg:grid-cols-[120px_minmax(0,1fr)_minmax(260px,340px)] lg:gap-10"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--sage)]">
          <span className="text-tea">02</span>
          <span>Objectives</span>
        </div>
        <div>
          <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.16em] text-lime">Journey / 01—04</p>
          <h2 className="m-0 max-w-[900px] text-[clamp(44px,6vw,86px)] font-medium leading-[0.98] tracking-[-0.06em] text-[color:var(--cream)]">
            From a human reading<br />
            <span className="font-light text-[color:var(--sage)]">to a system that learns.</span>
          </h2>
        </div>
        <div className="self-end border-l [border-color:var(--line)] pl-6 lg:pb-2">
          <p className="m-0 text-[15px] leading-7 text-[color:var(--sage)]">
            Four deliberate moves connect the factory floor to future intelligence—without removing expert judgement from the process.
          </p>
        </div>
      </motion.header>

      <div className="mt-20 grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        <motion.aside
          className="h-fit lg:sticky lg:top-28"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.15em] text-tea">
            <span className="h-2 w-2 rounded-full bg-tea shadow-[0_0_14px_rgba(36,200,117,0.75)]" />
            Mission path
          </div>
          <p className="mt-6 max-w-[190px] text-[13px] leading-6 text-[color:var(--sage)]">
            Each chapter makes the next possible. The value is in the continuity, not an isolated feature.
          </p>
          <div className="mt-9 hidden items-center gap-3 font-mono text-[9px] uppercase tracking-[0.12em] text-[color:var(--sage)] lg:flex">
            <span>Present</span>
            <span className="h-px w-12 bg-gradient-to-r from-tea to-transparent" />
            <span>Future</span>
          </div>
        </motion.aside>

        <div className="relative border-y [border-color:var(--line)]">
          <div className="pointer-events-none absolute bottom-0 left-[34px] top-0 w-px bg-gradient-to-b from-lime via-tea to-copper md:left-[43px]" aria-hidden="true" />
          <motion.span
            className="pointer-events-none absolute left-[30px] top-0 z-20 h-2.5 w-2.5 rounded-full bg-lime shadow-[0_0_20px_rgba(156,240,91,0.9)] md:left-[39px]"
            animate={{ top: ["1%", "98%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            aria-hidden="true"
          />

          {project.objectives.map((objective, index) => {
            const chapter = chapters[index];
            const Icon = chapter.icon;

            return (
              <motion.article
                key={objective.title}
                className="group relative grid min-h-[210px] grid-cols-[70px_minmax(0,1fr)] overflow-hidden border-b [border-color:var(--line)] last:border-b-0 md:grid-cols-[88px_minmax(210px,0.8fr)_minmax(260px,1.2fr)_120px]"
                initial={{ opacity: 0, x: index % 2 === 0 ? 34 : -34 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.75, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className={`pointer-events-none absolute inset-0 origin-left scale-x-0 bg-gradient-to-r ${chapter.wash} to-transparent transition-transform duration-700 ease-out group-hover:scale-x-100`} aria-hidden="true" />

                <div className="relative z-10 flex justify-center pt-8">
                  <div className={`grid h-9 w-9 place-items-center rounded-full border bg-[color:var(--forest)] [border-color:var(--line)] ${chapter.accent} ${chapter.glow}`}>
                    <Icon size={15} strokeWidth={1.5} aria-hidden="true" />
                  </div>
                </div>

                <div className="relative z-10 py-8 pr-5 md:flex md:flex-col md:justify-center md:py-10">
                  <span className={`mb-3 font-mono text-[9px] uppercase tracking-[0.16em] ${chapter.accent}`}>
                    Chapter {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="m-0 text-[clamp(25px,2.4vw,38px)] font-medium leading-none tracking-[-0.045em] text-[color:var(--cream)]">
                    {objective.title}
                  </h3>
                </div>

                <div className="relative z-10 col-start-2 px-0 pb-8 pr-5 md:col-start-auto md:flex md:flex-col md:justify-center md:border-l md:px-8 md:py-10 [border-color:var(--line)]">
                  <p className="m-0 max-w-[520px] text-[13px] leading-6 text-[color:var(--sage)]">{objective.text}</p>
                  <p className="mb-0 mt-4 font-mono text-[9px] leading-5 text-[color:var(--sage)] opacity-60">{chapter.note}</p>
                </div>

                <div className="relative z-10 col-start-2 flex items-center justify-between border-t [border-color:var(--line)] py-4 pr-5 md:col-start-auto md:flex-col md:justify-center md:border-l md:border-t-0 md:px-4 md:py-10">
                  <strong className={`font-mono text-[10px] uppercase tracking-[0.15em] ${chapter.accent}`}>{chapter.verb}</strong>
                  <span className="font-mono text-4xl font-light tracking-[-0.08em] text-[color:var(--sage)] opacity-20 md:mt-auto md:text-6xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <span className={`absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 ${chapter.line} transition-transform duration-700 group-hover:scale-x-100`} aria-hidden="true" />
              </motion.article>
            );
          })}
        </div>
      </div>

      <div className="mt-10 flex items-center gap-5 font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--sage)] opacity-60">
        <span>Human observation</span>
        <span className="h-px flex-1 bg-gradient-to-r from-lime via-tea to-copper" />
        <span>Assisted intelligence</span>
      </div>
    </section>
  );
}
