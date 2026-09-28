"use client";

// Break It mode (§7.9) — opt-in only. Ten honest, synchronous checks against
// the live DOM. Every check must actually pass on the shipped page; if one
// fails, the fix belongs on the page, not in the check.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { LuBug, LuChevronDown, LuRotateCw, LuX } from "react-icons/lu";
import Dual from "./Dual";
import { copy } from "@/content/copy";
import type { Dual as DualType } from "@/content/copy/types";

interface BreakItHUDProps {
  isOpen: boolean;
  onClose: () => void;
}

type CheckResult = { id: string; label: DualType; pass: boolean; detail?: string; ms: number };

const INK3_RGB = [97, 113, 139];

function parseRgb(css: string): [number, number, number, number] {
  const m = css.match(/rgba?\(([^)]+)\)/);
  if (!m) return [0, 0, 0, 0];
  const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0, parts.length > 3 ? parts[3] : 1];
}

function luminance([r, g, b]: number[]) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrastRatio(a: number[], b: number[]) {
  const L1 = luminance(a);
  const L2 = luminance(b);
  const [lighter, darker] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (lighter + 0.05) / (darker + 0.05);
}

function effectiveBackground(el: Element): [number, number, number] {
  let node: Element | null = el;
  while (node) {
    const [r, g, b, a] = parseRgb(getComputedStyle(node).backgroundColor);
    if (a > 0) return [r, g, b];
    node = node.parentElement;
  }
  const [r, g, b] = parseRgb(getComputedStyle(document.body).backgroundColor);
  return [r, g, b];
}

function accessibleName(el: Element): string {
  const aria = el.getAttribute("aria-label");
  if (aria?.trim()) return aria.trim();
  const labelledby = el.getAttribute("aria-labelledby");
  if (labelledby) {
    const text = labelledby
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ")
      .trim();
    if (text) return text;
  }
  if (el instanceof HTMLInputElement && el.labels?.length) {
    const text = Array.from(el.labels).map((l) => l.textContent ?? "").join(" ").trim();
    if (text) return text;
  }
  if ((el as HTMLInputElement).placeholder?.trim()) return (el as HTMLInputElement).placeholder.trim();
  const title = el.getAttribute("title");
  if (title?.trim()) return title.trim();
  const text = (el.textContent ?? "").trim();
  if (text) return text;
  const img = el.querySelector("img[alt]");
  const alt = img?.getAttribute("alt");
  if (alt?.trim()) return alt.trim();
  return "";
}

function runChecks(): CheckResult[] {
  const labels = copy.common.breakItChecks;
  const results: CheckResult[] = [];

  // 1. Every <img> declares alt (even alt="" for decorative images).
  {
    const start = performance.now();
    const imgs = Array.from(document.querySelectorAll("img"));
    const offenders = imgs.filter((img) => !img.hasAttribute("alt"));
    results.push({ id: "imgAlt", label: labels.imgAlt, pass: offenders.length === 0, ms: performance.now() - start, detail: offenders.length ? `${offenders.length} missing alt` : undefined });
  }

  // 2. Every interactive element has an accessible name.
  {
    const start = performance.now();
    const els = Array.from(document.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea')).filter(
      (el) => el.getAttribute("aria-hidden") !== "true" && el.getAttribute("tabindex") !== "-1" && !(el as HTMLButtonElement).disabled
    );
    const offenders = els.filter((el) => !accessibleName(el));
    results.push({ id: "accessibleNames", label: labels.accessibleNames, pass: offenders.length === 0, ms: performance.now() - start, detail: offenders.length ? `${offenders.length} unnamed` : undefined });
  }

  // 3. No horizontal overflow.
  {
    const start = performance.now();
    const overflow = document.documentElement.scrollWidth - window.innerWidth;
    results.push({ id: "noOverflow", label: labels.noOverflow, pass: overflow <= 1, ms: performance.now() - start, detail: overflow > 1 ? `${overflow}px over` : undefined });
  }

  // 4. Heading hierarchy never skips a level.
  {
    const start = performance.now();
    const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6"));
    let prev = 0;
    let bad: string | undefined;
    for (const h of headings) {
      const level = parseInt(h.tagName[1], 10);
      if (prev > 0 && level > prev + 1) {
        bad = `h${prev} → h${level}`;
        break;
      }
      prev = level;
    }
    results.push({ id: "headingOrder", label: labels.headingOrder, pass: !bad, ms: performance.now() - start, detail: bad });
  }

  // 5. External links set rel="noopener".
  {
    const start = performance.now();
    const links = Array.from(document.querySelectorAll('a[target="_blank"]'));
    const offenders = links.filter((a) => !(a.getAttribute("rel") ?? "").includes("noopener"));
    results.push({ id: "externalLinks", label: labels.externalLinks, pass: offenders.length === 0, ms: performance.now() - start, detail: offenders.length ? `${offenders.length} missing rel` : undefined });
  }

  // 6. Body text (the ink / ink-2 voice, not the dimmer ink-3 meta tier)
  //    contrasts at least 4.5:1 against its effective background.
  {
    const start = performance.now();
    const candidates = Array.from(document.querySelectorAll("p, li")).slice(0, 60);
    let checked = 0;
    let worst: { ratio: number; text: string } | null = null;
    for (const el of candidates) {
      const text = (el.textContent ?? "").trim();
      if (text.length < 20) continue;
      const [r, g, b] = parseRgb(getComputedStyle(el).color);
      const dist = Math.hypot(r - INK3_RGB[0], g - INK3_RGB[1], b - INK3_RGB[2]);
      if (dist < 12) continue; // meta/eyebrow tier — not body copy
      const bg = effectiveBackground(el);
      const ratio = contrastRatio([r, g, b], bg);
      checked++;
      if (!worst || ratio < worst.ratio) worst = { ratio, text: text.slice(0, 24) };
      if (checked >= 15) break;
    }
    const pass = !worst || worst.ratio >= 4.5;
    results.push({ id: "contrast", label: labels.contrast, pass, ms: performance.now() - start, detail: worst && !pass ? `${worst.ratio.toFixed(2)}:1 on "${worst.text}…"` : undefined });
  }

  // 7. The contact email field rejects a malformed address (validity API,
  //    never actually submitted).
  {
    const start = performance.now();
    const input = document.getElementById("contact-email") as HTMLInputElement | null;
    let pass = false;
    if (input) {
      const original = input.value;
      input.value = "not-an-email";
      pass = !input.checkValidity() && input.validity.typeMismatch;
      input.value = original;
    }
    results.push({ id: "emailValidation", label: labels.emailValidation, pass, ms: performance.now() - start, detail: input ? undefined : "field not found" });
  }

  // 8. A :focus-visible rule is defined somewhere in the stylesheets.
  {
    const start = performance.now();
    let found = false;
    try {
      for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRuleList;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        for (const rule of Array.from(rules)) {
          const text = rule.cssText;
          // Tailwind's focus-visible:ring-* utilities compile to a
          // box-shadow on a :focus-visible selector — a solid, unambiguous
          // signal that a ring is actually drawn (vs. just "outline: none",
          // which alone would prove the opposite).
          if (text.includes("focus-visible") && text.includes("box-shadow")) {
            found = true;
            break;
          }
        }
        if (found) break;
      }
    } catch {
      // ignore
    }
    results.push({ id: "focusRing", label: labels.focusRing, pass: found, ms: performance.now() - start });
  }

  // 9. prefers-reduced-motion: reduce is handled in CSS.
  {
    const start = performance.now();
    let found = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").media !== "not all";
    if (found) {
      found = false;
      try {
        for (const sheet of Array.from(document.styleSheets)) {
          let rules: CSSRuleList;
          try {
            rules = sheet.cssRules;
          } catch {
            continue;
          }
          for (const rule of Array.from(rules)) {
            if (rule instanceof CSSMediaRule && rule.conditionText.includes("prefers-reduced-motion")) {
              found = true;
              break;
            }
          }
          if (found) break;
        }
      } catch {
        // ignore
      }
    }
    results.push({ id: "reducedMotion", label: labels.reducedMotion, pass: found, ms: performance.now() - start });
  }

  // 10. No console errors since Break It mode started watching.
  results.push({ id: "consoleClean", label: labels.consoleClean, pass: consoleErrorCount === 0, ms: 0, detail: consoleErrorCount ? `${consoleErrorCount} logged` : undefined });

  return results;
}

// Module-scoped so the counter survives a collapse/expand of the panel —
// only unmounting (closing) Break It mode stops the watch.
let consoleErrorCount = 0;
let originalConsoleError: typeof console.error | null = null;

export default function BreakItHUD({ isOpen, onClose }: BreakItHUDProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const [ranAt, setRanAt] = useState<number | null>(null);
  const idleHandle = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    consoleErrorCount = 0;
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      consoleErrorCount += 1;
      originalConsoleError?.(...args);
    };
    return () => {
      if (originalConsoleError) console.error = originalConsoleError;
    };
  }, [isOpen]);

  const rerun = useCallback(() => {
    const schedule = window.requestIdleCallback ?? ((cb: IdleRequestCallback) => window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 } as IdleDeadline), 1));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    if (idleHandle.current !== null) cancel(idleHandle.current);
    idleHandle.current = schedule(() => {
      setResults(runChecks());
      setRanAt(Date.now());
    }) as number;
  }, []);

  useEffect(() => {
    if (isOpen) rerun();
  }, [isOpen, rerun]);

  if (!isOpen) return null;

  const passing = results?.filter((r) => r.pass).length ?? 0;
  const total = results?.length ?? 0;

  return (
    <div
      className="fixed bottom-4 left-4 z-[160] w-[min(340px,calc(100vw-2rem))] rounded-2xl border border-line bg-surface shadow-[var(--e3)]"
      role="region"
      aria-label="Break It mode"
      data-print-hide
    >
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-line">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left cursor-pointer"
          aria-expanded={!collapsed}
        >
          <LuBug className="h-3.5 w-3.5 shrink-0 text-summit" aria-hidden="true" />
          <span className="truncate text-xs font-mono text-ink">
            {results ? `${passing}/${total} passing` : "Running…"}
          </span>
          <LuChevronDown className={`h-3.5 w-3.5 shrink-0 text-ink-3 transition-transform ${collapsed ? "-rotate-90" : ""}`} aria-hidden="true" />
        </button>
        <button type="button" onClick={rerun} title="Re-run checks" className="shrink-0 rounded-lg p-1.5 text-ink-3 hover:bg-raised hover:text-ink cursor-pointer">
          <LuRotateCw className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={onClose} title="Close" aria-label="Close Break It mode" className="shrink-0 rounded-lg p-1.5 text-ink-3 hover:bg-raised hover:text-ink cursor-pointer">
          <LuX className="h-3.5 w-3.5" />
        </button>
      </div>

      {!collapsed && (
        <div className="max-h-[50vh] space-y-1 overflow-y-auto p-2.5 scrollbar-hide">
          {(results ?? []).map((r) => (
            <div key={r.id} className="flex items-start gap-2.5 rounded-xl px-2 py-1.5">
              <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${r.pass ? "bg-moss" : "bg-alert"}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <Dual value={r.label} note="none" className="text-xs text-ink" />
                {r.detail && <p className="mt-0.5 font-mono text-[10px] text-ink-3">{r.detail}</p>}
              </div>
              <span className="shrink-0 font-mono text-[10px] text-ink-3 tabular-nums">{r.ms.toFixed(1)}ms</span>
            </div>
          ))}
          {ranAt && <p className="px-2 pt-1 font-mono text-[10px] text-ink-3">Last run {new Date(ranAt).toLocaleTimeString()}</p>}
        </div>
      )}
    </div>
  );
}
