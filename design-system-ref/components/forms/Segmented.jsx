import React from "react";

/**
 * Segmented control — the app's mode/language switcher.
 * `options` is an array of { value, label, icon? }.
 */
export function Segmented({ options = [], value, onChange, style = {} }) {
  return (
    <div style={{
      display: "inline-flex", background: "var(--surface-2)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-sm)", padding: 3, gap: 2, ...style,
    }}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange?.(opt.value)}
            style={{
              border: 0, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
              fontFamily: "var(--font-sans)", fontSize: 12.5, fontWeight: 600,
              padding: "6px 12px", borderRadius: 8,
              background: active ? "var(--accent)" : "transparent",
              color: active ? "var(--accent-text)" : "var(--faint)",
              transition: "background var(--transition), color var(--transition)",
            }}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
