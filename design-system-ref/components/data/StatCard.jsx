import React from "react";

/** KPI stat card — label, big value, optional icon and delta. */
export function StatCard({ label, value, unit = "", icon = null, delta = null, style = {} }) {
  return (
    <div style={{
      background: "var(--surface-solid)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)",
      padding: 20, display: "flex", flexDirection: "column", gap: 18, ...style,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 500 }}>{label}</span>
        {icon && <span style={{ color: "var(--faint)", display: "grid", placeItems: "center" }}>{icon}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, letterSpacing: "-.03em", color: "var(--text)" }}>{value}</span>
        {unit && <span style={{ fontSize: 13, color: "var(--faint)", fontWeight: 600 }}>{unit}</span>}
        {delta != null && (
          <span style={{ marginInlineStart: "auto", fontSize: 12, fontWeight: 650, color: delta >= 0 ? "var(--ok)" : "var(--danger)" }}>
            {delta >= 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>
    </div>
  );
}
