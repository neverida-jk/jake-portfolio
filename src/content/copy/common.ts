import type { Dual } from "./types";

// Cross-section strings (nav labels, shared microcopy).
export const common = {
  breakIt: "Try to break this page →",
  soundInvite: "this page has sound · enable",
  sudoHire:
    "Opportunity noted — thank you. I'd genuinely love to talk. Reach out any time:",

  // Break It mode (§7.9) — one Dual label per honest, synchronous check.
  breakItChecks: {
    imgAlt: {
      plain: "Every image has alt text",
      technical: "img[alt] present on every rendered <img>.",
    } satisfies Dual,
    accessibleNames: {
      plain: "Buttons and links have real names",
      technical: "Every interactive element exposes an accessible name.",
    } satisfies Dual,
    noOverflow: {
      plain: "Nothing spills off the side",
      technical: "document.scrollWidth never exceeds the viewport width.",
    } satisfies Dual,
    headingOrder: {
      plain: "Headings are in a sensible order",
      technical: "No heading level is skipped (h2 → h4 without an h3).",
    } satisfies Dual,
    externalLinks: {
      plain: "External links open safely",
      technical: 'Every target="_blank" link sets rel="noopener".',
    } satisfies Dual,
    contrast: {
      plain: "Body text is easy to read",
      technical: "Sampled ink/ink-2 body text ≥ 4.5:1 against its background.",
    } satisfies Dual,
    emailValidation: {
      plain: "The contact form catches typos",
      technical: "The email field's validity API rejects a malformed address.",
    } satisfies Dual,
    focusRing: {
      plain: "Keyboard focus is visible",
      technical: "A :focus-visible rule is defined in the stylesheet.",
    } satisfies Dual,
    reducedMotion: {
      plain: "Motion respects your OS setting",
      technical: "prefers-reduced-motion: reduce is handled in CSS.",
    } satisfies Dual,
    consoleClean: {
      plain: "No console errors since this check started watching",
      technical: "console.error has been silent since Break It mode mounted.",
    } satisfies Dual,
  },
};
