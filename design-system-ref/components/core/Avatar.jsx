import React from "react";

/** Initials avatar with the teal brand fill. */
export function Avatar({ name = "", src = null, size = 34, style = {}, ...rest }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%", flex: "none",
        display: "grid", placeItems: "center", overflow: "hidden",
        background: "var(--accent)", color: "#fff",
        fontFamily: "var(--font-sans)", fontWeight: 700,
        fontSize: size * 0.4, ...style,
      }}
      {...rest}
    >
      {src ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
    </div>
  );
}
