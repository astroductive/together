import React from "react";

/**
 * Together lockup — geometric hands mark + Bricolage wordmark.
 * `light` inverts for dark backgrounds; `mark` shows the icon only.
 */
export function Logo({ light = false, mark = false, size = 36, showTagline = false, style = {} }) {
  const stroke = light ? "#ffffff" : "var(--ink)";
  const icon = (
    <div style={{
      position: "relative", height: size, width: size, flex: "none",
      borderRadius: size * 0.28,
      border: light ? "1px solid rgba(255,255,255,.25)" : "1px solid var(--border)",
      background: light ? "rgba(255,255,255,.1)" : "var(--surface-solid)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.6)",
      backdropFilter: "blur(8px)",
    }}>
      <svg viewBox="0 0 36 36" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden="true">
        <path d="M10 18C10 10 18 8 18 8s8 2 8 10-8 10-8 10-8-2-8-10Z" fill="none" stroke={stroke} strokeWidth="1.6" />
        <path d="M12 15c4 3 8 3 12 0M12 21c4-3 8-3 12 0" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" opacity=".8" />
        <circle cx="18" cy="18" r="2" fill={stroke} />
      </svg>
    </div>
  );
  if (mark) return <div style={style}>{icon}</div>;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12, ...style }}>
      {icon}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size * 0.5,
          letterSpacing: "-.02em", color: light ? "#fff" : "var(--text)",
        }}>together</span>
        {showTagline && (
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 8, marginTop: 3,
            letterSpacing: ".25em", textTransform: "uppercase",
            color: light ? "rgba(255,255,255,.6)" : "var(--faint)",
          }}>Sign language · One world</span>
        )}
      </div>
    </div>
  );
}
