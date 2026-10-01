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
  eyebrow: "The route",
  title: "How I got here",
  intro: {
    plain: "Four years of study, one internship, and now a job making sure software holds up.",
    technical: "2022 → present · BS CS (UPLB) → SWE intern (Limitless Lab) → QA Analyst (Vertere).",
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
        plain: "Began a Computer Science degree at UP Los Baños.",
        technical: "BS CS — algorithms & complexity, data structures, databases, operating systems.",
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
        plain: "My first professional team — building real features alongside working engineers.",
        technical: "React/Next.js feature work, REST API integration, component libraries, agile sprints.",
      },
      detail: {
        heading: "Software Engineer Intern · Limitless Lab",
        period: "May 2025 – July 2025",
        summary: {
          plain: "Built parts of real web applications with a cross-functional engineering team.",
          technical:
            "React, Next.js and TypeScript; refactored UI components for accessibility, responsiveness and state management.",
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
        plain: "Graduated with a 1.95 GWA — on UP's scale, 1.00 is the top mark.",
        technical: "BS Computer Science, 2022 – 2026 · GWA 1.95 (UP grading scale, 1.00 highest).",
      },
      detail: {
        heading: "BS Computer Science · UP Los Baños",
        period: "2022 – 2026",
        summary: {
          plain: "A four-year degree that paired computer science theory with building real software.",
          technical: "Cumulative GWA 1.95 on UP's 1.00–5.00 scale (1.00 highest).",
        },
        points: [
          "Algorithms & complexity — asymptotic analysis, graph algorithms",
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
        plain: "Now I make sure enterprise software works before it reaches the people who depend on it.",
        technical: "Test planning, regression suites, defect lifecycle & root-cause isolation, release readiness.",
      },
      detail: {
        heading: "QA Analyst · Vertere Global Solutions Inc.",
        period: "June 2026 – present",
        summary: {
          plain: "I test enterprise software so problems are caught before release, not after.",
          technical:
            "Test case authoring, manual and automated regression suites, defect isolation & root-cause analysis, release QA.",
        },
        points: [
          "Author test plans and regression suites",
          "Manage the defect lifecycle and isolate root causes",
          "Verify release readiness with engineering leads",
        ],
        tags: ["Test plans", "Regression suites", "Defect management", "Release quality"],
      },
    },
  ] satisfies Milestone[],
};
