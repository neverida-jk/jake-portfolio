import { ImageResponse } from "next/og";

// Site-level OG image (§7.10) — the name, the role, a dial motif, and the
// palette. Built with next/og; no new dependency (per-project variants are
// out of scope for this phase).
export const alt = "Jake Neverida — Software Engineer & QA Analyst";
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
          background: "linear-gradient(180deg, #04060C 0%, #0A1024 60%, #151B36 100%)",
          color: "#E9EEF7",
          fontFamily: "sans-serif",
        }}
      >
        {/* A dial at ten past ten, built from plain boxes — this renderer has
            no access to the site's SVG components. Twelve hour dots on a
            ring, two hands, one gold centre. */}
        <div style={{ position: "absolute", right: 72, top: 52, width: 300, height: 300, display: "flex" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 300,
              height: 300,
              borderRadius: "9999px",
              border: "1.5px solid rgba(233,238,247,0.28)",
            }}
          />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            const size = i % 3 === 0 ? 9 : 5;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: Math.round(150 + 128 * Math.sin(a) - size / 2),
                  top: Math.round(150 - 128 * Math.cos(a) - size / 2),
                  width: size,
                  height: size,
                  borderRadius: "9999px",
                  background: "rgba(233,238,247,0.6)",
                }}
              />
            );
          })}
          <div style={{ position: "absolute", left: 147, top: 150 - 78, width: 6, height: 78, borderRadius: 3, background: "#E9EEF7", transformOrigin: "50% 100%", transform: "rotate(305deg)" }} />
          <div style={{ position: "absolute", left: 148.5, top: 150 - 112, width: 3, height: 112, borderRadius: 2, background: "#FFB454", transformOrigin: "50% 100%", transform: "rotate(60deg)" }} />
          <div style={{ position: "absolute", left: 140, top: 140, width: 20, height: 20, borderRadius: "9999px", background: "#070B14", border: "3px solid #FFB454" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: "#9FAEC4", textTransform: "uppercase" }}>
            MAKATI &middot; 14.55&deg;N 121.02&deg;E
          </div>
          <div style={{ display: "flex", fontSize: 96, marginTop: 20, color: "#E9EEF7" }}>Jake Neverida</div>
          <div style={{ display: "flex", fontSize: 34, marginTop: 16, color: "#9FAEC4", maxWidth: 820 }}>
            Software Engineer &amp; QA Analyst
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 12, height: 12, borderRadius: "9999px", background: "#5EEAD4" }} />
          <div style={{ display: "flex", fontSize: 24, color: "#61718B" }}>Builds with quality</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
