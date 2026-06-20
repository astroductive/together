import React from "react";

/** Small label badge. Tones map to brand + status colors. */
export function Badge({ children, tone = "neutral", style = {}, ...rest }) {
  const tones = {
    neutral: { background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" },
    accent: { background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid transparent" },
    sand: { background: "var(--sand-soft)", color: "var(--sand)", border: "1px solid transparent" },
    ink: { background: "var(--ink)", color: "var(--white)", border: "1px solid transparent" },
    ok: { background: "var(--ok-soft)", color: "var(--ok)", border: "1px solid transparent" },
    danger: { background: "var(--danger-soft)", color: "var(--danger)", border: "1px solid transparent" },
  };
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "4px 10px", borderRadius: "var(--radius-full)",
        fontSize: 11.5, fontWeight: 650, fontFamily: "var(--font-sans)",
        letterSpacing: "-.01em", lineHeight: 1.2, ...tones[tone], ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
