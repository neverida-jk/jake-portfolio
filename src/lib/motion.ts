// JS-side motion tokens. See ASCENT_MASTERPLAN.md §3.4.
export const spring = {
  snappy: { type: "spring", stiffness: 520, damping: 32, mass: 0.6 }, // taps, buttons, chips
  smooth: { type: "spring", stiffness: 220, damping: 30, mass: 0.9 }, // layout, shared elements
  lazy: { type: "spring", stiffness: 110, damping: 26, mass: 1.2 }, // parallax, large surfaces
  sheet: { type: "spring", stiffness: 340, damping: 38 }, // bottom sheets, modals
} as const;

export const ease = {
  out: [0.16, 1, 0.3, 1], // reveals — the workhorse
  inOut: [0.65, 0, 0.35, 1], // state changes
  in: [0.55, 0, 1, 0.45], // exits
} as const;

export const dur = { micro: 0.12, sm: 0.22, md: 0.4, reveal: 0.7, cinematic: 1.2 } as const;
export const stagger = { tight: 0.035, normal: 0.055, loose: 0.09 } as const;
