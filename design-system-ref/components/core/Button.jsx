import React from "react";

/**
 * Together's primary button. Ink-and-accent system: `accent` is the teal
 * brand fill, `primary` is the monochrome ink fill (marketing), `soft` is a
 * tinted teal, `ghost` is bordered, `outline` is the glass marketing outline.
 */
export function Button({
  children,
  variant = "accent",
  size = "md",
  block = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { fontSize: 12.5, padding: "7px 13px", radius: "var(--radius-sm)" },
    md: { fontSize: 13, padding: "9px 17px", radius: "var(--radius)" },
    lg: { fontSize: 14.5, padding: "13px 24px", radius: "var(--radius)" },
  };
  const s = sizes[size] || sizes.md;

  const variants = {
    accent: { background: "var(--accent)", color: "var(--accent-text)", border: "1px solid transparent" },
    primary: { background: "var(--ink)", color: "var(--white)", border: "1px solid transparent" },
    soft: { background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid transparent" },
    ghost: { background: "transparent", color: "var(--muted)", border: "1px solid var(--border)" },
    outline: { background: "var(--glass-bg)", color: "var(--text)", border: "1px solid var(--border)", backdropFilter: "blur(var(--blur-sm))" },
  };

  return (
    <button
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontFamily: "var(--font-sans)",
        fontWeight: 650,
        letterSpacing: "var(--tracking-normal)",
        lineHeight: 1,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        whiteSpace: "nowrap",
        transition: "background var(--transition), transform var(--transition), box-shadow var(--transition), filter var(--transition)",
        fontSize: s.fontSize,
        padding: s.padding,
        borderRadius: s.radius,
        width: block ? "100%" : undefined,
        ...variants[variant],
        ...style,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "translateY(1px)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
