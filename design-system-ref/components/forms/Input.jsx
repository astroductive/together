import React from "react";

/** Text input with label, optional error, and the teal focus ring. */
export function Input({ label, error, hint, icon = null, style = {}, ...rest }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 7, fontFamily: "var(--font-sans)" }}>
      {label && <span style={{ fontSize: 12, fontWeight: 600, color: "var(--faint)" }}>{label}</span>}
      <span style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {icon && <span style={{ position: "absolute", insetInlineStart: 12, color: "var(--faint)", display: "grid", placeItems: "center" }}>{icon}</span>}
        <input
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          style={{
            width: "100%", padding: icon ? "11px 13px 11px 36px" : "11px 13px",
            borderRadius: "var(--radius)", fontFamily: "var(--font-sans)", fontSize: 14,
            color: "var(--text)", background: "var(--surface-2)",
            border: `1px solid ${error ? "var(--danger)" : focused ? "var(--accent)" : "var(--border)"}`,
            boxShadow: focused ? "0 0 0 3px var(--accent-soft)" : "none",
            outline: "none", transition: "border var(--transition), box-shadow var(--transition)",
            ...style,
          }}
          {...rest}
        />
      </span>
      {error && <span style={{ fontSize: 12, color: "var(--danger)", fontWeight: 500 }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: 12, color: "var(--faint)" }}>{hint}</span>}
    </label>
  );
}
