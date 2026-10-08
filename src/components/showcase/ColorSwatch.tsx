"use client";

import { useState } from "react";
import type { Swatch } from "@/lib/brand";

export function ColorSwatch({ name, hex, usage, tone }: Swatch) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      const area = document.createElement("textarea");
      area.value = hex;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      style={{ backgroundColor: hex, color: tone === "dark" ? "#F4F1E8" : "#171917" }}
      className="flex min-h-44 flex-col justify-between rounded-sm border border-border p-4 text-left transition-colors"
      aria-label={`Copiar ${hex}, ${name}`}
    >
      <span className="text-xs font-semibold tracking-[0.14em] uppercase">{copied ? "Copiado" : "Copiar"}</span>
      <span>
        <span className="block text-lg font-semibold tracking-tight">{name}</span>
        <span className="mt-1 block text-sm font-medium tracking-wide">{hex}</span>
        <span className="mt-2 block text-sm leading-snug opacity-80">{usage}</span>
      </span>
      <span className="sr-only" aria-live="polite">
        {copied ? `${hex} copiado` : ""}
      </span>
    </button>
  );
}
