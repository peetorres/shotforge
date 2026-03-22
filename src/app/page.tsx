import Link from "next/link";

export default function LandingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>

      {/* Logo */}
      <div style={{ fontSize: 14, fontWeight: 700, color: "#f5f5f7", letterSpacing: "-0.3px", marginBottom: 48, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0A84FF", display: "inline-block" }} />
        Shotforge
      </div>

      {/* Headline */}
      <h1 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 800, color: "#f5f5f7", letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 20, maxWidth: 700 }}>
        App Store screenshots<br />
        <span style={{ color: "#0A84FF" }}>in 4 steps.</span>
      </h1>

      <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "#98989d", marginBottom: 48, letterSpacing: "0.5px" }}>
        Upload.&nbsp;&nbsp;Style.&nbsp;&nbsp;Copy.&nbsp;&nbsp;Export.
      </p>

      {/* CTA */}
      <Link
        href="/new"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          height: 52,
          padding: "0 32px",
          background: "#0A84FF",
          color: "#fff",
          borderRadius: 14,
          fontSize: 16,
          fontWeight: 700,
          textDecoration: "none",
          letterSpacing: "-0.2px",
          transition: "all 0.15s",
          boxShadow: "0 8px 32px rgba(10,132,255,0.3)",
        }}
      >
        Start for free
        <span style={{ fontSize: 18 }}>→</span>
      </Link>

      <p style={{ fontSize: 12, color: "#48484a", marginTop: 16 }}>
        No account needed. Session saved locally.
      </p>

      {/* Feature pills */}
      <div style={{ display: "flex", gap: 10, marginTop: 64, flexWrap: "wrap", justifyContent: "center" }}>
        {["Hero slides", "Feature slides", "AI copy", "3 styles", "6.7\" + 6.1\"", "ZIP export"].map((f) => (
          <div key={f} style={{ background: "#161618", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#98989d", fontWeight: 500 }}>
            {f}
          </div>
        ))}
      </div>
    </main>
  );
}
