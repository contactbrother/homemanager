import { ImageResponse } from "next/og";

// The share image for every website page.
export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#1E5A44", padding: 72, position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 700 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "#D8C08A", display: "flex" }} />
            <span style={{ color: "white", fontSize: 48, fontWeight: 700 }}>Dar</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "white", fontSize: 68, fontWeight: 700, lineHeight: 1.05 }}>Your villa, looked after.</span>
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 30, marginTop: 24 }}>
              Documents, renewals, maintenance and vendors. One team in Dubai.
            </span>
          </div>
        </div>
        <div style={{ position: "absolute", right: 70, bottom: 0, width: 330, height: 440, borderTopLeftRadius: 165, borderTopRightRadius: 165, background: "#D8C08A", display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
          <div style={{ width: 150, height: 250, borderTopLeftRadius: 75, borderTopRightRadius: 75, background: "#1E5A44" }} />
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, immutable" } },
  );
}
