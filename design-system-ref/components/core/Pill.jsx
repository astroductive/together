import React from "react";

/**
 * Status pill with a live dot. Mirrors the app's connection states.
 */
export function Pill({ children, state = "idle", style = {}, ...rest }) {
  const dotColors = {
    idle: { background: "var(--faint)", boxShadow: "none" },
    live: { background: "var(--live)", boxShadow: "0 0 0 3px var(--live-soft)" },
    connecting: { background: "var(--warn)", boxShadow: "0 0 0 3px var(--warn-soft)" },
    failed: { background: "var(--danger)", boxShadow: "0 0 0 3px var(--danger-soft)" },
  };
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "7px 14px", borderRadius: "var(--radius-full)",
        fontSize: 12, fontWeight: 600, fontFamily: "var(--font-sans)",
        border: "1px solid var(--border)", background: "var(--surface-solid)",
        color: "var(--muted)", ...style,
      }}
      {...rest}
    >
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        animation: state === "live" || state === "connecting" ? "t-pulse 1.4s infinite" : "none",
        ...dotColors[state],
      }} />
      {children}
      <style>{`@keyframes t-pulse{50%{opacity:.4}}`}</style>
    </span>
  );
}
