"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { gallery } from "@/data/gallery";
import { getAssetPath } from "@/lib/paths";

export function Gallery() {
  const [selected, setSelected] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  const close = () => {
    setSelected(null);
    window.setTimeout(() => openerRef.current?.focus(), 0);
  };
  const step = (direction: number) => setSelected((current) => current === null ? 0 : (current + direction + gallery.length) % gallery.length);

  useEffect(() => {
    if (selected === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", keyboard);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", keyboard);
    };
  }, [selected]);

  const active = selected === null ? null : gallery[selected];

  return (
    <section id="gallery" className="section gallery-section">
      <SectionHeading
        index="12"
        eyebrow="During the project"
        title="From fresh leaves to a working prototype."
        description="A look behind the process: preparing samples, building the sensing system and validating it through hands-on laboratory work."
      />
      <div className="gallery-grid">
        {gallery.map((item, index) => (
          <motion.button
            key={item.title}
            ref={(node) => { if (selected === index) openerRef.current = node; }}
            type="button"
            className={`gallery-item gallery-${item.accent} ${index === 1 || index === 6 ? "gallery-wide" : ""}`}
            onClick={(event) => { openerRef.current = event.currentTarget; setSelected(index); }}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {item.image ? (
              <Image src={getAssetPath(item.image)} alt={item.alt} width={1200} height={800} sizes="(max-width: 760px) 100vw, 35vw" />
            ) : (
              <div className="gallery-placeholder" aria-hidden="true"><ImageIcon /><span>PROJECT IMAGE PLACEHOLDER</span><i /><i /><i /></div>
            )}
            <span className="gallery-overlay"><small>{item.category}</small><strong>{item.title}</strong></span>
            <Expand className="gallery-expand" aria-hidden="true" />
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {active && (
          <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label={active.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button ref={closeRef} className="lightbox-close" type="button" onClick={close} aria-label="Close gallery"><X /></button>
            <button className="lightbox-prev" type="button" onClick={() => step(-1)} aria-label="Previous image"><ChevronLeft /></button>
            <motion.div className={`lightbox-content gallery-${active.accent}`} initial={{ scale: 0.96 }} animate={{ scale: 1 }}>
              {active.image ? <Image src={getAssetPath(active.image)} alt={active.alt} width={1600} height={1000} sizes="90vw" /> : <div className="gallery-placeholder"><ImageIcon /><span>IMAGE TO BE ADDED</span></div>}
              <div><small>{active.category} · {String((selected ?? 0) + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}</small><h3>{active.title}</h3><p>{active.alt}</p></div>
            </motion.div>
            <button className="lightbox-next" type="button" onClick={() => step(1)} aria-label="Next image"><ChevronRight /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
