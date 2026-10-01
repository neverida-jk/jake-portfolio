import type { Dual } from "./copy/types";

/* ==========================================================================
   PROJECTS — the one file to edit when you swap the apps on the site.

   To add, remove or replace a project:
     1. Drop a screenshot in /public/projects/ — 1280x800, JPG, under ~220 KB.
     2. Add / edit / delete an entry in `projects` below. Order = display order.
     3. That's it. Nothing else in the codebase names a project or hardcodes
        how many there are — the hero's "products live" count, the carousel,
        the case studies and the Skills cross-highlighting all read from here.

   Field notes:
     - `tools` are ids from src/content/tools.ts. They drive the Skills-section
       cross-highlighting, so only list tools the project really uses.
     - `stack` is the display list shown in the case study (any labels).
     - `hotspots` pin notes onto the screenshot. x / y are 0–1 fractions of
       the image (0,0 = top-left). Keep it to 3–4; retake the screenshot →
       re-check the coordinates.
     - Every Dual has `plain` (what a non-technical visitor reads) and
       `technical` (the small mono field note beneath it).
   ========================================================================== */

export type Hotspot = {
  id: string;
  x: number; // 0-1, relative to the image box
  y: number; // 0-1, relative to the image box
  label: string;
  body: Dual;
};

export type Project = {
  id: string;
  title: string;
  domain: string;
  liveUrl: string;
  thumbnail: string;
  category: string;
  /** Fictional "altitude" badge, consistent with the ascent motif. */
  elevation: number;
  tagline: string;
  tools: string[];
  stack: string[];
  problem: Dual;
  constraint: Dual;
  decisions: Dual[];
  outcome: Dual;
  hotspots: Hotspot[];
};

export const projects: Project[] = [
  {
    id: "quant",
    title: "Prediction Market Edge Engine",
    domain: "quant.dev-jk.me",
    liveUrl: "https://quant.dev-jk.me",
    thumbnail: "/projects/quant.jpg",
    category: "Quantitative research",
    elevation: 2410,
    tagline: "Spotting when prediction-market odds are wrong — and sizing bets sensibly.",
    tools: ["typescript", "react"],
    stack: ["TypeScript", "React", "Probability modeling", "Kelly criterion"],
    problem: {
      plain: "Prediction markets price real events like odds. Sometimes the odds are wrong — I wanted to know if you could reliably spot when.",
      technical: "Detect mispricing between market-implied probabilities and independent forecasts, and size positions rationally.",
    },
    constraint: {
      plain: "Being wrong costs real money, so it had to prove itself before being trusted.",
      technical: "No edge claim without statistical validity; capital at risk only after simulated validation.",
    },
    decisions: [
      { plain: "Test with pretend money first.", technical: "Isolated paper ($200 sim) and live ledgers." },
      { plain: "Risk less than the maths says you can.", technical: "Quarter-Kelly sizing, hard-capped at $5 per position." },
      { plain: "Wait for enough results before believing it.", technical: "An n = 50 resolved-market gate before any edge counts as real." },
    ],
    outcome: {
      plain: "Live and collecting data — and honest about what it doesn't know yet.",
      technical: "Deployed in alpha: data-collection phase, paper trading only.",
    },
    hotspots: [
      {
        id: "honest",
        x: 0.34,
        y: 0.27,
        label: "Honest by default",
        body: {
          plain: "It admits it doesn't know yet — nothing is trusted until 50 markets resolve.",
          technical: "Sample-size gate: the edge stays “theoretical” until n = 50 resolved markets.",
        },
      },
      {
        id: "paper",
        x: 0.18,
        y: 0.35,
        label: "Paper first",
        body: {
          plain: "Every strategy runs on pretend money before real money.",
          technical: "Paper and live ledgers are isolated; strategies validate in simulation first.",
        },
      },
      {
        id: "sizing",
        x: 0.86,
        y: 0.63,
        label: "Bet sizing",
        body: {
          plain: "A formula decides how much to risk — and deliberately risks less than the maximum.",
          technical: "Quarter-Kelly position sizing, capped at $5 per position.",
        },
      },
      {
        id: "calibration",
        x: 0.6,
        y: 0.04,
        label: "Calibration",
        body: {
          plain: "Checks whether its predictions actually came true over time.",
          technical: "Forecast calibration tracking (Brier scoring) against realised outcomes.",
        },
      },
    ],
  },
  {
    id: "tropa",
    title: "Tropa",
    domain: "tropa.dev-jk.me",
    liveUrl: "https://tropa.dev-jk.me",
    thumbnail: "/projects/tropa.jpg",
    category: "Full-stack web app",
    elevation: 1980,
    tagline: "Plan a group climb — trail, schedule, gear and shared costs — in one place.",
    tools: ["nextjs", "react", "typescript", "tailwind"],
    stack: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS"],
    problem: {
      plain: "Planning a group climb lived in messy group chats and spreadsheets.",
      technical: "Group climb logistics fragmented across chats and sheets, with no single source of truth.",
    },
    constraint: {
      plain: "It had to be easy for the least techy person in the group.",
      technical: "Minimal-friction onboarding for non-technical participants.",
    },
    decisions: [
      { plain: "Join with a short code, not an invite chain.", technical: "Code-based join into a shared, per-climb workspace." },
      { plain: "The trail, schedule and gear in one place.", technical: "One itinerary model: trail, van/trailhead timetable, gear & permits." },
      { plain: "Costs tracked from the first invite to the final split.", technical: "Multi-party shared-expense ledger through to settlement." },
    ],
    outcome: {
      plain: "Live — the whole trip in one place.",
      technical: "Next.js App Router, React 19, Tailwind CSS — deployed and live.",
    },
    hotspots: [
      {
        id: "start",
        x: 0.43,
        y: 0.45,
        label: "Start a climb",
        body: {
          plain: "Pick a mountain and build the plan — trail, schedule, gear.",
          technical: "Guided climb creation: trail selection, transport timetables, gear & permit tracking.",
        },
      },
      {
        id: "code",
        x: 0.565,
        y: 0.45,
        label: "Climb codes",
        body: {
          plain: "Friends join with a short code instead of a sprawling group chat.",
          technical: "Code-based join flow into a shared, per-climb workspace.",
        },
      },
      {
        id: "split",
        x: 0.5,
        y: 0.35,
        label: "Cost splitting",
        body: {
          plain: "Tracks who paid for what, all the way to the final split.",
          technical: "Multi-party shared-expense ledger, from first invite to settlement.",
        },
      },
    ],
  },
  {
    id: "finance",
    title: "Finance Tracker",
    domain: "finance.dev-jk.me",
    liveUrl: "https://finance.dev-jk.me",
    thumbnail: "/projects/finance.jpg",
    category: "Offline-first app",
    elevation: 1640,
    tagline: "A private budget app that works offline and explains your money in plain words.",
    tools: ["react", "typescript"],
    stack: ["React", "Dexie.js (IndexedDB)", "Recharts", "Framer Motion", "PWA"],
    problem: {
      plain: "I wanted a budget app that's fast, private, and works offline.",
      technical: "A private, local-first finance tracker with genuinely useful analytics.",
    },
    constraint: {
      plain: "Everything had to work with no internet connection.",
      technical: "Offline-first: full functionality with no network; all data persisted client-side.",
    },
    decisions: [
      { plain: "Your data never leaves your device.", technical: "Dexie.js over IndexedDB for local persistence." },
      { plain: "Advice in plain language, not just charts.", technical: "Rule-based insights against the 50/30/20 guideline, week/month windows." },
      { plain: "Installs like an app.", technical: "Installable PWA; Recharts analytics and Framer Motion transitions." },
    ],
    outcome: {
      plain: "Live — private by design.",
      technical: "Deployed as an installable PWA.",
    },
    hotspots: [
      {
        id: "offline",
        x: 0.5,
        y: 0.15,
        label: "Offline-first",
        body: {
          plain: "Your data stays on your device and works without internet.",
          technical: "Dexie.js over IndexedDB — local-first persistence.",
        },
      },
      {
        id: "logging",
        x: 0.41,
        y: 0.46,
        label: "One-tap logging",
        body: {
          plain: "Logging spending is one tap from the dashboard.",
          technical: "Transaction entry as the primary dashboard action.",
        },
      },
      {
        id: "health",
        x: 0.5,
        y: 0.78,
        label: "Finance health",
        body: {
          plain: "Reads your month and explains your budget split in plain words.",
          technical: "Rule-based insight engine against the 50/30/20 guideline.",
        },
      },
    ],
  },
  {
    id: "portfolio-v2",
    title: "This portfolio",
    // TODO(jake): confirm the canonical domain — the old copy showed dev-jk.me
    // but linked to GitHub Pages.
    domain: "dev-jk.me",
    liveUrl: "https://neverida-jk.github.io/portfolio",
    // TODO(jake): this screenshot shows the previous design — retake it after
    // the redesign ships, then add hotspots.
    thumbnail: "/projects/portfolio-v2.jpg",
    category: "Design & engineering",
    elevation: 2954,
    tagline: "The site you're on — built to work for recruiters and engineers alike.",
    tools: ["nextjs", "react", "typescript", "tailwind"],
    stack: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS v4", "Framer Motion", "Web Audio"],
    problem: {
      plain: "A portfolio has to work for recruiters, engineers, and everyone in between.",
      technical: "Serve non-technical and technical audiences from one site without diluting either.",
    },
    constraint: {
      plain: "Impressive, but never confusing or slow.",
      technical: "Transform/opacity-only motion, full keyboard & screen-reader support, reduced-motion parity.",
    },
    decisions: [
      { plain: "Plain words first, technical detail right beneath.", technical: "Two-voice copy: primary text plus a mono field note — no mode toggle." },
      { plain: "Scrolling is a climb to the summit.", technical: "Scroll-linked sky interpolation and altimeter, one fixed layer." },
      { plain: "Every project is data, so it's easy to update.", technical: "Single projects registry drives cards, case studies and skill cross-links." },
    ],
    outcome: {
      plain: "You're looking at it.",
      technical: "Next.js 15 · React 19 · Tailwind v4 · Framer Motion — no extra dependencies.",
    },
    hotspots: [],
  },
];

export function projectById(id: string) {
  return projects.find((p) => p.id === id);
}
