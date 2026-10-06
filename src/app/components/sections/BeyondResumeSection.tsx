"use client";

// Beyond the Resume: a small portrait and four short lines about who I am
// outside the job.
import React from "react";
import Image from "next/image";
import { copy } from "@/content/copy";

export default function BeyondResumeSection() {
  const { title, meta, items } = copy.beyond;

  return (
    <section id="beyond" aria-labelledby="beyond-heading" className="reveal-item mx-auto max-w-5xl px-4 sm:px-6" data-print-hide>
      <div className="mb-6 flex items-center justify-between gap-3 border-b border-line pb-2">
        <h2 id="beyond-heading" className="font-display text-xl tracking-tight text-ink sm:text-2xl">
          {title}
        </h2>
        <span className="font-mono text-xs text-ink-3">{meta}</span>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
        <Image
          src="/jake.jpg"
          alt="Jake Neverida"
          width={600}
          height={600}
          className="h-28 w-28 shrink-0 rounded-2xl border border-line object-cover object-top sm:h-36 sm:w-36"
        />
        <ul className="w-full divide-y divide-line border-y border-line">
          {items.map((it) => (
            <li key={it.label} className="grid gap-1 py-3 sm:grid-cols-[7rem_1fr] sm:items-baseline sm:gap-6">
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">{it.label}</span>
              <span className="text-ink">
                {it.text}
                {it.note && <span className="mt-0.5 block font-mono text-xs text-ink-3">{it.note}</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
