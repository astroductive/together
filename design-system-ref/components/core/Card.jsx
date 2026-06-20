import React from "react";

/**
 * Surface card. `glass` = frosted marketing card; `solid` = app surface.
 */
export function Card({ children, variant = "solid", padding = 20, style = {}, ...rest }) {
  const variants = {
    solid: {
      background: "var(--surface-solid)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)",
    },
    glass: {
      background: "var(--glass-bg)",
      border: "1px solid var(--glass-border)",
      borderRadius: "var(--radius-2xl)",
      boxShadow: "var(--shadow-glass)",
      backdropFilter: "blur(var(--blur))",
      WebkitBackdropFilter: "blur(var(--blur))",
    },
    ink: {
      background: "var(--ink)",
      color: "var(--white)",
      border: "1px solid transparent",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow)",
    },
  };
  return (
    <div style={{ padding, ...variants[variant], ...style }} {...rest}>
      {children}
    </div>
  );
}
