import React from "react";
import { copy } from "@/content/copy";
import { projects } from "@/content/projects";
import { tools } from "@/content/tools";

// A dedicated one-page résumé that only exists on paper (⌘P / "Print
// résumé"). Everything on screen is hidden in print; this is shown
// instead. Built from the same content files as the site, so it can never
// drift from what the page says — and it never shows anything the page
// doesn't.
const EMAIL = "jlrneverida@gmail.com";

const GROUP_LABEL = { build: "Build", test: "Test", ship: "Ship" } as const;

export default function PrintResume() {
  const byId = Object.fromEntries(copy.journey.milestones.map((m) => [m.id, m]));
  const roles = ["vertere", "limitless"].map((id) => byId[id]).filter(Boolean);
  const degree = byId["uplb-grad"];

  return (
    <div className="print-resume" aria-hidden="true">
      <header>
        <h1>Jake Neverida</h1>
        <p className="pr-role">{copy.hero.role.technical}</p>
        <p className="pr-contact">
          {EMAIL} · github.com/neverida-jk · Laguna, Philippines (GMT+8)
        </p>
      </header>

      <section>
        <h2>Experience</h2>
        {roles.map((m) => (
          <div className="pr-item" key={m.id}>
            <p className="pr-head">
              <strong>{m.detail?.heading ?? `${m.title} · ${m.org}`}</strong>
              <span>{m.detail?.period ?? m.year}</span>
            </p>
            {m.detail && (
              <ul>
                {m.detail.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {degree?.detail && (
        <section>
          <h2>Education</h2>
          <div className="pr-item">
            <p className="pr-head">
              <strong>{degree.detail.heading}</strong>
              <span>{degree.detail.period}</span>
            </p>
            <p>{degree.detail.summary.technical}</p>
          </div>
        </section>
      )}

      <section>
        <h2>Projects</h2>
        {projects.map((p) => (
          <div className="pr-item" key={p.id}>
            <p className="pr-head">
              <strong>{p.title}</strong>
              <span>{p.domain}</span>
            </p>
            <p>{p.tagline}</p>
          </div>
        ))}
      </section>

      <section>
        <h2>Skills</h2>
        {(["build", "test", "ship"] as const).map((g) => (
          <p key={g}>
            <strong>{GROUP_LABEL[g]}:</strong>{" "}
            {tools
              .filter((t) => t.group === g)
              .map((t) => t.label)
              .join(", ")}
          </p>
        ))}
      </section>
    </div>
  );
}
