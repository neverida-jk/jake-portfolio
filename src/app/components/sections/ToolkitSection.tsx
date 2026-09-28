// Placeholder for Phase 5. Shows the shared tools registry as grouped
// chips so the section reads as intentional, not empty — the full
// verb-grouped, cross-highlighting Toolkit (§6.4) replaces this later.
import React from "react";
import { tools, type ToolGroup } from "@/content/tools";

const GROUP_META: Record<ToolGroup, { title: string; blurb: string }> = {
  build: { title: "Build", blurb: "Making the thing exist." },
  test: { title: "Test", blurb: "Making sure it doesn't break." },
  ship: { title: "Ship", blurb: "Getting it in front of people." },
};

const GROUP_ORDER: ToolGroup[] = ["build", "test", "ship"];

export default function ToolkitSection() {
  return (
    <section id="toolkit" aria-labelledby="toolkit-heading" className="reveal-item px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-line">
        <h2 id="toolkit-heading" className="text-xl sm:text-2xl font-display text-ink tracking-tight">
          The Toolkit
        </h2>
        <span className="text-xs font-mono text-ink-3">Grouped by what it does</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {GROUP_ORDER.map((group) => (
          <div key={group} className="bg-surface border border-line rounded-2xl p-5 space-y-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-summit block">
                {GROUP_META[group].title}
              </span>
              <p className="text-xs text-ink-2 mt-0.5">{GROUP_META[group].blurb}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tools
                .filter((t) => t.group === group)
                .map((t) => (
                  <span
                    key={t.id}
                    className="px-2.5 py-1 rounded-full bg-raised border border-line text-[11px] font-mono text-ink-2"
                  >
                    {t.label}
                  </span>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
