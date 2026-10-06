"use client";

import { useEffect, useState } from "react";

// Section ids/order per ASCENT_MASTERPLAN.md §4. "beyond" has no nav entry
// but still gets a waypoint on the chronometer rail.
export const SECTION_IDS = ["hero", "journey", "work", "toolkit", "testimonials", "beyond", "contact"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

// One shared IntersectionObserver for the whole site (§5.3) — Navbar and
// Chronometer both call useActiveSection() and both read from this single
// observer instead of each running their own scroll listener.
let observer: IntersectionObserver | null = null;
let activeId: SectionId = "hero";
const listeners = new Set<(id: SectionId) => void>();

function ensureObserver() {
  if (observer || typeof window === "undefined") return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id as SectionId;
          if (id !== activeId) {
            activeId = id;
            listeners.forEach((listener) => listener(id));
          }
        }
      });
    },
    { rootMargin: "-45% 0px -45% 0px" }
  );

  SECTION_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer!.observe(el);
  });
}

export function useActiveSection(): SectionId {
  const [id, setId] = useState<SectionId>(activeId);

  useEffect(() => {
    ensureObserver();
    listeners.add(setId);
    return () => {
      listeners.delete(setId);
    };
  }, []);

  return id;
}
