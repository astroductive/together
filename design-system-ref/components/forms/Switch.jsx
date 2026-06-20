import React from "react";

/** Accessible on/off switch in the teal brand color. */
export function Switch({ checked = false, onChange, disabled = false, style = {}, ...rest }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      style={{
        width: 42, height: 24, borderRadius: "var(--radius-full)", position: "relative",
        cursor: disabled ? "not-allowed" : "pointer", flex: "none", padding: 0,
        opacity: disabled ? 0.5 : 1,
        background: checked ? "var(--accent)" : "var(--surface-2)",
        border: checked ? "1px solid transparent" : "1px solid var(--border)",
        transition: "background var(--transition)", ...style,
      }}
      {...rest}
    >
      <i style={{
        position: "absolute", top: 3, width: 18, height: 18, borderRadius: "50%",
        insetInlineStart: checked ? "auto" : 3, insetInlineEnd: checked ? 3 : "auto",
        background: checked ? "#fff" : "var(--faint)",
        boxShadow: "0 1px 3px rgba(0,0,0,.3)", transition: "all var(--transition)",
      }} />
    </button>
  );
}
