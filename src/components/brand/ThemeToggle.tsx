"use client";

import { Moon, Sun } from "lucide-react";
import { cx } from "@/lib/cx";

type ThemeToggleProps = {
  tone?: "default" | "inverse";
};

export function ThemeToggle({ tone = "default" }: ThemeToggleProps) {
  function toggle() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("koda-theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Alternar tema"
      className={cx(
        "inline-flex h-10 w-10 items-center justify-center rounded-sm transition-colors",
        tone === "inverse" ? "text-ivory hover:bg-white/10" : "text-foreground hover:bg-surface",
      )}
    >
      <Sun aria-hidden size={18} className="theme-icon-dark" />
      <Moon aria-hidden size={18} className="theme-icon-light" />
    </button>
  );
}
