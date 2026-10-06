"use client";

// The Toolkit (§6.4 / Phase 5). Verb-grouped chips that light themselves up
// on hover (siblings dim), plus one shared evidence line driven by the
// active tool. No logo grid, no per-chip badge.
import React, { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { tools, projectsUsingTool, type ToolGroup } from "@/content/tools";
import { copy } from "@/content/copy";
import Dual from "@/components/system/Dual";
import { useToolFocus } from "@/components/system/ToolFocusProvider";

const GROUP_ORDER: ToolGroup[] = ["build", "test", "ship"];
const GROUP_LABEL: Record<ToolGroup, string> = { build: "Build", test: "Test", ship: "Ship" };

export default function ToolkitSection() {
  const { focusedTool, setFocusedTool } = useToolFocus();
  const reduceMotion = useReducedMotion();
  // Dimming is a hover-driven affordance; touch devices get the same
  // context value via tap, but never the dim/glow treatment (spec: "no
  // dimming is applied" on touch or under reduced motion).
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);
  const dimEnabled = canHover && !reduceMotion;
  // Phones show one group at a time, switched by tabs.
  const [tab, setTab] = useState<ToolGroup>("build");

  const activeTool = useMemo(() => tools.find((t) => t.id === focusedTool) ?? null, [focusedTool]);

  const evidence = useMemo(() => {
    if (!activeTool) return null;
    if (activeTool.group === "test") return "Daily work at Vertere Global Solutions Inc.";
    const count = projectsUsingTool(activeTool.id).length;
    return count > 0 ? `Used in ${count} project${count === 1 ? "" : "s"}.` : "";
  }, [activeTool]);

  return (
    <section id="toolkit" aria-labelledby="toolkit-heading" className="reveal-item px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-line">
        <h2 id="toolkit-heading" className="text-xl sm:text-2xl font-display text-ink tracking-tight">
          The Toolkit
        </h2>
      </div>

      <div role="tablist" aria-label="Toolkit groups" className="mb-4 grid grid-cols-3 gap-1 rounded-full border border-line bg-surface p-1 sm:hidden">
        {GROUP_ORDER.map((g) => (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={tab === g}
            onClick={() => setTab(g)}
            className={`rounded-full py-2 font-mono text-xs transition-colors cursor-pointer ${tab === g ? "bg-summit text-void" : "text-ink-2"}`}
          >
            {GROUP_LABEL[g]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {GROUP_ORDER.map((group) => (
          <div key={group} className={`bg-surface border border-line rounded-2xl p-5 space-y-3 ${tab === group ? "" : "hidden"} sm:block`}>
            <div>
              <span className="hidden text-[10px] font-mono uppercase tracking-wider text-summit sm:block">
                {GROUP_LABEL[group]}
              </span>
              <Dual value={copy.toolkit[group]} className="text-xs text-ink-2 mt-0.5" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tools
                .filter((t) => t.group === group)
                .map((t) => {
                  const isLit = dimEnabled && focusedTool === t.id;
                  const isDimmed = dimEnabled && !!focusedTool && focusedTool !== t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onMouseEnter={dimEnabled ? () => setFocusedTool(t.id) : undefined}
                      onMouseLeave={dimEnabled ? () => setFocusedTool(null) : undefined}
                      onFocus={dimEnabled ? () => setFocusedTool(t.id) : undefined}
                      onBlur={dimEnabled ? () => setFocusedTool(null) : undefined}
                      onClick={!dimEnabled ? () => setFocusedTool(focusedTool === t.id ? null : t.id) : undefined}
                      className={`px-2.5 py-1 rounded-full border text-[11px] font-mono transition-all duration-200 cursor-pointer ${
                        isLit
                          ? "bg-void border-summit/50 text-ink"
                          : isDimmed
                            ? "bg-raised border-line text-ink-3 opacity-35 grayscale"
                            : "bg-raised border-line text-ink-2 hover:border-ink-3/50"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div aria-live="polite" className="mt-6 min-h-[1.5rem] text-center text-xs font-mono text-ink-3">
        {activeTool ? evidence : "Tap a tool to see where it's used."}
      </div>
    </section>
  );
}
