"use client";

import { motion } from "framer-motion";
import { Cloud, Cpu, Monitor, Radio } from "lucide-react";

const layers = [
  {
    label: "Edge",
    signal: "Physical world → telemetry",
    icon: Cpu,
    title: "Capture at the tea bed",
    description: "The ESP32-CAM aligns every reading with the active device, batch and timestamp before secure transmission.",
    items: ["Temperature", "Humidity", "Vision", "MQ137", "TGS2620", "TGS822"],
    accent: "text-lime",
    dot: "bg-lime",
    wash: "from-lime/[0.08]",
    glow: "shadow-[0_0_24px_rgba(156,240,91,0.32)]",
  },
  {
    label: "Cloud",
    signal: "Telemetry → trusted state",
    icon: Cloud,
    title: "Synchronize and preserve",
    description: "AWS services validate incoming data, retain batch history and maintain one shared fermentation state.",
    items: ["IoT Core", "Device Shadow", "Lambda", "API Gateway", "DynamoDB"],
    accent: "text-tea",
    dot: "bg-tea",
    wash: "from-tea/[0.08]",
    glow: "shadow-[0_0_24px_rgba(36,200,117,0.32)]",
  },
  {
    label: "Interface",
    signal: "Trusted state → action",
    icon: Monitor,
    title: "Guide the factory team",
    description: "Authenticated web and mobile views translate the same backend state into role-appropriate controls and insight.",
    items: ["Officer mobile", "Factory dashboard", "Cognito", "Live state"],
    accent: "text-cyan",
    dot: "bg-cyan",
    wash: "from-cyan/[0.08]",
    glow: "shadow-[0_0_24px_rgba(86,200,216,0.32)]",
  },
] as const;

const handoffs = [
  ["01", "Sensor input", "Six physical channels", "Temperature, humidity, imaging and three gas-response signals."],
  ["02", "Edge controller", "ESP32-CAM", "Synchronized capture, device identity and secure Wi-Fi publishing."],
  ["03", "Cloud state", "IoT Core + Device Shadow", "Telemetry transport and one shared RUNNING or STOPPED state."],
  ["04", "Application data", "Lambda + API Gateway + DynamoDB", "Validation, protected operations and batch history."],
  ["05", "Authorized clients", "Cognito + web + mobile", "Role-aware access to controls, trends and completed records."],
];

export function Architecture() {
  return (
    <section id="architecture" className="section architecture overflow-visible">
      <motion.header
        className="grid grid-cols-1 gap-7 border-t [border-color:var(--line)] pt-6 lg:grid-cols-[120px_minmax(0,1fr)_minmax(260px,340px)] lg:gap-10"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--sage)]">
          <span className="text-tea">04</span>
          <span>Architecture</span>
        </div>
        <div>
          <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.16em] text-lime">Signal journey / 01—03</p>
          <h2 className="m-0 max-w-[900px] text-[clamp(44px,6vw,86px)] font-medium leading-[0.98] tracking-[-0.06em] text-[color:var(--cream)]">
            One batch identity.<br />
            <span className="font-light text-[color:var(--sage)]">Every handoff intact.</span>
          </h2>
        </div>
        <div className="self-end border-l [border-color:var(--line)] pl-6 lg:pb-2">
          <p className="m-0 text-[15px] leading-7 text-[color:var(--sage)]">
            Follow a reading from the warm leaf bed, through a secure cloud state, to the people making the next decision.
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
            <Radio size={13} strokeWidth={1.6} aria-hidden="true" />
            Live signal path
          </div>
          <p className="mt-6 max-w-[190px] text-[13px] leading-6 text-[color:var(--sage)]">
            Context is never rebuilt downstream. Device, batch and time travel with every reading.
          </p>
          <dl className="mt-9 grid max-w-[190px] grid-cols-2 gap-y-5 border-t [border-color:var(--line)] pt-5 font-mono text-[9px] uppercase tracking-[0.1em]">
            <dt className="text-[color:var(--sage)]">Transport</dt><dd className="m-0 text-right text-tea">MQTT / TLS</dd>
            <dt className="text-[color:var(--sage)]">Return</dt><dd className="m-0 text-right text-cyan">REST API</dd>
            <dt className="text-[color:var(--sage)]">State</dt><dd className="m-0 text-right text-lime">Shared</dd>
          </dl>
        </motion.aside>

        <div className="relative border-y [border-color:var(--line)]">
          <div className="pointer-events-none absolute bottom-0 left-[34px] top-0 w-px bg-gradient-to-b from-lime via-tea to-cyan md:left-[43px]" aria-hidden="true" />
          <motion.span
            className="pointer-events-none absolute left-[30px] top-0 z-20 h-2.5 w-2.5 rounded-full bg-lime shadow-[0_0_20px_rgba(156,240,91,0.9)] md:left-[39px]"
            animate={{ top: ["1%", "98%"], backgroundColor: ["#9cf05b", "#24c875", "#56c8d8"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
            aria-hidden="true"
          />

          {layers.map((layer, index) => {
            const Icon = layer.icon;

            return (
              <motion.article
                key={layer.label}
                className="group relative grid min-h-[270px] grid-cols-[70px_minmax(0,1fr)] overflow-hidden border-b [border-color:var(--line)] last:border-b-0 md:grid-cols-[88px_minmax(250px,0.8fr)_minmax(300px,1.2fr)]"
                initial={{ opacity: 0, x: index % 2 === 0 ? 34 : -34 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className={`pointer-events-none absolute inset-0 origin-left scale-x-0 bg-gradient-to-r ${layer.wash} to-transparent transition-transform duration-700 ease-out group-hover:scale-x-100`} aria-hidden="true" />

                <div className="relative z-10 flex justify-center pt-9">
                  <div className={`grid h-9 w-9 place-items-center rounded-full border bg-[color:var(--forest)] [border-color:var(--line)] ${layer.accent} ${layer.glow}`}>
                    <Icon size={16} strokeWidth={1.45} aria-hidden="true" />
                  </div>
                </div>

                <div className="relative z-10 py-9 pr-5 md:flex md:flex-col md:justify-center md:py-12">
                  <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[9px] uppercase tracking-[0.15em]">
                    <span className={layer.accent}>{String(index + 1).padStart(2, "0")} / {layer.label}</span>
                    <span className="text-[color:var(--sage)] opacity-55">{layer.signal}</span>
                  </div>
                  <h3 className="m-0 max-w-[390px] text-[clamp(29px,3vw,46px)] font-medium leading-[1.02] tracking-[-0.05em] text-[color:var(--cream)]">
                    {layer.title}
                  </h3>
                </div>

                <div className="relative z-10 col-start-2 px-0 pb-9 pr-5 md:col-start-auto md:flex md:flex-col md:justify-center md:border-l md:px-9 md:py-12 [border-color:var(--line)]">
                  <p className="m-0 max-w-[560px] text-[13px] leading-6 text-[color:var(--sage)]">{layer.description}</p>
                  <div className="mt-7 flex flex-wrap gap-x-3 gap-y-2 font-mono text-[8px] uppercase tracking-[0.08em] text-[color:var(--sage)]">
                    {layer.items.map((item, itemIndex) => (
                      <span className="flex items-center gap-3" key={item}>
                        {itemIndex > 0 && <i className={`h-1 w-1 rounded-full ${layer.dot}`} aria-hidden="true" />}
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <span className={`absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 ${layer.dot} transition-transform duration-700 group-hover:scale-x-100`} aria-hidden="true" />
                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 font-mono text-[clamp(72px,9vw,132px)] font-light tracking-[-0.1em] text-[color:var(--sage)] opacity-[0.035]" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </motion.article>
            );
          })}
        </div>
      </div>

      <motion.div
        className="mt-24 border-t [border-color:var(--line)]"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-8%" }}
        transition={{ duration: 0.75 }}
      >
        <div className="flex items-center justify-between border-b [border-color:var(--line)] py-4 font-mono text-[9px] uppercase tracking-[0.14em]">
          <span className="text-tea">Continuity register</span>
          <span className="text-[color:var(--sage)]">05 verified handoffs</span>
        </div>
        {handoffs.map(([number, name, technology, responsibility]) => (
          <div className="grid gap-2 border-b [border-color:var(--line)] py-5 md:grid-cols-[56px_0.8fr_1fr_1.7fr] md:items-center md:gap-6" key={name}>
            <span className="font-mono text-[9px] text-tea">{number}</span>
            <strong className="text-[14px] font-medium text-[color:var(--cream)]">{name}</strong>
            <small className="font-mono text-[9px] leading-5 text-cyan">{technology}</small>
            <p className="m-0 text-[12px] leading-5 text-[color:var(--sage)]">{responsibility}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
