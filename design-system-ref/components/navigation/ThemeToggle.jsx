import React from "react";

/** Light / dark theme toggle in the app's pill style. */
export function ThemeToggle({ value = "dark", onChange, style = {} }) {
  const opts = [
    { v: "light", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" /></svg> },
    { v: "dark", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" strokeLinejoin="round" /></svg> },
  ];
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", background: "var(--surface-2)",
      border: "1px solid var(--border)", borderRadius: "var(--radius-full)", padding: 3, gap: 2, ...style,
    }}>
      {opts.map((o) => {
        const active = o.v === value;
        return (
          <button
            key={o.v}
            aria-pressed={active}
            onClick={() => onChange?.(o.v)}
            style={{
              width: 30, height: 28, border: 0, borderRadius: "var(--radius-full)",
              display: "grid", placeItems: "center", cursor: "pointer",
              background: active ? "var(--accent)" : "transparent",
              color: active ? "var(--accent-text)" : "var(--faint)",
              transition: "background var(--transition), color var(--transition)",
            }}
          >
            <span style={{ width: 14, height: 14, display: "grid" }}>{o.icon}</span>
          </button>
        );
      })}
    </div>
  );
}
