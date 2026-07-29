"use client";

import { AnimatePresence, motion } from "framer-motion";
import { GitBranch, Leaf, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/data/navigation";
import { project } from "@/data/project";
import { useActiveSection } from "@/hooks/useActiveSection";

const sectionIds = ["introduction", "architecture", "hardware", "data", "testing", "team"] as const;
type Theme = "dark" | "light";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<Theme | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const active = useActiveSection(sectionIds);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 32);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    window.localStorage.setItem("spectra-leaf-theme", nextTheme);
    setTheme(nextTheme);
  };

  return (
    <header className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <a className="wordmark" href="#home" aria-label="Spectra Leaf home">
        <Leaf aria-hidden="true" />
        <span>SPECTRA <b>LEAF</b></span>
      </a>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navigation.map((item) => {
          const id = item.href.slice(1);
          return <a key={item.href} className={active === id ? "active" : ""} href={item.href}>{item.label}</a>;
        })}
      </nav>
      <div className="nav-actions">
        <button
          className="theme-toggle"
          type="button"
          aria-label={theme ? `Switch to ${theme === "light" ? "dark" : "light"} theme` : "Toggle color theme"}
          title={theme ? `Switch to ${theme === "light" ? "dark" : "light"} theme` : "Toggle color theme"}
          onClick={toggleTheme}
        >
          <Sun className="theme-icon-light" aria-hidden="true" />
          <Moon className="theme-icon-dark" aria-hidden="true" />
        </button>
        <a className="github-link" href={project.githubUrl} target="_blank" rel="noreferrer">
          <GitBranch aria-hidden="true" /> GitHub
        </a>
        <button
          ref={menuButtonRef}
          className="menu-button"
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-navigation"
            className="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <p>Navigate the system</p>
            {navigation.map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <span>0{index + 1}</span>{item.label}
              </motion.a>
            ))}
            <a className="mobile-github" href={project.githubUrl} target="_blank" rel="noreferrer">
              View repository <GitBranch />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
