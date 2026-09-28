import { ImageResponse } from "next/og";

// Site-level OG image (§7.10) — the name, the role, a contour/summit motif,
// and the palette. Built with next/og; no new dependency (per-project
// variants are out of scope for this phase).
export const runtime = "edge";
export const alt = "Jake Neverida — Quality Assurance Analyst & Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(180deg, #070B14 0%, #141230 55%, #5A2F33 100%)",
          color: "#E9EEF7",
          fontFamily: "sans-serif",
        }}
      >
        {/* Contour rings, hand-authored as plain concentric ellipses — good
            enough at OG size, and this renderer has no access to the site's
            seeded-noise generator. */}
        <div style={{ position: "absolute", right: 60, top: 40, display: "flex" }}>
          {[220, 170, 125, 85, 50].map((d, i) => (
            <div
              key={d}
              style={{
                position: "absolute",
                right: (220 - d) / 2,
                top: (220 - d) / 2,
                width: d,
                height: d,
                borderRadius: "9999px",
                border: `1.5px solid ${i === 4 ? "#FFB454" : "rgba(233,238,247,0.18)"}`,
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: "#9FAEC4", textTransform: "uppercase" }}>
            BASE CAMP &middot; 14&deg;N 121&deg;E
          </div>
          <div style={{ display: "flex", fontSize: 96, marginTop: 20, color: "#E9EEF7" }}>Jake Neverida</div>
          <div style={{ display: "flex", fontSize: 34, marginTop: 16, color: "#9FAEC4", maxWidth: 820 }}>
            Quality Assurance Analyst &amp; Software Engineer
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 12, height: 12, borderRadius: "9999px", background: "#5EEAD4" }} />
          <div style={{ display: "flex", fontSize: 24, color: "#61718B" }}>2,954 m &middot; the summit, in metres</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
