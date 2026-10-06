import type { Dual } from "./types";

export type MilestoneDetail = {
  heading: string;
  period: string;
  summary: Dual;
  points: string[];
  tags: string[];
};

export type Milestone = {
  id: string;
  year: string;
  /** One-word stage name for markers and the stepper — two milestones share 2026. */
  short: string;
  title: string;
  org: string;
  logo?: string;
  current?: boolean;
  body: Dual;
  detail?: MilestoneDetail;
};

// Verified facts only (ASCENT_MASTERPLAN.md §9.1). Note: "Iskolar ng Bayan"
// is what every UP student is called, not an award — never present it as one.
export const journey = {
  eyebrow: "Then",
  title: "How I got here",
  intro: {
    plain: "Four years of study. One internship. Now QA at Vertere.",
    technical: "UPLB → Limitless Lab → Vertere.",
  } satisfies Dual,
  detailsLabel: "Details",

  milestones: [
    {
      id: "uplb-start",
      year: "2022",
      short: "Start",
      title: "Started Computer Science",
      org: "University of the Philippines Los Baños",
      logo: "/uplb.png",
      body: {
        plain: "Started a Computer Science degree at UP Los Baños.",
        technical: "Algorithms, data structures, databases, operating systems.",
      },
    },
    {
      id: "limitless",
      year: "2025",
      short: "Intern",
      title: "Software Engineer Intern",
      org: "Limitless Lab",
      logo: "/limitlesslab.jpeg",
      body: {
        plain: "My first engineering team. I built real features next to working engineers.",
        technical: "React, Next.js, REST APIs, agile sprints.",
      },
      detail: {
        heading: "Software Engineer Intern · Limitless Lab",
        period: "May 2025 – July 2025",
        summary: {
          plain: "I built parts of real web apps with a cross-functional team.",
          technical: "React, Next.js, TypeScript. Refactored UI for accessibility, responsiveness and state.",
        },
        points: [
          "Built modular, accessible React component libraries and client views",
          "Integrated RESTful API endpoints and handled asynchronous data",
        ],
        tags: ["React", "Next.js", "TypeScript", "REST APIs", "Agile sprints"],
      },
    },
    {
      id: "uplb-grad",
      year: "2026",
      short: "Graduate",
      title: "Graduated",
      org: "BS Computer Science · UP Los Baños",
      logo: "/uplb.png",
      body: {
        plain: "Graduated with a 1.95 GWA. On UP's scale, 1.00 is best.",
        technical: "BS Computer Science, 2022 – 2026. GWA 1.95.",
      },
      detail: {
        heading: "BS Computer Science · UP Los Baños",
        period: "2022 – 2026",
        summary: {
          plain: "Four years of theory, plus building real software.",
          technical: "GWA 1.95 on UP's 1.00–5.00 scale (1.00 highest).",
        },
        points: [
          "Algorithms & complexity: asymptotic analysis, graph algorithms",
          "Data structures & object-oriented design",
          "Database design, query optimization & system design",
          "Operating systems, memory models & concurrency",
        ],
        tags: ["Algorithms", "Data structures", "Databases", "Operating systems"],
      },
    },
    {
      id: "vertere",
      year: "2026",
      short: "Now",
      title: "QA Analyst",
      org: "Vertere Global Solutions Inc.",
      current: true,
      body: {
        plain: "I test enterprise software so problems surface before release.",
        technical: "Test plans, regression suites, defect triage, release gating.",
      },
      detail: {
        heading: "QA Analyst · Vertere Global Solutions Inc.",
        period: "June 2026 – present",
        summary: {
          plain: "I find problems before users do.",
          technical: "Test cases, manual and automated regression, root-cause analysis, release gating.",
        },
        points: [
          "Author test plans and regression suites",
          "Manage the defect lifecycle and isolate root causes",
          "Confirm release gating with engineering leads",
        ],
        tags: ["Test plans", "Regression suites", "Defect management", "Release gating"],
      },
    },
  ] satisfies Milestone[],
};
