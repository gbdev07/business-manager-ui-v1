"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { sections } from "@/lib/brand";
import { cx } from "@/lib/cx";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function SiteShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>(sections[0].id);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function update() {
      const marker = 140;
      let current: string = sections[0].id;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= marker) current = section.id;
      }
      setActive((previous) => (previous === current ? previous : current));
    }

    const frame = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("hashchange", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("hashchange", update);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function linkClass(id: string) {
    const current = active === id;
    return cx(
      "flex items-baseline gap-3 rounded-sm px-3 py-2 text-sm transition-colors",
      current ? "bg-white/10 text-ivory" : "text-ivory/70 hover:bg-white/10 hover:text-ivory",
    );
  }

  const navLinks = sections.map((section) => (
    <a
      key={section.id}
      href={`#${section.id}`}
      aria-current={active === section.id ? "true" : undefined}
      className={linkClass(section.id)}
      onClick={() => setOpen(false)}
    >
      <span className="w-6 font-medium text-xs tracking-[0.14em] text-green">{section.index}</span>
      {section.label}
    </a>
  ));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-ivory focus:px-4 focus:py-2 focus:text-graphite"
      >
        Pular para o conteúdo
      </a>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-graphite px-4 py-3 text-ivory lg:hidden">
        <Logo variant="on-dark" className="h-7 w-auto" alt="KODA" />
        <div className="flex items-center gap-1">
          <Link href="/login" className="px-2 text-sm text-ivory/80 hover:text-ivory">
            Entrar
          </Link>
          <ThemeToggle tone="inverse" />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm hover:bg-white/10"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen(true)}
          >
            <Menu aria-hidden size={18} />
            <span className="sr-only">Abrir menu</span>
          </button>
        </div>
      </header>

      {open ? (
        <div
          id="menu-mobile"
          role="dialog"
          aria-modal="true"
          aria-label="Seções da identidade"
          className="fixed inset-0 z-50 flex flex-col bg-graphite px-5 py-4 text-ivory lg:hidden"
        >
          <div className="flex items-center justify-between">
            <Logo variant="on-dark" className="h-7 w-auto" alt="" />
            <button
              ref={closeRef}
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              <X aria-hidden size={18} />
              <span className="sr-only">Fechar menu</span>
            </button>
          </div>
          <nav className="mt-8 grid gap-1">{navLinks}</nav>
        </div>
      ) : null}

      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-screen flex-col border-r border-white/10 bg-graphite text-ivory lg:flex">
          <div className="px-5 pt-7">
            <Logo variant="on-dark" className="h-8 w-auto" alt="KODA" />
          </div>
          <nav aria-label="Seções da identidade" className="mt-10 grid gap-1 px-3">
            {navLinks}
          </nav>
          <div className="mt-auto flex items-center justify-between gap-3 px-4 py-5">
            <Link href="/login" className="text-sm text-ivory/80 hover:text-ivory">
              Entrar
            </Link>
            <ThemeToggle tone="inverse" />
          </div>
        </aside>
        <div id="conteudo" className="min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
