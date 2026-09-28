import { projects } from "./projects";

export type ToolGroup = "build" | "test" | "ship";

export type Tool = {
  id: string;
  label: string;
  group: ToolGroup;
};

// Grouped by verb per ASCENT_MASTERPLAN.md §6.4. `projects.ts` is the single
// source of truth for which projects use which tool — this list never
// duplicates that mapping, it only names and groups the tools.
export const tools: Tool[] = [
  { id: "react", label: "React 19", group: "build" },
  { id: "nextjs", label: "Next.js 15", group: "build" },
  { id: "typescript", label: "TypeScript", group: "build" },
  { id: "tailwind", label: "Tailwind CSS", group: "build" },
  { id: "nodejs", label: "Node.js", group: "build" },
  { id: "mongodb", label: "MongoDB", group: "build" },
  { id: "test-plans", label: "Test plans", group: "test" },
  { id: "regression", label: "Regression suites", group: "test" },
  { id: "defect-triage", label: "Defect triage", group: "test" },
  { id: "cross-browser", label: "Cross-browser QA", group: "test" },
  { id: "release-gating", label: "Release gating", group: "test" },
  { id: "git", label: "Git", group: "ship" },
  { id: "github-actions", label: "GitHub Actions", group: "ship" },
  { id: "docker", label: "Docker", group: "ship" },
  { id: "aws", label: "AWS", group: "ship" },
  { id: "vercel", label: "Vercel", group: "ship" },
];

// Derived from projects.tools — never hand-maintained, so the mapping can't drift.
export function projectsUsingTool(toolId: string) {
  return projects.filter((p) => p.tools.includes(toolId));
}
