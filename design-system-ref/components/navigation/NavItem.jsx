import React from "react";

/** Sidebar navigation item with active accent rail. */
export function NavItem({ children, icon = null, active = false, dot = false, style = {}, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <a
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative", display: "flex", alignItems: "center", gap: 12,
        padding: "10px 12px", borderRadius: "var(--radius)", textDecoration: "none",
        cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13.5,
        fontWeight: active ? 650 : 500,
        color: active ? "var(--accent)" : hover ? "var(--text)" : "var(--muted)",
        background: active ? "var(--accent-soft)" : hover ? "var(--surface-2)" : "transparent",
        transition: "background var(--transition), color var(--transition)", ...style,
      }}
      {...rest}
    >
      {active && <span style={{
        content: "''", position: "absolute", insetInlineStart: 0, top: "15%", bottom: "15%",
        width: 3, borderRadius: "var(--radius-full)", background: "var(--accent)",
      }} />}
      {icon && <span style={{ display: "grid", placeItems: "center", color: active ? "var(--accent)" : "var(--faint)", flex: "none" }}>{icon}</span>}
      <span>{children}</span>
      {dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--danger)", marginInlineStart: "auto" }} />}
    </a>
  );
}
