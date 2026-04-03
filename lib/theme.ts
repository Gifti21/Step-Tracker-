export const C = {
    bg: "#0d0d14",
    surface: "rgba(255,255,255,0.05)",
    surface2: "rgba(255,255,255,0.09)",
    border: "rgba(255,255,255,0.1)",
    text: "#f0f0f8",
    muted: "rgba(240,240,248,0.5)",
    faint: "rgba(240,240,248,0.28)",
    accent: "#8b5cf6",
    success: "#10b981",
    danger: "#ef4444",
    grad: "linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)",
    gradGreen: "linear-gradient(135deg,#059669,#34d399)",
    gradRed: "linear-gradient(135deg,#dc2626,#ef4444)",
};

export const page: React.CSSProperties = {
    minHeight: "100dvh",
    width: "100%",
    background: `radial-gradient(ellipse 70% 50% at 15% 20%,rgba(124,58,237,0.2) 0%,transparent 55%),
    radial-gradient(ellipse 60% 45% at 85% 15%,rgba(236,72,153,0.13) 0%,transparent 55%),
    radial-gradient(ellipse 65% 55% at 50% 85%,rgba(168,85,247,0.12) 0%,transparent 55%),
    #0d0d14`,
    color: "#f0f0f8",
};

export const container: React.CSSProperties = {
    width: "100%",
    maxWidth: 500,
    margin: "0 auto",
    padding: "1.25rem 1.25rem 5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.25rem",
};

export const card: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: "1.5rem",
};

export const input: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.07)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "0.8rem 1rem",
    color: "#f0f0f8",
    fontSize: "0.9rem",
    outline: "none",
    WebkitAppearance: "none",
    appearance: "none",
};

export const btnPrimary: React.CSSProperties = {
    width: "100%",
    padding: "0.875rem",
    background: "linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)",
    border: "none",
    borderRadius: 16,
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.95rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
};

export const btnIcon: React.CSSProperties = {
    width: 38,
    height: 38,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "rgba(240,240,248,0.5)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
};

export const label: React.CSSProperties = {
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "rgba(240,240,248,0.35)",
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
};
