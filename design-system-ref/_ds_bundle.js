/* @ds-bundle: {"format":3,"namespace":"TogetherDesignSystem_58a58f","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Logo","sourcePath":"components/core/Logo.jsx"},{"name":"Pill","sourcePath":"components/core/Pill.jsx"},{"name":"StatCard","sourcePath":"components/data/StatCard.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Segmented","sourcePath":"components/forms/Segmented.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"NavItem","sourcePath":"components/navigation/NavItem.jsx"},{"name":"ThemeToggle","sourcePath":"components/navigation/ThemeToggle.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"1869ea0a7128","components/core/Badge.jsx":"c6ae06c4beb1","components/core/Button.jsx":"12bb20845ff4","components/core/Card.jsx":"1a07c7e6d701","components/core/Logo.jsx":"810e53c55a9c","components/core/Pill.jsx":"d812ff064a0a","components/data/StatCard.jsx":"10afa3decd12","components/forms/Input.jsx":"8fe6349da030","components/forms/Segmented.jsx":"fe95c21fa2c0","components/forms/Switch.jsx":"7af87a29281c","components/navigation/NavItem.jsx":"4e08f45b7acc","components/navigation/ThemeToggle.jsx":"0801698d52dc","site/AboutPage.jsx":"39728dfe1caa","site/AuthPage.jsx":"a71247a962d3","site/HandTalkApp.jsx":"8fa075957d73","site/Home.jsx":"5bbc961bc307","site/ProductLanding.jsx":"de92cc292318","site/SignBridgeApp.jsx":"76d5f48e4498","site/SignLensApp.jsx":"b788d8a4332a","site/lib/cursor.js":"9cf66f916e39","site/lib/icons.jsx":"a821432c8b02","site/lib/reveal.js":"d701e0388dd7","site/lib/site.jsx":"504398f6524f","site/lib/three-hero.jsx":"e0a2a9ce1586","ui_kits/handtalk/HandTalk.jsx":"ecddc56020e2","ui_kits/lib/AppShell.jsx":"9dec87c27661","ui_kits/lib/icons.jsx":"a821432c8b02","ui_kits/marketing/LandingPage.jsx":"0aaf510245ed","ui_kits/signbridge/SignBridge.jsx":"e69d5f19b696","ui_kits/signlens/SignLens.jsx":"4c8451711813"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.TogetherDesignSystem_58a58f = window.TogetherDesignSystem_58a58f || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Initials avatar with the teal brand fill. */
function Avatar({
  name = "",
  src = null,
  size = 34,
  style = {},
  ...rest
}) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width: size,
      height: size,
      borderRadius: "50%",
      flex: "none",
      display: "grid",
      placeItems: "center",
      overflow: "hidden",
      background: "var(--accent)",
      color: "#fff",
      fontFamily: "var(--font-sans)",
      fontWeight: 700,
      fontSize: size * 0.4,
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Small label badge. Tones map to brand + status colors. */
function Badge({
  children,
  tone = "neutral",
  style = {},
  ...rest
}) {
  const tones = {
    neutral: {
      background: "var(--surface-2)",
      color: "var(--muted)",
      border: "1px solid var(--border)"
    },
    accent: {
      background: "var(--accent-soft)",
      color: "var(--accent)",
      border: "1px solid transparent"
    },
    sand: {
      background: "var(--sand-soft)",
      color: "var(--sand)",
      border: "1px solid transparent"
    },
    ink: {
      background: "var(--ink)",
      color: "var(--white)",
      border: "1px solid transparent"
    },
    ok: {
      background: "var(--ok-soft)",
      color: "var(--ok)",
      border: "1px solid transparent"
    },
    danger: {
      background: "var(--danger-soft)",
      color: "var(--danger)",
      border: "1px solid transparent"
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 10px",
      borderRadius: "var(--radius-full)",
      fontSize: 11.5,
      fontWeight: 650,
      fontFamily: "var(--font-sans)",
      letterSpacing: "-.01em",
      lineHeight: 1.2,
      ...tones[tone],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Together's primary button. Ink-and-accent system: `accent` is the teal
 * brand fill, `primary` is the monochrome ink fill (marketing), `soft` is a
 * tinted teal, `ghost` is bordered, `outline` is the glass marketing outline.
 */
function Button({
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
    sm: {
      fontSize: 12.5,
      padding: "7px 13px",
      radius: "var(--radius-sm)"
    },
    md: {
      fontSize: 13,
      padding: "9px 17px",
      radius: "var(--radius)"
    },
    lg: {
      fontSize: 14.5,
      padding: "13px 24px",
      radius: "var(--radius)"
    }
  };
  const s = sizes[size] || sizes.md;
  const variants = {
    accent: {
      background: "var(--accent)",
      color: "var(--accent-text)",
      border: "1px solid transparent"
    },
    primary: {
      background: "var(--ink)",
      color: "var(--white)",
      border: "1px solid transparent"
    },
    soft: {
      background: "var(--accent-soft)",
      color: "var(--accent)",
      border: "1px solid transparent"
    },
    ghost: {
      background: "transparent",
      color: "var(--muted)",
      border: "1px solid var(--border)"
    },
    outline: {
      background: "var(--glass-bg)",
      color: "var(--text)",
      border: "1px solid var(--border)",
      backdropFilter: "blur(var(--blur-sm))"
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    style: {
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
      ...style
    },
    onMouseDown: e => {
      if (!disabled) e.currentTarget.style.transform = "translateY(1px)";
    },
    onMouseUp: e => {
      e.currentTarget.style.transform = "translateY(0)";
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = "translateY(0)";
    }
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Surface card. `glass` = frosted marketing card; `solid` = app surface.
 */
function Card({
  children,
  variant = "solid",
  padding = 20,
  style = {},
  ...rest
}) {
  const variants = {
    solid: {
      background: "var(--surface-solid)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)"
    },
    glass: {
      background: "var(--glass-bg)",
      border: "1px solid var(--glass-border)",
      borderRadius: "var(--radius-2xl)",
      boxShadow: "var(--shadow-glass)",
      backdropFilter: "blur(var(--blur))",
      WebkitBackdropFilter: "blur(var(--blur))"
    },
    ink: {
      background: "var(--ink)",
      color: "var(--white)",
      border: "1px solid transparent",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow)"
    }
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      padding,
      ...variants[variant],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Logo.jsx
try { (() => {
/**
 * Together lockup — geometric hands mark + Bricolage wordmark.
 * `light` inverts for dark backgrounds; `mark` shows the icon only.
 */
function Logo({
  light = false,
  mark = false,
  size = 36,
  showTagline = false,
  style = {}
}) {
  const stroke = light ? "#ffffff" : "var(--ink)";
  const icon = /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: size,
      width: size,
      flex: "none",
      borderRadius: size * 0.28,
      border: light ? "1px solid rgba(255,255,255,.25)" : "1px solid var(--border)",
      background: light ? "rgba(255,255,255,.1)" : "var(--surface-solid)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.6)",
      backdropFilter: "blur(8px)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 36 36",
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%"
    },
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 18C10 10 18 8 18 8s8 2 8 10-8 10-8 10-8-2-8-10Z",
    fill: "none",
    stroke: stroke,
    strokeWidth: "1.6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 15c4 3 8 3 12 0M12 21c4-3 8-3 12 0",
    fill: "none",
    stroke: stroke,
    strokeWidth: "1.4",
    strokeLinecap: "round",
    opacity: ".8"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "18",
    cy: "18",
    r: "2",
    fill: stroke
  })));
  if (mark) return /*#__PURE__*/React.createElement("div", {
    style: style
  }, icon);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      ...style
    }
  }, icon, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      lineHeight: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: size * 0.5,
      letterSpacing: "-.02em",
      color: light ? "#fff" : "var(--text)"
    }
  }, "together"), showTagline && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 8,
      marginTop: 3,
      letterSpacing: ".25em",
      textTransform: "uppercase",
      color: light ? "rgba(255,255,255,.6)" : "var(--faint)"
    }
  }, "Sign language \xB7 One world")));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/Pill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Status pill with a live dot. Mirrors the app's connection states.
 */
function Pill({
  children,
  state = "idle",
  style = {},
  ...rest
}) {
  const dotColors = {
    idle: {
      background: "var(--faint)",
      boxShadow: "none"
    },
    live: {
      background: "var(--live)",
      boxShadow: "0 0 0 3px var(--live-soft)"
    },
    connecting: {
      background: "var(--warn)",
      boxShadow: "0 0 0 3px var(--warn-soft)"
    },
    failed: {
      background: "var(--danger)",
      boxShadow: "0 0 0 3px var(--danger-soft)"
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "7px 14px",
      borderRadius: "var(--radius-full)",
      fontSize: 12,
      fontWeight: 600,
      fontFamily: "var(--font-sans)",
      border: "1px solid var(--border)",
      background: "var(--surface-solid)",
      color: "var(--muted)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      animation: state === "live" || state === "connecting" ? "t-pulse 1.4s infinite" : "none",
      ...dotColors[state]
    }
  }), children, /*#__PURE__*/React.createElement("style", null, `@keyframes t-pulse{50%{opacity:.4}}`));
}
Object.assign(__ds_scope, { Pill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Pill.jsx", error: String((e && e.message) || e) }); }

// components/data/StatCard.jsx
try { (() => {
/** KPI stat card — label, big value, optional icon and delta. */
function StatCard({
  label,
  value,
  unit = "",
  icon = null,
  delta = null,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-solid)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)",
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 18,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: "var(--muted)",
      fontWeight: 500
    }
  }, label), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--faint)",
      display: "grid",
      placeItems: "center"
    }
  }, icon)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 30,
      letterSpacing: "-.03em",
      color: "var(--text)"
    }
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--faint)",
      fontWeight: 600
    }
  }, unit), delta != null && /*#__PURE__*/React.createElement("span", {
    style: {
      marginInlineStart: "auto",
      fontSize: 12,
      fontWeight: 650,
      color: delta >= 0 ? "var(--ok)" : "var(--danger)"
    }
  }, delta >= 0 ? "+" : "", delta, "%")));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Text input with label, optional error, and the teal focus ring. */
function Input({
  label,
  error,
  hint,
  icon = null,
  style = {},
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7,
      fontFamily: "var(--font-sans)"
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: "var(--faint)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      insetInlineStart: 12,
      color: "var(--faint)",
      display: "grid",
      placeItems: "center"
    }
  }, icon), /*#__PURE__*/React.createElement("input", _extends({
    onFocus: e => {
      setFocused(true);
      rest.onFocus?.(e);
    },
    onBlur: e => {
      setFocused(false);
      rest.onBlur?.(e);
    },
    style: {
      width: "100%",
      padding: icon ? "11px 13px 11px 36px" : "11px 13px",
      borderRadius: "var(--radius)",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      color: "var(--text)",
      background: "var(--surface-2)",
      border: `1px solid ${error ? "var(--danger)" : focused ? "var(--accent)" : "var(--border)"}`,
      boxShadow: focused ? "0 0 0 3px var(--accent-soft)" : "none",
      outline: "none",
      transition: "border var(--transition), box-shadow var(--transition)",
      ...style
    }
  }, rest))), error && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--danger)",
      fontWeight: 500
    }
  }, error), hint && !error && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--faint)"
    }
  }, hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Segmented.jsx
try { (() => {
/**
 * Segmented control — the app's mode/language switcher.
 * `options` is an array of { value, label, icon? }.
 */
function Segmented({
  options = [],
  value,
  onChange,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-sm)",
      padding: 3,
      gap: 2,
      ...style
    }
  }, options.map(opt => {
    const active = opt.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: opt.value,
      onClick: () => onChange?.(opt.value),
      style: {
        border: 0,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--font-sans)",
        fontSize: 12.5,
        fontWeight: 600,
        padding: "6px 12px",
        borderRadius: 8,
        background: active ? "var(--accent)" : "transparent",
        color: active ? "var(--accent-text)" : "var(--faint)",
        transition: "background var(--transition), color var(--transition)"
      }
    }, opt.icon, opt.label);
  }));
}
Object.assign(__ds_scope, { Segmented });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Segmented.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Accessible on/off switch in the teal brand color. */
function Switch({
  checked = false,
  onChange,
  disabled = false,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    role: "switch",
    "aria-checked": checked,
    disabled: disabled,
    onClick: () => !disabled && onChange?.(!checked),
    style: {
      width: 42,
      height: 24,
      borderRadius: "var(--radius-full)",
      position: "relative",
      cursor: disabled ? "not-allowed" : "pointer",
      flex: "none",
      padding: 0,
      opacity: disabled ? 0.5 : 1,
      background: checked ? "var(--accent)" : "var(--surface-2)",
      border: checked ? "1px solid transparent" : "1px solid var(--border)",
      transition: "background var(--transition)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("i", {
    style: {
      position: "absolute",
      top: 3,
      width: 18,
      height: 18,
      borderRadius: "50%",
      insetInlineStart: checked ? "auto" : 3,
      insetInlineEnd: checked ? 3 : "auto",
      background: checked ? "#fff" : "var(--faint)",
      boxShadow: "0 1px 3px rgba(0,0,0,.3)",
      transition: "all var(--transition)"
    }
  }));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavItem.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Sidebar navigation item with active accent rail. */
function NavItem({
  children,
  icon = null,
  active = false,
  dot = false,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 12px",
      borderRadius: "var(--radius)",
      textDecoration: "none",
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: 13.5,
      fontWeight: active ? 650 : 500,
      color: active ? "var(--accent)" : hover ? "var(--text)" : "var(--muted)",
      background: active ? "var(--accent-soft)" : hover ? "var(--surface-2)" : "transparent",
      transition: "background var(--transition), color var(--transition)",
      ...style
    }
  }, rest), active && /*#__PURE__*/React.createElement("span", {
    style: {
      content: "''",
      position: "absolute",
      insetInlineStart: 0,
      top: "15%",
      bottom: "15%",
      width: 3,
      borderRadius: "var(--radius-full)",
      background: "var(--accent)"
    }
  }), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "grid",
      placeItems: "center",
      color: active ? "var(--accent)" : "var(--faint)",
      flex: "none"
    }
  }, icon), /*#__PURE__*/React.createElement("span", null, children), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: "var(--danger)",
      marginInlineStart: "auto"
    }
  }));
}
Object.assign(__ds_scope, { NavItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavItem.jsx", error: String((e && e.message) || e) }); }

// components/navigation/ThemeToggle.jsx
try { (() => {
/** Light / dark theme toggle in the app's pill style. */
function ThemeToggle({
  value = "dark",
  onChange,
  style = {}
}) {
  const opts = [{
    v: "light",
    icon: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
      strokeLinecap: "round"
    }))
  }, {
    v: "dark",
    icon: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z",
      strokeLinejoin: "round"
    }))
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-full)",
      padding: 3,
      gap: 2,
      ...style
    }
  }, opts.map(o => {
    const active = o.v === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o.v,
      "aria-pressed": active,
      onClick: () => onChange?.(o.v),
      style: {
        width: 30,
        height: 28,
        border: 0,
        borderRadius: "var(--radius-full)",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        background: active ? "var(--accent)" : "transparent",
        color: active ? "var(--accent-text)" : "var(--faint)",
        transition: "background var(--transition), color var(--transition)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 14,
        height: 14,
        display: "grid"
      }
    }, o.icon));
  }));
}
Object.assign(__ds_scope, { ThemeToggle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/ThemeToggle.jsx", error: String((e && e.message) || e) }); }

// site/AboutPage.jsx
try { (() => {
// Together — About + Contact. window.AboutPage.
const {
  useState: useStateAb
} = React;
const DSab = window.TogetherDesignSystem_58a58f;
const {
  Button: BtnAb,
  Input: InputAb
} = DSab;
const Sab = window.TSite;
const TIab = window.TIcons;
const FONT_Dab = Sab.FONT_D;
function AboutPage() {
  const [lang, setLang] = Sab.useLang();
  const [sent, setSent] = useStateAb(false);
  const t = (en, ar) => Sab.tr(lang, en, ar);
  const card = {
    background: "var(--surface-solid)",
    border: "1px solid var(--border)",
    borderRadius: 22,
    boxShadow: "var(--shadow-sm)"
  };
  const values = [[TIab.hand, t("Hands first", "اليدين أولاً"), t("We design the signing space first, then let text and voice follow its rhythm.", "نصمّم مساحة الإشارة أولاً، ثم يتبعها النص والصوت بإيقاعها.")], [TIab.languages, t("Two sign languages", "لغتا إشارة"), t("Egyptian and American Sign Language sit at the center — never a translation footnote.", "لغة الإشارة المصرية والأمريكية في القلب — وليست هامشًا للترجمة.")], [TIab.gauge, t("No one waits", "لا أحد ينتظر"), t("The best translation is the one nobody has to wait for — it should disappear into the conversation.", "أفضل ترجمة هي التي لا ينتظرها أحد — يجب أن تختفي داخل المحادثة.")]];
  return /*#__PURE__*/React.createElement("div", {
    className: "t-scope",
    style: {
      minHeight: "100vh",
      overflowX: "hidden",
      background: "var(--bg)",
      color: "var(--text)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: -1,
      background: "radial-gradient(circle at 12% 8%, #fff, transparent 32%), radial-gradient(circle at 88% 10%, rgba(31,138,130,.06), transparent 34%), linear-gradient(180deg,#fafafa,#f1f1ef)"
    }
  }), /*#__PURE__*/React.createElement(Sab.Nav, {
    current: "about",
    lang: lang,
    setLang: setLang
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "150px 24px 60px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "1.05fr .95fr",
      gap: 44,
      alignItems: "center"
    },
    className: "ab-hero"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Sab.Eyebrow, null, "( 00 ) \u2014 ", t("About Together", "عن Together")), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: FONT_Dab,
      fontWeight: 600,
      fontSize: "clamp(44px,5.6vw,82px)",
      lineHeight: .94,
      letterSpacing: "-.045em",
      margin: "16px 0 0"
    }
  }, t("Built with the", "بُني مع"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--teal)"
    }
  }, t("Deaf community.", "مجتمع الصمّ."))), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 24,
      maxWidth: 520,
      fontSize: 18,
      lineHeight: 1.65,
      color: "var(--muted)"
    }
  }, t("Together is a real-time translation layer for Egyptian and American Sign Language — made for and with the Deaf and Hard-of-Hearing community across Cairo and Alexandria.", "Together طبقة ترجمة فورية للغة الإشارة المصرية والأمريكية — صُنعت لأجل ومع مجتمع الصمّ وضعاف السمع في القاهرة والإسكندرية."))), /*#__PURE__*/React.createElement("div", {
    className: "ab-hero-panel",
    style: {
      position: "relative",
      height: 420,
      borderRadius: 30,
      overflow: "hidden",
      background: "linear-gradient(150deg,#0e0e14,#070709)",
      border: "1px solid rgba(255,255,255,.06)",
      boxShadow: "0 40px 100px rgba(0,0,0,.26)"
    }
  }, /*#__PURE__*/React.createElement(window.ThreeScene, {
    accent: "#1f8a82",
    type: "community"
  })))), /*#__PURE__*/React.createElement(Sab.Section, {
    style: {
      paddingTop: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: ".95fr 1.05fr",
      gap: 40,
      alignItems: "center"
    },
    className: "ab-story"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      borderRadius: 26,
      overflow: "hidden",
      height: 380,
      ...card,
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../assets/auth-hero.png",
    alt: "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Sab.Eyebrow, null, t("Our mission", "مهمتنا")), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: FONT_Dab,
      fontWeight: 600,
      fontSize: "clamp(30px,3.6vw,46px)",
      lineHeight: 1.05,
      letterSpacing: "-.035em",
      margin: "14px 0 0"
    }
  }, t("Sign language, bridged in real time.", "لغة الإشارة، مترجمة في الوقت الفعلي.")), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 18,
      fontSize: 16,
      lineHeight: 1.7,
      color: "var(--muted)"
    }
  }, t("Captions are not an afterthought. Every layout respects direction, diacritics, and tone — so a conversation flows whether it starts with hands, voice, or text. We build in the open, with the community, one room at a time.", "الترجمة ليست فكرة لاحقة. كل تصميم يحترم الاتجاه والتشكيل والنبرة — لتتدفّق المحادثة سواء بدأت باليدين أو الصوت أو النص. نبني بشفافية، مع المجتمع، غرفة تلو الأخرى."))))), /*#__PURE__*/React.createElement(Sab.Section, {
    style: {
      paddingTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 18
    },
    className: "ab-values"
  }, values.map((v, i) => {
    const VIc = v[0];
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        ...card,
        padding: 28
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--teal)"
      }
    }, /*#__PURE__*/React.createElement(VIc, {
      size: 24
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: FONT_Dab,
        fontWeight: 700,
        fontSize: 20,
        marginTop: 16
      }
    }, v[1]), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 14,
        lineHeight: 1.6,
        color: "var(--muted)",
        margin: "8px 0 0"
      }
    }, v[2]));
  }))), /*#__PURE__*/React.createElement(Sab.Section, {
    id: "contact",
    style: {
      paddingTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      padding: 0,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: ".9fr 1.1fr"
    },
    className: "ab-contact"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#0a0a0c",
      color: "#fff",
      padding: 40,
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "radial-gradient(circle at 30% 20%, rgba(31,138,130,.18), transparent 60%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(Sab.Eyebrow, {
    color: "rgba(255,255,255,.5)"
  }, t("Get in touch", "تواصل معنا")), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: FONT_Dab,
      fontWeight: 600,
      fontSize: 36,
      letterSpacing: "-.03em",
      margin: "14px 0 0"
    }
  }, t("Let's talk.", "لنتحدّث.")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(255,255,255,.6)",
      fontSize: 15,
      lineHeight: 1.6,
      marginTop: 12
    }
  }, t("Book a demo, partner with us, or just say hello.", "احجز عرضًا، أو اعمل معنا، أو سلّم علينا فقط.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16,
      marginTop: 32
    }
  }, [[TIab.send, "hello@together.eg"]].map((r, i) => {
    const RIc = r[0];
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 38,
        height: 38,
        borderRadius: 11,
        display: "grid",
        placeItems: "center",
        background: "rgba(255,255,255,.08)",
        color: "#fff"
      }
    }, /*#__PURE__*/React.createElement(RIc, {
      size: 17
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14.5
      }
    }, r[1]));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 40
    }
  }, sent ? /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      minHeight: 280,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 56,
      height: 56,
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      background: "var(--ok-soft)",
      color: "var(--ok)"
    }
  }, /*#__PURE__*/React.createElement(TIab.check, {
    size: 26
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_Dab,
      fontWeight: 700,
      fontSize: 22
    }
  }, t("Message sent", "تم الإرسال")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--muted)",
      fontSize: 14
    }
  }, t("We'll get back to you within a day.", "سنعاود التواصل خلال يوم."))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(InputAb, {
    label: t("Name", "الاسم"),
    placeholder: t("Your name", "اسمك")
  }), /*#__PURE__*/React.createElement(InputAb, {
    label: t("Email", "البريد"),
    type: "email",
    placeholder: "you@example.com"
  }), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: "var(--faint)"
    }
  }, t("Message", "الرسالة")), /*#__PURE__*/React.createElement("textarea", {
    rows: 4,
    dir: lang === "ar" ? "rtl" : "ltr",
    placeholder: t("How can we help?", "كيف نساعدك؟"),
    style: {
      width: "100%",
      resize: "none",
      padding: "11px 13px",
      borderRadius: 13,
      border: "1px solid var(--border)",
      background: "var(--surface-2)",
      color: "var(--text)",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      outline: "none",
      boxSizing: "border-box"
    }
  })), /*#__PURE__*/React.createElement(BtnAb, {
    block: true,
    size: "lg",
    variant: "accent",
    iconRight: /*#__PURE__*/React.createElement(TIab.send, {
      size: 15
    }),
    onClick: () => setSent(true)
  }, t("Send message", "إرسال"))))))), /*#__PURE__*/React.createElement(Sab.Footer, {
    lang: lang
  }), /*#__PURE__*/React.createElement("style", null, `@media(max-width:900px){.ab-hero,.ab-story,.ab-values,.ab-contact{grid-template-columns:1fr!important}.ab-hero-panel{height:340px!important}}`));
}
window.AboutPage = AboutPage;
})(); } catch (e) { __ds_ns.__errors.push({ path: "site/AboutPage.jsx", error: String((e && e.message) || e) }); }

// site/AuthPage.jsx
try { (() => {
// Together — Auth (login / signup). window.AuthPage.
const {
  useState: useStateA
} = React;
const DSa = window.TogetherDesignSystem_58a58f;
const {
  Button: BtnA,
  Input: InputA
} = DSa;
const Sa = window.TSite;
const TIa = window.TIcons;
const FONT_Da = Sa.FONT_D;
function AuthPage() {
  const [lang, setLang] = Sa.useLang();
  const [mode, setMode] = useStateA("signin");
  const t = (en, ar) => Sa.tr(lang, en, ar);
  const signup = mode === "signup";
  return /*#__PURE__*/React.createElement("div", {
    className: "t-scope",
    style: {
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--text)"
    }
  }, /*#__PURE__*/React.createElement(Sa.Nav, {
    current: "auth",
    lang: lang,
    setLang: setLang
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      minHeight: "100vh"
    },
    className: "auth-grid"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "120px 24px 48px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 400
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      gap: 2,
      padding: 3,
      borderRadius: 999,
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      marginBottom: 28
    }
  }, [["signin", t("Sign in", "تسجيل الدخول")], ["signup", t("Create account", "إنشاء حساب")]].map(([v, l]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    onClick: () => setMode(v),
    style: {
      border: "none",
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: 13,
      fontWeight: 650,
      padding: "8px 16px",
      borderRadius: 999,
      background: mode === v ? "var(--ink)" : "transparent",
      color: mode === v ? "#fff" : "var(--faint)",
      transition: "all .2s"
    }
  }, l))), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: FONT_Da,
      fontWeight: 700,
      fontSize: 38,
      letterSpacing: "-.03em",
      margin: 0
    }
  }, signup ? t("Create your account", "أنشئ حسابك") : t("Welcome back", "أهلاً بعودتك")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--muted)",
      fontSize: 15,
      marginTop: 10
    }
  }, signup ? t("Start translating in both directions, in minutes.", "ابدأ الترجمة في الاتجاهين خلال دقائق.") : t("Sign in to your Together workspace.", "سجّل الدخول إلى مساحة عملك في Together.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16,
      marginTop: 28
    }
  }, signup && /*#__PURE__*/React.createElement(InputA, {
    label: t("Full name", "الاسم الكامل"),
    placeholder: t("Mariam Adel", "مريم عادل")
  }), /*#__PURE__*/React.createElement(InputA, {
    label: t("Email", "البريد الإلكتروني"),
    type: "email",
    placeholder: "you@together.eg",
    defaultValue: ""
  }), /*#__PURE__*/React.createElement(InputA, {
    label: t("Password", "كلمة المرور"),
    type: "password",
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  }), /*#__PURE__*/React.createElement(BtnA, {
    block: true,
    size: "lg",
    variant: "accent",
    iconRight: /*#__PURE__*/React.createElement(TIa.arrowRight, {
      size: 16
    })
  }, signup ? t("Create account", "إنشاء حساب") : t("Sign in", "تسجيل الدخول")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      color: "var(--faint)",
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: "var(--border)"
    }
  }), " ", t("or", "أو"), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: "var(--border)"
    }
  })), /*#__PURE__*/React.createElement(BtnA, {
    block: true,
    size: "lg",
    variant: "ghost"
  }, t("Continue with Google", "المتابعة مع Google"))), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 22,
      fontSize: 13,
      color: "var(--faint)",
      textAlign: "center"
    }
  }, signup ? t("Already have an account? ", "لديك حساب؟ ") : t("New to Together? ", "جديد على Together؟ "), /*#__PURE__*/React.createElement("a", {
    onClick: () => setMode(signup ? "signin" : "signup"),
    style: {
      color: "var(--teal)",
      fontWeight: 650,
      cursor: "pointer"
    }
  }, signup ? t("Sign in", "سجّل الدخول") : t("Create one", "أنشئ حسابًا"))))), /*#__PURE__*/React.createElement("div", {
    className: "auth-hero",
    style: {
      position: "relative",
      overflow: "hidden",
      background: "#0a0a0c"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../assets/auth-hero.png",
    alt: "",
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(180deg, rgba(8,8,10,.35), rgba(8,8,10,.05) 40%, rgba(8,8,10,.7))"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      padding: 48,
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11.5,
      letterSpacing: ".2em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,.6)",
      marginBottom: 14
    }
  }, "Together \xB7 Cairo"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_Da,
      fontWeight: 600,
      fontSize: 32,
      letterSpacing: "-.025em",
      lineHeight: 1.1,
      maxWidth: 420
    }
  }, t("Make every room accessible.", "اجعل كل غرفة في متناول الجميع."))))), /*#__PURE__*/React.createElement("style", null, `@media(max-width:860px){.auth-grid{grid-template-columns:1fr!important}.auth-hero{display:none!important}}`));
}
window.AuthPage = AuthPage;
})(); } catch (e) { __ds_ns.__errors.push({ path: "site/AuthPage.jsx", error: String((e && e.message) || e) }); }

// site/HandTalkApp.jsx
try { (() => {
// HandTalk app — light reskin, indigo product tint. window.HandTalkApp.
const {
  useState: useStateHT,
  useRef: useRefHT,
  useEffect: useEffectHT
} = React;
const DSh = window.TogetherDesignSystem_58a58f;
const {
  Button: BtnHT,
  Avatar: AvHT
} = DSh;
const Sht = window.TSite;
const TIht = window.TIcons;
const FONT_Dht = Sht.FONT_D;
const STREAM = [{
  who: "speaker",
  en: "Hi Mariam, can you see the slides?",
  ar: "أهلاً مريم، شايفة الشرائح؟",
  gloss: "SLIDES YOU SEE?"
}, {
  who: "signer",
  en: "Yes, clearly. Let's begin.",
  ar: "أيوه، واضحة. يلا نبدأ.",
  gloss: "YES CLEAR. BEGIN."
}, {
  who: "speaker",
  en: "Great — I'll share the budget first.",
  ar: "تمام — هشارك الميزانية الأول.",
  gloss: "BUDGET FIRST SHARE."
}, {
  who: "signer",
  en: "Sounds good, go ahead.",
  ar: "كويس، اتفضل.",
  gloss: "GOOD. GO."
}];
function Landmarks() {
  const pts = [[50, 40], [46, 48], [43, 56], [55, 46], [57, 56], [60, 46], [62, 56], [64, 47], [66, 56]];
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 100 100",
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      opacity: .9
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M50 40 46 48 43 56M50 40 55 46 57 56M50 40 60 46 62 56M50 40 64 47 66 56",
    stroke: "var(--p-accent)",
    strokeWidth: ".5",
    fill: "none",
    opacity: ".5"
  }), pts.map((p, i) => /*#__PURE__*/React.createElement("circle", {
    key: i,
    cx: p[0],
    cy: p[1],
    r: "1.1",
    fill: "#34d399",
    style: {
      animation: `tp 1.4s ${i * .06}s infinite`
    }
  })));
}
function Tile({
  role,
  name,
  sub,
  active,
  caption,
  camera,
  lang,
  t
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      borderRadius: 18,
      overflow: "hidden",
      background: "var(--viewport)",
      border: `1px solid ${active ? "var(--p-accent)" : "var(--border)"}`,
      minHeight: 300,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: active ? "0 0 0 3px var(--p-accent-soft)" : "var(--shadow-sm)",
      transition: "all .3s"
    }
  }, role === "signer" && camera && /*#__PURE__*/React.createElement(Landmarks, null), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, camera ? /*#__PURE__*/React.createElement(AvHT, {
    name: name,
    size: 84,
    style: role === "speaker" ? {
      background: "var(--sand)"
    } : {}
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: 84,
      height: 84,
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      background: "var(--surface-2)",
      color: "var(--faint)"
    }
  }, /*#__PURE__*/React.createElement(TIht.videoOff, {
    size: 30
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 12,
      insetInlineStart: 12,
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: "5px 11px",
      borderRadius: 999,
      background: "rgba(8,8,12,.64)",
      color: "#fff",
      fontSize: 11.5,
      fontWeight: 650
    }
  }, /*#__PURE__*/React.createElement(TIht.hand, {
    size: 13,
    style: {
      color: role === "signer" ? "#34d399" : "var(--sand)"
    }
  }), " ", name, " \xB7 ", sub), active && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 12,
      insetInlineEnd: 12,
      width: 9,
      height: 9,
      borderRadius: "50%",
      background: "#34d399",
      boxShadow: "0 0 0 3px rgba(52,211,153,.25)",
      animation: "tp 1.4s infinite"
    }
  }), caption && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 12,
      right: 12,
      bottom: 12,
      padding: "10px 14px",
      borderRadius: 12,
      background: "rgba(8,8,12,.76)",
      backdropFilter: "blur(8px)",
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      letterSpacing: ".1em",
      color: "#34d399",
      textTransform: "uppercase",
      marginBottom: 4
    }
  }, role === "signer" ? t("sign → text", "إشارة ← نص") : t("speech → sign · ", "كلام ← إشارة · ") + caption.gloss), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 500,
      lineHeight: 1.4
    }
  }, lang === "ar" ? caption.ar : caption.en)));
}
function CtrlBtn({
  on,
  onIcon,
  offIcon,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 48,
      height: 48,
      borderRadius: "50%",
      cursor: "pointer",
      border: "1px solid var(--border)",
      background: on ? "var(--surface-solid)" : "rgba(239,68,68,.12)",
      color: on ? "var(--text)" : "#ef4444",
      boxShadow: "var(--shadow-sm)",
      transition: "all .2s"
    }
  }, on ? onIcon : offIcon);
}
function HTInner({
  lang,
  t
}) {
  const [phase, setPhase] = useStateHT("lobby");
  const [mic, setMic] = useStateHT(true);
  const [cam, setCam] = useStateHT(true);
  const [captions, setCaptions] = useStateHT(true);
  const [i, setI] = useStateHT(-1);
  const tick = useRefHT(null);
  const join = () => {
    setPhase("connecting");
    setTimeout(() => {
      setPhase("live");
      setI(0);
    }, 1500);
  };
  useEffectHT(() => {
    if (phase !== "live") return;
    tick.current = setInterval(() => setI(n => (n + 1) % STREAM.length), 2600);
    return () => clearInterval(tick.current);
  }, [phase]);
  const cur = i >= 0 ? STREAM[i] : null;
  const card = {
    background: "var(--surface-solid)",
    border: "1px solid var(--border)",
    borderRadius: 18,
    boxShadow: "var(--shadow-sm)"
  };
  if (phase === "lobby") return /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      overflow: "hidden",
      maxWidth: 760,
      margin: "8px auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#0a0a0c",
      color: "#fff",
      padding: "44px 40px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "radial-gradient(circle at 50% 30%, var(--p-accent-soft), transparent 60%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_Dht,
      fontWeight: 700,
      fontSize: 34,
      letterSpacing: "-.03em"
    }
  }, t("Room · clinic-204", "غرفة · clinic-204")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(255,255,255,.6)",
      marginTop: 10,
      fontSize: 15,
      maxWidth: 460,
      marginInline: "auto"
    }
  }, t("A signer and a speaker, understood in both directions — live captions and sign guidance per role.", "مُشير ومتحدث، مفهومان في الاتجاهين — ترجمة حيّة وتوجيه إشارة لكل دور.")))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 28,
      display: "flex",
      gap: 16,
      alignItems: "center",
      flexWrap: "wrap",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(AvHT, {
    name: "Mariam Adel",
    size: 40
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 650
    }
  }, t("You", "أنت")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--faint)"
    }
  }, t("Signer · ESL", "مُشير · إشارة")))), /*#__PURE__*/React.createElement(TIht.plus, {
    size: 18,
    style: {
      color: "var(--faint)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(AvHT, {
    name: "Omar",
    size: 40,
    style: {
      background: "var(--sand)"
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 650
    }
  }, "Omar"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--faint)"
    }
  }, t("Speaker · Voice", "متحدث · صوت")))), /*#__PURE__*/React.createElement(BtnHT, {
    size: "lg",
    style: {
      marginInlineStart: "auto",
      background: "var(--p-accent)",
      color: "#fff"
    },
    variant: "accent",
    iconLeft: /*#__PURE__*/React.createElement(TIht.video, {
      size: 16
    }),
    onClick: join
  }, t("Join meeting", "ادخل الاجتماع"))));
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 18
    },
    className: "app-2col"
  }, /*#__PURE__*/React.createElement(Tile, {
    role: "signer",
    name: t("You", "أنت"),
    sub: t("Signer", "مُشير"),
    active: phase === "live" && cur && cur.who === "signer",
    caption: captions && cur && cur.who === "signer" ? cur : null,
    camera: cam,
    lang: lang,
    t: t
  }), /*#__PURE__*/React.createElement(Tile, {
    role: "speaker",
    name: "Omar",
    sub: t("Speaker", "متحدث"),
    active: phase === "live" && cur && cur.who === "speaker",
    caption: captions && cur && cur.who === "speaker" ? cur : null,
    camera: true,
    lang: lang,
    t: t
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      marginTop: 20,
      flexWrap: "wrap"
    }
  }, phase === "connecting" && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--muted)",
      fontWeight: 600
    }
  }, t("Connecting…", "جارٍ الاتصال…")), /*#__PURE__*/React.createElement(CtrlBtn, {
    on: mic,
    onIcon: /*#__PURE__*/React.createElement(TIht.mic, {
      size: 18
    }),
    offIcon: /*#__PURE__*/React.createElement(TIht.micOff, {
      size: 18
    }),
    onClick: () => setMic(v => !v)
  }), /*#__PURE__*/React.createElement(CtrlBtn, {
    on: cam,
    onIcon: /*#__PURE__*/React.createElement(TIht.video, {
      size: 18
    }),
    offIcon: /*#__PURE__*/React.createElement(TIht.videoOff, {
      size: 18
    }),
    onClick: () => setCam(v => !v)
  }), /*#__PURE__*/React.createElement(CtrlBtn, {
    on: captions,
    onIcon: /*#__PURE__*/React.createElement(TIht.captions, {
      size: 18
    }),
    offIcon: /*#__PURE__*/React.createElement(TIht.captions, {
      size: 18
    }),
    onClick: () => setCaptions(v => !v)
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setPhase("lobby");
      setI(-1);
    },
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      border: "none",
      cursor: "pointer",
      padding: "11px 20px",
      borderRadius: 999,
      background: "#ef4444",
      color: "#fff",
      fontFamily: "var(--font-sans)",
      fontWeight: 650,
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement(TIht.phone, {
    size: 17,
    style: {
      transform: "rotate(135deg)"
    }
  }), " ", t("Leave", "مغادرة"))));
}
function HandTalkApp() {
  return /*#__PURE__*/React.createElement(window.TAppFrame, {
    which: "handtalk"
  }, (lang, t) => /*#__PURE__*/React.createElement(HTInner, {
    lang: lang,
    t: t
  }));
}
window.HandTalkApp = HandTalkApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "site/HandTalkApp.jsx", error: String((e && e.message) || e) }); }

// site/Home.jsx
try { (() => {
// Together — Home. Composes DS primitives + TSite shell + Three.js hero.
const {
  useState,
  useEffect
} = React;
const DS = window.TogetherDesignSystem_58a58f;
const {
  Button,
  Card,
  Badge
} = DS;
const S = window.TSite;
const TI = window.TIcons;
const {
  PRODUCTS,
  FONT_D
} = S;
const IMG = {
  signlens: "../assets/features/recognition.png",
  signbridge: "../assets/features/avatar.png",
  handtalk: "../assets/features/sync.png"
};
function LiveCard({
  lang
}) {
  const [i, setI] = useState(0);
  const pairs = [["إزيك؟", "How are you?"], ["شكراً", "Thank you"], ["محتاج مساعدة", "I need help"]];
  useEffect(() => {
    const id = setInterval(() => setI(v => (v + 1) % pairs.length), 2600);
    return () => clearInterval(id);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      insetInlineEnd: 22,
      bottom: 22,
      width: 248,
      borderRadius: 20,
      background: "rgba(20,20,26,.72)",
      border: "1px solid rgba(255,255,255,.12)",
      backdropFilter: "blur(16px)",
      padding: 18,
      color: "#fff",
      boxShadow: "0 20px 50px rgba(0,0,0,.4)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: "#34d399",
      boxShadow: "0 0 0 3px rgba(52,211,153,.25)",
      animation: "tp 1.4s infinite"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: "rgba(255,255,255,.55)",
      fontFamily: "var(--font-mono)",
      letterSpacing: ".12em",
      textTransform: "uppercase"
    }
  }, "Live translation")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: 30,
      letterSpacing: "-.02em",
      minHeight: 38
    }
  }, pairs[i][0]), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      borderRadius: 12,
      background: "rgba(255,255,255,.08)",
      border: "1px solid rgba(255,255,255,.1)",
      padding: "10px 12px",
      fontSize: 13.5,
      color: "rgba(255,255,255,.8)"
    }
  }, pairs[i][1]), /*#__PURE__*/React.createElement("style", null, `@keyframes tp{50%{opacity:.4}}`));
}
function ProductCard({
  p,
  lang
}) {
  const [hover, setHover] = useState(false);
  const Ic = TI[p.icon];
  const t = (en, ar) => S.tr(lang, en, ar);
  return /*#__PURE__*/React.createElement("a", {
    href: p.landing,
    "data-product": p.key,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      textDecoration: "none",
      display: "flex",
      flexDirection: "column",
      borderRadius: 28,
      overflow: "hidden",
      background: "var(--surface-solid)",
      border: "1px solid var(--border)",
      boxShadow: hover ? "0 30px 70px rgba(14,16,24,.16)" : "0 1px 3px rgba(14,16,24,.05),0 12px 32px rgba(14,16,24,.07)",
      transform: hover ? "translateY(-6px)" : "none",
      transition: "all .4s var(--ease-out-expo)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: 180,
      background: `linear-gradient(160deg, ${p.accent}14, ${p.accent}04)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: IMG[p.key],
    alt: "",
    style: {
      height: 150,
      objectFit: "contain",
      transform: hover ? "scale(1.06)" : "scale(1)",
      transition: "transform .5s var(--ease-out-expo)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 16,
      insetInlineStart: 16,
      width: 38,
      height: 38,
      borderRadius: 11,
      display: "grid",
      placeItems: "center",
      background: p.accent,
      color: "#fff",
      boxShadow: `0 8px 20px ${p.accent}44`
    }
  }, /*#__PURE__*/React.createElement(Ic, {
    size: 19
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: ".16em",
      textTransform: "uppercase",
      color: p.accent
    }
  }, t(p.tag.en, p.tag.ar)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 700,
      fontSize: 26,
      letterSpacing: "-.025em",
      color: "var(--text)"
    }
  }, p.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      lineHeight: 1.6,
      color: "var(--muted)",
      flex: 1
    }
  }, t(p.blurb.en, p.blurb.ar)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      color: p.accent,
      fontWeight: 650,
      fontSize: 14,
      marginTop: 4
    }
  }, t("Explore", "اكتشف"), " ", /*#__PURE__*/React.createElement(TI.arrowRight, {
    size: 15
  }))));
}
function Home() {
  const [lang, setLang] = S.useLang();
  const t = (en, ar) => S.tr(lang, en, ar);
  const mono = {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "var(--muted)"
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "t-scope",
    style: {
      minHeight: "100vh",
      overflowX: "hidden",
      background: "var(--bg)",
      color: "var(--text)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: -1,
      background: "radial-gradient(circle at 12% 8%, #fff, transparent 30%), radial-gradient(circle at 88% 12%, rgba(31,138,130,.06), transparent 32%), linear-gradient(180deg,#fafafa,#f1f1ef)"
    }
  }), /*#__PURE__*/React.createElement(S.Nav, {
    current: "home",
    lang: lang,
    setLang: setLang
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "150px 24px 70px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "1.02fr .98fr",
      gap: 44,
      alignItems: "center"
    },
    className: "h-hero"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 15px",
      borderRadius: 999,
      border: "1px solid var(--border)",
      background: "var(--glass-bg)",
      backdropFilter: "blur(10px)",
      marginBottom: 26
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "var(--teal)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: mono
  }, t("Built for everyday conversations", "مصمّم للمحادثات اليومية"))), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: "clamp(48px,6.6vw,92px)",
      lineHeight: 1.02,
      letterSpacing: "-.045em",
      margin: 0
    }
  }, t("Sign, speak, read", "إشارة، كلام، قراءة"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--teal)"
    }
  }, t("— together.", "— معًا."))), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 26,
      maxWidth: 500,
      fontSize: 18.5,
      lineHeight: 1.6,
      color: "var(--muted)"
    }
  }, t("One translation layer for Egyptian and American Sign Language — turning hands into text and voice, and voice into signs, with nobody left waiting.", "طبقة ترجمة واحدة للغة الإشارة المصرية والأمريكية — تحوّل اليدين إلى نص وصوت، والصوت إلى إشارة، دون أن ينتظر أحد.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 34
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "signlens-app.html",
    style: {
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    style: {
      borderRadius: 999
    },
    iconRight: /*#__PURE__*/React.createElement(TI.arrowRight, {
      size: 16
    })
  }, t("Try it live", "جرّبها مباشرةً"))), /*#__PURE__*/React.createElement("a", {
    href: "#products",
    style: {
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "lg",
    style: {
      borderRadius: 999
    }
  }, t("Explore products", "استكشف المنتجات")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 26,
      marginTop: 40,
      flexWrap: "wrap"
    }
  }, [[t("Languages", "اللغات"), "AR · ESL · EN"], [t("On-device", "على الجهاز"), "100%"], [t("Sign classes", "فئات الإشارة"), "50+"]].map(s => /*#__PURE__*/React.createElement("div", {
    key: s[0]
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 700,
      fontSize: 22,
      color: "var(--text)"
    }
  }, s[1]), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--faint)",
      marginTop: 2
    }
  }, s[0]))))), /*#__PURE__*/React.createElement("div", {
    className: "h-hero-panel",
    style: {
      position: "relative",
      height: 480,
      borderRadius: 30,
      overflow: "hidden",
      background: "linear-gradient(150deg,#0e0e14,#070709)",
      border: "1px solid rgba(255,255,255,.06)",
      boxShadow: "0 40px 100px rgba(0,0,0,.28)"
    }
  }, /*#__PURE__*/React.createElement(window.ThreeScene, {
    accent: "#1f8a82",
    type: "field"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 20,
      insetInlineStart: 22,
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: ".18em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,.45)"
    }
  }, "Real-time signal")))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderBlock: "1px solid var(--border)",
      background: "rgba(255,255,255,.5)",
      backdropFilter: "blur(10px)",
      padding: "26px 0",
      overflow: "hidden",
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      gap: 44,
      animation: "hmarq 28s linear infinite"
    }
  }, [...Array(3)].flatMap((_, k) => (lang === "ar" ? ["إشارة ← نص", "إشارة ← صوت", "صوت ← إشارة", "نص ← إشارة", "اجتماعات حيّة", "ESL · ASL"] : ["SIGN → TEXT", "SIGN → SPEECH", "SPEECH → SIGN", "TEXT → SIGN", "LIVE MEETINGS", "ESL · ASL"]).map((x, i) => /*#__PURE__*/React.createElement("span", {
    key: k + "-" + i,
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: 21,
      letterSpacing: "-.02em",
      color: "var(--text)",
      display: "inline-flex",
      alignItems: "center",
      gap: 44
    }
  }, x, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--teal)"
    }
  }, "\u2726"))))), /*#__PURE__*/React.createElement("style", null, `@keyframes hmarq{to{transform:translateX(-33.33%)}}`)), /*#__PURE__*/React.createElement(S.Section, {
    id: "products"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 620,
      marginBottom: 50,
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(S.Eyebrow, null, "( 01 ) \u2014 ", t("Three products, one platform", "ثلاثة منتجات، منصّة واحدة")), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: "clamp(36px,4.6vw,62px)",
      lineHeight: 1,
      letterSpacing: "-.04em",
      margin: 0
    }
  }, t("Every direction of the conversation.", "كل اتجاهات المحادثة."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 22
    },
    className: "h-prod-grid"
  }, Object.values(PRODUCTS).map(p => /*#__PURE__*/React.createElement(ProductCard, {
    key: p.key,
    p: p,
    lang: lang
  })))), /*#__PURE__*/React.createElement(S.Section, {
    style: {
      paddingTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: ".8fr 1.2fr",
      gap: 40,
      alignItems: "center"
    },
    className: "h-how"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(S.Eyebrow, null, "( 02 ) \u2014 ", t("Simple workflow", "سير عمل بسيط")), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: "clamp(32px,4vw,52px)",
      lineHeight: 1.02,
      letterSpacing: "-.04em",
      margin: 0
    }
  }, t("Capture. Translate. Share — instantly.", "التقاط. ترجمة. مشاركة — فورًا."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 1,
      background: "var(--border)",
      border: "1px solid var(--border)",
      borderRadius: 24,
      overflow: "hidden"
    },
    className: "h-steps"
  }, [[TI.camera, t("Capture", "التقاط"), t("Camera, microphone, or text input.", "كاميرا أو ميكروفون أو نص.")], [TI.languages, t("Translate", "ترجمة"), t("Egyptian & American Sign Language, on-device.", "لغة الإشارة المصرية والأمريكية، على الجهاز.")], [TI.send, t("Share", "مشاركة"), t("Text, speech, sign guide, or captions.", "نص أو صوت أو دليل إشارة أو ترجمة.")]].map((s, i) => {
    const Ic = s[0];
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: "var(--surface-solid)",
        padding: 26,
        minHeight: 190,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 40,
        height: 40,
        borderRadius: 11,
        display: "grid",
        placeItems: "center",
        background: "var(--accent-soft)",
        color: "var(--teal)"
      }
    }, /*#__PURE__*/React.createElement(Ic, {
      size: 20
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "var(--faint)",
        marginBottom: 8
      }
    }, "0", i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: FONT_D,
        fontWeight: 700,
        fontSize: 19,
        color: "var(--text)"
      }
    }, s[1]), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 13,
        lineHeight: 1.5,
        color: "var(--muted)",
        margin: "6px 0 0"
      }
    }, s[2])));
  })))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: "#08080a",
      color: "#fff",
      padding: "92px 24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 24,
      flexWrap: "wrap",
      marginBottom: 44
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: "clamp(34px,4.4vw,58px)",
      lineHeight: 1,
      letterSpacing: "-.04em",
      margin: 0,
      maxWidth: 620
    }
  }, t("Accurate in both languages.", "دقيق في اللغتين.")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      letterSpacing: ".18em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,.4)"
    }
  }, t("Measured on held-out test sets", "مقيس على مجموعات اختبار"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 1,
      background: "rgba(255,255,255,.1)",
      border: "1px solid rgba(255,255,255,.1)",
      borderRadius: 24,
      overflow: "hidden"
    },
    className: "h-stats"
  }, [["98", "%", t("Egyptian Sign Language accuracy", "دقة لغة الإشارة المصرية")], ["88", "%", t("American Sign Language accuracy", "دقة لغة الإشارة الأمريكية")], ["100", "%", t("On-device, private", "على الجهاز، خاص")]].map(m => /*#__PURE__*/React.createElement("div", {
    key: m[2],
    style: {
      background: "#0d0d10",
      padding: "34px 24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 700,
      fontSize: 52,
      letterSpacing: "-.03em"
    }
  }, m[0], /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      color: "rgba(255,255,255,.45)"
    }
  }, m[1])), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: "rgba(255,255,255,.55)",
      marginTop: 8
    }
  }, m[2])))))), /*#__PURE__*/React.createElement(S.Section, {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(S.Eyebrow, null, "( 03 ) \u2014 ", t("Get started", "ابدأ الآن")), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: "clamp(48px,7vw,96px)",
      lineHeight: .92,
      letterSpacing: "-.05em",
      margin: "18px auto 0",
      maxWidth: 880
    }
  }, t("Make every room accessible.", "اجعل كل غرفة في متناول الجميع.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 34,
      display: "flex",
      justifyContent: "center",
      gap: 12,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "signlens-app.html",
    style: {
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    style: {
      borderRadius: 999
    },
    iconRight: /*#__PURE__*/React.createElement(TI.arrowRight, {
      size: 16
    })
  }, t("Try it live", "جرّبها مباشرةً"))), /*#__PURE__*/React.createElement("a", {
    href: "auth.html",
    style: {
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "lg",
    style: {
      borderRadius: 999
    }
  }, t("Create account", "إنشاء حساب"))))), /*#__PURE__*/React.createElement(S.Footer, {
    lang: lang
  }), /*#__PURE__*/React.createElement("style", null, `@media(max-width:900px){.h-hero,.h-how{grid-template-columns:1fr!important}.h-hero-panel{height:380px!important}.h-prod-grid{grid-template-columns:1fr!important}.h-steps{grid-template-columns:1fr!important}.h-stats{grid-template-columns:1fr 1fr!important}}`));
}
window.Home = Home;
})(); } catch (e) { __ds_ns.__errors.push({ path: "site/Home.jsx", error: String((e && e.message) || e) }); }

// site/ProductLanding.jsx
try { (() => {
// Shared product landing template + bilingual content for the 3 products.
const {
  useState
} = React;
const DS = window.TogetherDesignSystem_58a58f;
const {
  Button,
  Card
} = DS;
const S = window.TSite;
const TI = window.TIcons;
const {
  PRODUCTS,
  FONT_D
} = S;

// ── Per-product marketing content (EN / AR) ───────────────
const PC = {
  signlens: {
    no: "01",
    headline: {
      en: ["See signs.", "Read language."],
      ar: ["شوف الإشارة.", "اقرأ اللغة."]
    },
    lead: {
      en: "SignLens uses real-time kinetic recognition to turn Egyptian and American Sign Language into text and natural voice — instantly, on any device, fully on-device.",
      ar: "يستخدم SignLens التعرّف الحركي الفوري لتحويل لغة الإشارة المصرية والأمريكية إلى نص وصوت طبيعي — فورًا، على أي جهاز، ودون أي رفع."
    },
    specs: [["98", "%", {
      en: "Egyptian Sign Language accuracy",
      ar: "دقة لغة الإشارة المصرية"
    }], ["88", "%", {
      en: "American Sign Language accuracy",
      ar: "دقة لغة الإشارة الأمريكية"
    }], ["100", "%", {
      en: "On-device, private",
      ar: "على الجهاز، خاص"
    }]],
    steps: [[TI.camera, {
      en: "Capture landmarks",
      ar: "التقاط النقاط"
    }, {
      en: "MediaPipe Holistic reads 21 hand + 33 body keypoints locally, 30fps.",
      ar: "يقرأ MediaPipe ٢١ نقطة لليد و٣٣ للجسم محليًا، ٣٠ إطار/ث."
    }], [TI.gauge, {
      en: "Recognize",
      ar: "تعرّف"
    }, {
      en: "A quantized TFLite model commits a sign once confidence stabilizes.",
      ar: "يثبّت نموذج TFLite الإشارة عند استقرار الثقة."
    }], [TI.volume, {
      en: "Read & speak",
      ar: "اقرأ وانطق"
    }, {
      en: "Signs stream to the transcript and can be spoken aloud in a natural voice.",
      ar: "تتدفّق الإشارات إلى النص ويمكن نطقها بصوت طبيعي."
    }]],
    uses: [[TI.users, {
      en: "Workplace",
      ar: "مكان العمل"
    }, {
      en: "Deaf professionals sign naturally while colleagues read live captions.",
      ar: "يوقّع المحترفون الصمّ بطبيعية بينما يقرأ الزملاء ترجمة حيّة."
    }], [TI.building, {
      en: "Clinics",
      ar: "العيادات"
    }, {
      en: "Patients sign to staff; consultations proceed without interpreter delays.",
      ar: "يوقّع المرضى للطاقم؛ وتمضي الاستشارات دون تأخير المترجم."
    }], [TI.graduation, {
      en: "Education",
      ar: "التعليم"
    }, {
      en: "Students get instant feedback; teachers verify correctness in real time.",
      ar: "يحصل الطلاب على تقييم فوري؛ ويتحقق المعلمون لحظيًا."
    }]]
  },
  signbridge: {
    no: "02",
    headline: {
      en: ["Bridge every", "conversation."],
      ar: ["اعبُر بكل", "محادثة."]
    },
    lead: {
      en: "SignBridge is a reverse translation engine: typed or spoken Egyptian and English become structured sign guidance — Egyptian and American Sign Language — through a pose avatar you can follow in real time.",
      ar: "SignBridge محرّك ترجمة عكسي: يتحوّل النص أو الكلام بالمصرية والإنجليزية إلى توجيه منظّم — بلغة الإشارة المصرية والأمريكية — عبر أفاتار حركي تتابعه فوريًا."
    },
    specs: [["EG · EN", "", {
      en: "Source languages",
      ar: "لغتا المصدر"
    }], ["ESL · ASL", "", {
      en: "Sign output",
      ar: "خرج الإشارة"
    }], ["Live", "", {
      en: "Streaming support",
      ar: "بث حيّ"
    }]],
    steps: [[TI.type, {
      en: "Type or speak",
      ar: "اكتب أو تكلّم"
    }, {
      en: "Enter Egyptian or English by keyboard or microphone.",
      ar: "أدخل المصرية أو الإنجليزية بالكتابة أو الميكروفون."
    }], [TI.languages, {
      en: "Gloss mapping",
      ar: "تخطيط الإشارة"
    }, {
      en: "An NLP engine resolves text to a Topic-Comment gloss sequence.",
      ar: "يحوّل محرك اللغة النص إلى تسلسل إشاري بترتيب الموضوع-التعليق."
    }], [TI.hand, {
      en: "Avatar signs",
      ar: "الأفاتار يوقّع"
    }, {
      en: "A pose-based avatar plays the sequence with adjustable speed.",
      ar: "يشغّل أفاتار حركي التسلسل بسرعة قابلة للضبط."
    }]],
    uses: [[TI.users, {
      en: "Two-way talk",
      ar: "حوار ثنائي"
    }, {
      en: "Hearing users speak; the Deaf participant follows ESL guidance.",
      ar: "يتكلّم السامعون؛ ويتابع المشارك الأصمّ توجيه الإشارة."
    }], [TI.building, {
      en: "Public counters",
      ar: "شبابيك الخدمة"
    }, {
      en: "Banks, offices and hospitals serve Deaf visitors without extra staff.",
      ar: "تخدم البنوك والمكاتب والمستشفيات الزوار الصمّ دون طاقم إضافي."
    }], [TI.graduation, {
      en: "Learning",
      ar: "التعلّم"
    }, {
      en: "Learners type a phrase and see the correct signing sequence.",
      ar: "يكتب المتعلّم جملة ويرى تسلسل الإشارة الصحيح."
    }]]
  },
  handtalk: {
    no: "03",
    headline: {
      en: ["Meet without", "barriers."],
      ar: ["اجتمع بلا", "حواجز."]
    },
    lead: {
      en: "HandTalk puts a signer and a speaker in one live room — each understood in their own language. Sign becomes captions, speech becomes sign guidance, both ways, over WebRTC.",
      ar: "يجمع HandTalk المُشير والمتحدث في غرفة حيّة واحدة — كلٌّ مفهوم بلغته. تتحوّل الإشارة إلى ترجمة، والكلام إلى إشارة، في الاتجاهين، عبر WebRTC."
    },
    specs: [["2", "", {
      en: "Roles per room",
      ar: "أدوار بالغرفة"
    }], ["Live", "", {
      en: "WebRTC video",
      ar: "فيديو حيّ"
    }], ["Both", "", {
      en: "Directions translated",
      ar: "اتجاهان مترجمان"
    }], ["0", "", {
      en: "Interpreters needed",
      ar: "بلا مترجمين"
    }]],
    steps: [[TI.video, {
      en: "Join the room",
      ar: "ادخل الغرفة"
    }, {
      en: "Signer and speaker connect over a peer-to-peer video call.",
      ar: "يتصل المُشير والمتحدث عبر مكالمة فيديو مباشرة."
    }], [TI.languages, {
      en: "Translate per role",
      ar: "ترجمة بالدور"
    }, {
      en: "Each side is captioned or given sign guidance automatically.",
      ar: "يُترجَم كل طرف بالترجمة أو بتوجيه الإشارة تلقائيًا."
    }], [TI.captions, {
      en: "Follow live",
      ar: "تابع مباشرةً"
    }, {
      en: "Captions and the sign avatar update in real time, both ways.",
      ar: "تتحدّث الترجمة والأفاتار في الوقت الفعلي، في الاتجاهين."
    }]],
    uses: [[TI.building, {
      en: "Healthcare",
      ar: "الرعاية الصحية"
    }, {
      en: "Doctor-patient consultations without scheduling an interpreter.",
      ar: "استشارات طبيب-مريض دون جدولة مترجم."
    }], [TI.users, {
      en: "Remote teams",
      ar: "الفرق عن بُعد"
    }, {
      en: "Deaf and hearing teammates meet on equal footing.",
      ar: "يجتمع الزملاء الصمّ والسامعون على قدم المساواة."
    }], [TI.broadcast, {
      en: "Live events",
      ar: "الفعاليات الحيّة"
    }, {
      en: "Add a translated sign track to any broadcast or webinar.",
      ar: "أضف مسار إشارة مترجمًا لأي بثّ أو ندوة."
    }]]
  }
};
function ProductLanding({
  which
}) {
  const [lang, setLang] = S.useLang();
  const t = (en, ar) => S.tr(lang, en, ar);
  const p = PRODUCTS[which];
  const c = PC[which];
  const accent = p.accent;
  const Ic = TI[p.icon];
  const SpecCard = (s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: "var(--surface-solid)",
      padding: "26px 22px",
      borderRadius: 18,
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-sm)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 700,
      fontSize: 38,
      letterSpacing: "-.03em",
      color: "var(--text)"
    }
  }, s[0], /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      color: accent
    }
  }, s[1])), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--muted)",
      marginTop: 6
    }
  }, t(s[2].en, s[2].ar)));
  return /*#__PURE__*/React.createElement("div", {
    className: "t-scope",
    "data-product": which,
    style: {
      minHeight: "100vh",
      overflowX: "hidden",
      background: "var(--bg)",
      color: "var(--text)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: -1,
      background: `radial-gradient(circle at 14% 8%, #fff, transparent 32%), radial-gradient(circle at 86% 10%, ${accent}0d, transparent 34%), linear-gradient(180deg,#fafafa,#f1f1ef)`
    }
  }), /*#__PURE__*/React.createElement(S.Nav, {
    current: which,
    lang: lang,
    setLang: setLang
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "150px 24px 60px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "1.05fr .95fr",
      gap: 44,
      alignItems: "center"
    },
    className: "pl-hero"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 15px",
      borderRadius: 999,
      border: "1px solid var(--border)",
      background: "var(--surface-solid)",
      marginBottom: 26
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 8,
      display: "grid",
      placeItems: "center",
      background: accent,
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement(Ic, {
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11.5,
      letterSpacing: ".16em",
      textTransform: "uppercase",
      color: accent
    }
  }, t(`Product ${c.no} — ` + p.tag.en, `المنتج ${c.no} — ` + p.tag.ar))), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: "clamp(46px,6vw,86px)",
      lineHeight: 1.08,
      letterSpacing: "-.045em",
      margin: 0
    }
  }, t(c.headline.en[0], c.headline.ar[0]), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: accent
    }
  }, t(c.headline.en[1], c.headline.ar[1]))), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 24,
      maxWidth: 520,
      fontSize: 18,
      lineHeight: 1.6,
      color: "var(--muted)"
    }
  }, t(c.lead.en, c.lead.ar)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: p.app,
    style: {
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    style: {
      borderRadius: 999,
      background: accent,
      color: "#fff"
    },
    iconRight: /*#__PURE__*/React.createElement(TI.arrowRight, {
      size: 16
    })
  }, t(`Try ${p.name}`, `جرّب ${p.name}`))))), /*#__PURE__*/React.createElement("div", {
    className: "pl-hero-panel",
    style: {
      position: "relative",
      height: 460,
      borderRadius: 30,
      overflow: "hidden",
      background: "linear-gradient(150deg,#0e0e14,#070709)",
      border: "1px solid rgba(255,255,255,.06)",
      boxShadow: "0 40px 100px rgba(0,0,0,.28)"
    }
  }, /*#__PURE__*/React.createElement(window.ThreeScene, {
    accent: accent,
    type: {
      signlens: "landmarks",
      signbridge: "bridge",
      handtalk: "dialogue"
    }[which]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 20,
      insetInlineStart: 22,
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: ".18em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,.45)"
    }
  }, p.name)))), /*#__PURE__*/React.createElement(S.Section, {
    style: {
      paddingBlock: "30px 60px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: `repeat(${c.specs.length},1fr)`,
      gap: 18
    },
    className: "pl-specs"
  }, c.specs.map(SpecCard))), /*#__PURE__*/React.createElement(S.Section, {
    style: {
      paddingTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 600,
      marginBottom: 44,
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(S.Eyebrow, {
    color: accent
  }, t("How it works", "كيف يعمل")), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: "clamp(32px,4vw,52px)",
      lineHeight: 1,
      letterSpacing: "-.04em",
      margin: 0
    }
  }, t("Three steps, in real time.", "ثلاث خطوات، في الوقت الفعلي."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 18
    },
    className: "pl-steps"
  }, c.steps.map((s, i) => {
    const SIc = s[0];
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: "var(--surface-solid)",
        border: "1px solid var(--border)",
        borderRadius: 22,
        padding: 28,
        boxShadow: "var(--shadow-sm)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 44,
        height: 44,
        borderRadius: 12,
        display: "grid",
        placeItems: "center",
        background: accent + "1f",
        color: accent
      }
    }, /*#__PURE__*/React.createElement(SIc, {
      size: 21
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 13,
        color: "var(--faint)"
      }
    }, "0", i + 1)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: FONT_D,
        fontWeight: 700,
        fontSize: 21,
        letterSpacing: "-.02em",
        color: "var(--text)",
        marginTop: 22
      }
    }, t(s[1].en, s[1].ar)), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 14,
        lineHeight: 1.6,
        color: "var(--muted)",
        margin: "8px 0 0"
      }
    }, t(s[2].en, s[2].ar)));
  }))), /*#__PURE__*/React.createElement(S.Section, {
    style: {
      paddingTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 600,
      marginBottom: 44,
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(S.Eyebrow, {
    color: accent
  }, t("Where it helps", "أين يفيد")), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: "clamp(32px,4vw,52px)",
      lineHeight: 1,
      letterSpacing: "-.04em",
      margin: 0
    }
  }, t("Built for everyday rooms.", "مصمّم للغرف اليومية."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 18
    },
    className: "pl-uses"
  }, c.uses.map((u, i) => {
    const UIc = u[0];
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: "var(--surface-solid)",
        border: "1px solid var(--border)",
        borderRadius: 22,
        padding: 28,
        boxShadow: "var(--shadow-sm)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: accent
      }
    }, /*#__PURE__*/React.createElement(UIc, {
      size: 24
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: FONT_D,
        fontWeight: 700,
        fontSize: 20,
        color: "var(--text)",
        marginTop: 16
      }
    }, t(u[1].en, u[1].ar)), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 14,
        lineHeight: 1.6,
        color: "var(--muted)",
        margin: "8px 0 0"
      }
    }, t(u[2].en, u[2].ar)));
  }))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "20px 24px 110px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: "0 auto",
      borderRadius: 32,
      overflow: "hidden",
      background: `linear-gradient(150deg, ${accent}, ${p.accent})`,
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(150deg, rgba(0,0,0,.18), transparent)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      padding: "64px 48px",
      textAlign: "center",
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 700,
      fontSize: "clamp(34px,4.6vw,58px)",
      lineHeight: 1,
      letterSpacing: "-.03em",
      margin: 0
    }
  }, t(`Try ${p.name} now.`, `جرّب ${p.name} الآن.`)), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 14,
      fontSize: 16,
      color: "rgba(255,255,255,.85)"
    }
  }, t("Try it live — no account required.", "جرّبها مباشرةً — دون حساب."), "\u062A\u062C\u0631\u0628\u0629.\")}"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28,
      display: "flex",
      justifyContent: "center",
      gap: 12,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: p.app,
    style: {
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    style: {
      borderRadius: 999,
      background: "#fff",
      color: "#0a0a0c"
    },
    iconRight: /*#__PURE__*/React.createElement(TI.arrowRight, {
      size: 16
    })
  }, t("Try it live", "جرّبها مباشرةً"))))))), /*#__PURE__*/React.createElement(S.Footer, {
    lang: lang
  }), /*#__PURE__*/React.createElement("style", null, `@media(max-width:900px){.pl-hero{grid-template-columns:1fr!important}.pl-hero-panel{height:360px!important}.pl-specs{grid-template-columns:1fr 1fr!important}.pl-steps,.pl-uses{grid-template-columns:1fr!important}}`));
}
window.ProductLanding = ProductLanding;
})(); } catch (e) { __ds_ns.__errors.push({ path: "site/ProductLanding.jsx", error: String((e && e.message) || e) }); }

// site/SignBridgeApp.jsx
try { (() => {
// SignBridge app — light reskin, amber product tint. window.SignBridgeApp.
const {
  useState: useStateSB,
  useRef: useRefSB,
  useEffect: useEffectSB
} = React;
const DSb = window.TogetherDesignSystem_58a58f;
const {
  Button: BtnSB,
  Segmented: SegSB
} = DSb;
const Ssb = window.TSite;
const TIsb = window.TIcons;
const FONT_Dsb = Ssb.FONT_D;
const PRESETS = [{
  en: "How are you?",
  ar: "إزيك؟",
  gloss: ["YOU", "HOW"]
}, {
  en: "I need help",
  ar: "محتاج مساعدة",
  gloss: ["HELP", "ME", "NEED"]
}, {
  en: "Thank you very much",
  ar: "شكراً جزيلاً",
  gloss: ["THANK-YOU", "MUCH"]
}, {
  en: "Where is the clinic?",
  ar: "فين العيادة؟",
  gloss: ["CLINIC", "WHERE"]
}];
const STOP = new Set(["the", "a", "an", "is", "are", "to", "of", "and"]);
function toGloss(text) {
  const hit = PRESETS.find(p => p.en.toLowerCase() === text.trim().toLowerCase() || p.ar === text.trim());
  if (hit) return hit.gloss;
  return text.trim().toUpperCase().replace(/[^\wء-ي\s]/g, "").split(/\s+/).filter(w => w && !STOP.has(w.toLowerCase())).slice(0, 8);
}
function PoseAvatar({
  frame,
  playing
}) {
  const poses = [{
    la: -20,
    ra: 20,
    h: 0
  }, {
    la: -55,
    ra: 50,
    h: -3
  }, {
    la: -35,
    ra: 70,
    h: 2
  }, {
    la: -70,
    ra: 35,
    h: -2
  }, {
    la: -25,
    ra: 25,
    h: 0
  }];
  const p = poses[frame % poses.length];
  const T = "transform .5s cubic-bezier(.16,1,.3,1)";
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 200 220",
    style: {
      width: 200,
      height: 220
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "sbgrad",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: "var(--p-accent)"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "var(--p-accent-strong)"
  }))), /*#__PURE__*/React.createElement("circle", {
    cx: "100",
    cy: 42 + p.h,
    r: "20",
    fill: "url(#sbgrad)",
    style: {
      transition: T
    }
  }), /*#__PURE__*/React.createElement("rect", {
    x: "82",
    y: "64",
    width: "36",
    height: "62",
    rx: "16",
    fill: "var(--p-accent)",
    opacity: ".85"
  }), /*#__PURE__*/React.createElement("g", {
    style: {
      transformOrigin: "82px 78px",
      transform: `rotate(${p.la}deg)`,
      transition: T
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "58",
    y: "74",
    width: "30",
    height: "11",
    rx: "5.5",
    fill: "url(#sbgrad)"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "58",
    cy: "79",
    r: "7",
    fill: "#34d399",
    style: {
      filter: playing ? "drop-shadow(0 0 6px #34d399)" : "none"
    }
  })), /*#__PURE__*/React.createElement("g", {
    style: {
      transformOrigin: "118px 78px",
      transform: `rotate(${p.ra}deg)`,
      transition: T
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "112",
    y: "74",
    width: "30",
    height: "11",
    rx: "5.5",
    fill: "url(#sbgrad)"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "142",
    cy: "79",
    r: "7",
    fill: "#34d399",
    style: {
      filter: playing ? "drop-shadow(0 0 6px #34d399)" : "none"
    }
  })));
}
function SBInner({
  lang,
  t
}) {
  const [src, setSrc] = useStateSB("text");
  const [text, setText] = useStateSB(lang === "ar" ? "إزيك؟" : "How are you?");
  const [gloss, setGloss] = useStateSB(["YOU", "HOW"]);
  const [frame, setFrame] = useStateSB(0);
  const [playing, setPlaying] = useStateSB(false);
  const [speed, setSpeed] = useStateSB("1");
  const [listening, setListening] = useStateSB(false);
  const timer = useRefSB(null);
  useEffectSB(() => {
    if (!playing || gloss.length === 0) return;
    const ms = 900 / parseFloat(speed);
    timer.current = setInterval(() => setFrame(f => {
      if (f + 1 >= gloss.length) {
        setPlaying(false);
        return f;
      }
      return f + 1;
    }), ms);
    return () => clearInterval(timer.current);
  }, [playing, speed, gloss]);
  const translate = tx => {
    const g = toGloss(tx || text);
    setGloss(g);
    setFrame(0);
    setPlaying(g.length > 0);
  };
  const current = gloss[frame] || "—";
  const card = {
    background: "var(--surface-solid)",
    border: "1px solid var(--border)",
    borderRadius: 18,
    boxShadow: "var(--shadow-sm)"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "360px 1fr",
      gap: 22,
      alignItems: "start"
    },
    className: "app-2col"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: ".07em",
      textTransform: "uppercase",
      color: "var(--faint)"
    }
  }, src === "text" ? t("Type a phrase", "اكتب جملة") : t("Speak a phrase", "تكلّم بجملة")), /*#__PURE__*/React.createElement(SegSB, {
    value: src,
    onChange: setSrc,
    options: [{
      value: "text",
      label: t("Text", "نص"),
      icon: /*#__PURE__*/React.createElement(TIsb.type, {
        size: 14
      })
    }, {
      value: "speech",
      label: t("Speech", "كلام"),
      icon: /*#__PURE__*/React.createElement(TIsb.mic, {
        size: 14
      })
    }]
  })), src === "text" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("textarea", {
    value: text,
    onChange: e => setText(e.target.value),
    rows: 3,
    dir: lang === "ar" ? "rtl" : "ltr",
    style: {
      width: "100%",
      resize: "none",
      padding: "11px 13px",
      borderRadius: 13,
      border: "1px solid var(--border)",
      background: "var(--surface-2)",
      color: "var(--text)",
      fontFamily: "var(--font-sans)",
      fontSize: 15,
      outline: "none",
      boxSizing: "border-box"
    }
  }), /*#__PURE__*/React.createElement(Button, {
    block: true,
    style: {
      marginTop: 12,
      background: "var(--p-accent)",
      color: "#fff"
    },
    variant: "accent",
    iconLeft: /*#__PURE__*/React.createElement(TIsb.hand, {
      size: 15
    }),
    onClick: () => translate()
  }, t("Translate to sign", "ترجم إلى إشارة"))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 14,
      padding: "10px 0 4px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setListening(v => !v);
      if (!listening) setTimeout(() => {
        setListening(false);
        const x = t("I need help", "محتاج مساعدة");
        setText(x);
        translate(x);
      }, 1700);
    },
    style: {
      width: 72,
      height: 72,
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      display: "grid",
      placeItems: "center",
      color: "#fff",
      background: listening ? "#ef4444" : "var(--p-accent)",
      boxShadow: listening ? "0 0 0 8px rgba(239,68,68,.15)" : "0 0 0 8px var(--p-accent-soft)",
      transition: "all .2s"
    }
  }, listening ? /*#__PURE__*/React.createElement(TIsb.micOff, {
    size: 26
  }) : /*#__PURE__*/React.createElement(TIsb.mic, {
    size: 26
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--muted)"
    }
  }, listening ? t("Listening…", "بستمع…") : t("Tap to speak", "اضغط للتحدّث")))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: ".07em",
      textTransform: "uppercase",
      color: "var(--faint)",
      marginBottom: 12
    }
  }, t("Try a phrase", "جرّب جملة")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, PRESETS.map(pr => {
    const label = lang === "ar" ? pr.ar : pr.en;
    return /*#__PURE__*/React.createElement("button", {
      key: pr.en,
      onClick: () => {
        setText(label);
        translate(label);
      },
      style: {
        border: "1px solid var(--border)",
        background: "var(--surface-2)",
        color: "var(--muted)",
        fontFamily: "var(--font-sans)",
        fontSize: 12.5,
        fontWeight: 600,
        padding: "7px 12px",
        borderRadius: 999,
        cursor: "pointer"
      }
    }, label);
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      minHeight: 340,
      background: "var(--viewport)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(PoseAvatar, {
    frame: frame,
    playing: playing
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 14,
      insetInlineStart: 14,
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: ".05em",
      textTransform: "uppercase",
      color: "var(--faint)"
    }
  }, t("Sign guide", "دليل الإشارة")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 14,
      insetInlineStart: "50%",
      transform: "translateX(-50%)",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 16px",
      borderRadius: 999,
      background: "rgba(8,8,12,.72)",
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "rgba(255,255,255,.55)"
    }
  }, t("Now signing", "يوقّع الآن")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 14,
      fontWeight: 500,
      color: "#34d399"
    }
  }, current))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: 16,
      borderTop: "1px solid var(--border)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    style: {
      background: "var(--p-accent)",
      color: "#fff"
    },
    variant: "accent",
    iconLeft: playing ? /*#__PURE__*/React.createElement(TIsb.pause, {
      size: 15
    }) : /*#__PURE__*/React.createElement(TIsb.play, {
      size: 15
    }),
    onClick: () => {
      if (frame + 1 >= gloss.length) setFrame(0);
      setPlaying(v => !v);
    }
  }, playing ? t("Pause", "إيقاف") : t("Play", "تشغيل")), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    iconLeft: /*#__PURE__*/React.createElement(TIsb.rotate, {
      size: 15
    }),
    onClick: () => {
      setFrame(0);
      setPlaying(true);
    }
  }, t("Restart", "إعادة")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 70,
      height: 6,
      borderRadius: 999,
      background: "var(--surface-2)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      borderRadius: 999,
      background: "var(--p-accent)",
      width: `${gloss.length ? (frame + 1) / gloss.length * 100 : 0}%`,
      transition: "width .4s"
    }
  })), /*#__PURE__*/React.createElement(SegSB, {
    value: speed,
    onChange: setSpeed,
    options: [{
      value: "0.5",
      label: "0.5×"
    }, {
      value: "1",
      label: "1×"
    }, {
      value: "1.5",
      label: "1.5×"
    }]
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: ".07em",
      textTransform: "uppercase",
      color: "var(--faint)",
      marginBottom: 12
    }
  }, t("Gloss sequence · Topic-Comment", "تسلسل الإشارة · موضوع-تعليق")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, gloss.length === 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--faint)"
    }
  }, t("Translate a phrase to see its gloss.", "ترجم جملة لرؤية تسلسلها.")), gloss.map((g, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    onClick: () => {
      setFrame(i);
      setPlaying(false);
    },
    style: {
      cursor: "pointer",
      fontFamily: "var(--font-mono)",
      fontSize: 12.5,
      fontWeight: 500,
      padding: "7px 13px",
      borderRadius: 999,
      transition: "all .2s",
      background: i === frame ? "var(--p-accent)" : "var(--p-accent-soft)",
      color: i === frame ? "#fff" : "var(--p-accent)"
    }
  }, g))))));
}
function SignBridgeApp() {
  return /*#__PURE__*/React.createElement(window.TAppFrame, {
    which: "signbridge"
  }, (lang, t) => /*#__PURE__*/React.createElement(SBInner, {
    lang: lang,
    t: t
  }));
}
window.SignBridgeApp = SignBridgeApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "site/SignBridgeApp.jsx", error: String((e && e.message) || e) }); }

// site/SignLensApp.jsx
try { (() => {
// SignLens app — light reskin, site nav, teal product tint. window.SignLensApp.
const {
  useState,
  useRef,
  useEffect
} = React;
const DS = window.TogetherDesignSystem_58a58f;
const {
  Button,
  Card,
  Badge,
  Switch
} = DS;
const S = window.TSite;
const TI = window.TIcons;
const {
  FONT_D,
  PRODUCTS
} = S;
const SCRIPT = [{
  gloss: "YOU",
  t: "00:01"
}, {
  gloss: "HOW",
  t: "00:02",
  en: "How are you?",
  ar: "إزيك؟"
}, {
  gloss: "ME",
  t: "00:05"
}, {
  gloss: "GOOD",
  t: "00:06"
}, {
  gloss: "THANK-YOU",
  t: "00:07",
  en: "I'm good, thank you.",
  ar: "أنا كويس، شكراً."
}];
function LandmarkOverlay({
  live
}) {
  const pts = [[50, 34], [46, 42], [42, 50], [39, 58], [54, 40], [55, 50], [56, 59], [60, 40], [62, 50], [63, 60], [66, 41], [68, 50], [69, 59]];
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 100 100",
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      opacity: live ? 1 : .22,
      transition: "opacity .4s"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M50 34 46 42 42 50 39 58M50 34 54 40 55 50 56 59M50 34 60 40 62 50 63 60M50 34 66 41 68 50 69 59",
    stroke: "var(--p-accent)",
    strokeWidth: ".5",
    fill: "none",
    opacity: ".5"
  }), pts.map((p, i) => /*#__PURE__*/React.createElement("circle", {
    key: i,
    cx: p[0],
    cy: p[1],
    r: "1.1",
    fill: "#34d399",
    style: {
      animation: live ? `tp 1.4s ${i * .05}s infinite` : "none"
    }
  })));
}
function AppFrame({
  which,
  children
}) {
  const [lang, setLang] = S.useLang();
  const p = PRODUCTS[which];
  const Ic = TI[p.icon];
  const t = (en, ar) => S.tr(lang, en, ar);
  return /*#__PURE__*/React.createElement("div", {
    className: "t-scope",
    "data-product": which,
    style: {
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--text)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: -1,
      background: `radial-gradient(circle at 12% 6%, #fff, transparent 34%), radial-gradient(circle at 90% 8%, ${p.accent}0d, transparent 32%), linear-gradient(180deg,#fafafa,#f1f1ef)`
    }
  }), /*#__PURE__*/React.createElement(S.Nav, {
    current: which,
    lang: lang,
    setLang: setLang
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: 1180,
      margin: "0 auto",
      padding: "112px 24px 60px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 46,
      height: 46,
      borderRadius: 13,
      display: "grid",
      placeItems: "center",
      background: p.accent,
      color: "#fff",
      boxShadow: `0 8px 22px ${p.accent}44`
    }
  }, /*#__PURE__*/React.createElement(Ic, {
    size: 22
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 700,
      fontSize: 26,
      letterSpacing: "-.02em"
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--faint)"
    }
  }, t(p.tag.en, p.tag.ar)))), /*#__PURE__*/React.createElement("a", {
    href: p.landing,
    style: {
      textDecoration: "none",
      color: "var(--muted)",
      fontSize: 13.5,
      fontWeight: 600,
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(TI.arrowLeft, {
    size: 15
  }), " ", t("Product page", "صفحة المنتج"))), children(lang, t, p)), /*#__PURE__*/React.createElement("style", null, `@keyframes tp{50%{opacity:.4}}@keyframes tb{0%,60%,100%{opacity:.35}30%{opacity:1}}@media(max-width:1000px){.app-2col{grid-template-columns:1fr!important}}`));
}
function SignLensApp() {
  return /*#__PURE__*/React.createElement(AppFrame, {
    which: "signlens"
  }, (lang, t, p) => /*#__PURE__*/React.createElement(Inner, {
    lang: lang,
    t: t,
    p: p
  }));
}
function Inner({
  lang,
  t,
  p
}) {
  const [live, setLive] = useState(false);
  const [speak, setSpeak] = useState(true);
  const [log, setLog] = useState([]);
  const [sentence, setSentence] = useState({
    en: "",
    ar: ""
  });
  const [copied, setCopied] = useState(false);
  const idx = useRef(0);
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      const step = SCRIPT[idx.current % SCRIPT.length];
      setLog(l => [{
        ...step,
        id: Date.now()
      }, ...l].slice(0, 7));
      if (step.en) setSentence({
        en: step.en,
        ar: step.ar
      });
      idx.current++;
    }, 1300);
    return () => clearInterval(id);
  }, [live]);
  const reset = () => {
    setLive(false);
    setLog([]);
    setSentence({
      en: "",
      ar: ""
    });
    idx.current = 0;
  };
  const display = lang === "ar" ? sentence.ar : sentence.en;
  const accBtn = {
    background: "var(--p-accent)",
    color: "#fff"
  };
  const card = {
    background: "var(--surface-solid)",
    border: "1px solid var(--border)",
    borderRadius: 18,
    boxShadow: "var(--shadow-sm)"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 340px",
      gap: 22,
      alignItems: "start"
    },
    className: "app-2col"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      minHeight: 340,
      background: "var(--viewport)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(LandmarkOverlay, {
    live: live
  }), live && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 14,
      insetInlineStart: 14,
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: "5px 11px",
      borderRadius: 999,
      background: "rgba(8,8,12,.7)",
      color: "#fff",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: ".05em"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "#ef4444",
      boxShadow: "0 0 0 3px rgba(239,68,68,.3)",
      animation: "tp 1.4s infinite"
    }
  }), "REC"), !live && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      textAlign: "center",
      color: "var(--faint)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(TI.camera, {
    size: 40,
    style: {
      opacity: .4
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      maxWidth: 230,
      lineHeight: 1.5,
      margin: 0
    }
  }, t("Camera is off. Start recognition to translate your signs.", "الكاميرا مغلقة. ابدأ التعرّف لترجمة إشاراتك."))), live && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 14,
      insetInlineStart: "50%",
      transform: "translateX(-50%)",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "7px 14px",
      borderRadius: 999,
      background: "rgba(8,8,12,.7)",
      color: "#fff",
      fontSize: 12,
      fontWeight: 600
    }
  }, t("Detecting signs", "جارٍ التعرّف"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      gap: 4
    }
  }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 5,
      height: 5,
      borderRadius: "50%",
      background: "var(--p-accent)",
      animation: `tb 1.2s ${i * .15}s infinite`
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      padding: 16,
      flexWrap: "wrap",
      alignItems: "center",
      borderTop: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    style: live ? {} : accBtn,
    variant: live ? "ghost" : "accent",
    iconLeft: live ? /*#__PURE__*/React.createElement(TI.pause, {
      size: 15
    }) : /*#__PURE__*/React.createElement(TI.play, {
      size: 15
    }),
    onClick: () => setLive(v => !v)
  }, live ? t("Pause", "إيقاف") : t("Start recognition", "ابدأ التعرّف")), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    iconLeft: /*#__PURE__*/React.createElement(TI.rotate, {
      size: 15
    }),
    onClick: reset
  }, t("Reset", "إعادة")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      marginInlineStart: "auto"
    }
  }, /*#__PURE__*/React.createElement(Switch, {
    checked: speak,
    onChange: setSpeak
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--muted)",
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(TI.volume, {
    size: 15
  }), " ", t("Speak aloud", "نطق بصوت"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: ".07em",
      textTransform: "uppercase",
      color: "var(--faint)",
      marginBottom: 10
    }
  }, t("Transcript", "النص")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_D,
      fontSize: 24,
      fontWeight: 500,
      lineHeight: 1.45,
      color: display ? "var(--text)" : "var(--faint)",
      minHeight: 34
    }
  }, display || (live ? t("Listening for hands…", "بانتظار اليدين…") : t("Your translation will appear here.", "ستظهر الترجمة هنا."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 9,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "soft",
    disabled: !display,
    iconLeft: copied ? /*#__PURE__*/React.createElement(TI.check, {
      size: 14
    }) : /*#__PURE__*/React.createElement(TI.copy, {
      size: 14
    }),
    onClick: () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  }, copied ? t("Copied", "تم") : t("Copy", "نسخ")), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    disabled: !display,
    iconLeft: /*#__PURE__*/React.createElement(TI.volume, {
      size: 14
    })
  }, t("Replay voice", "إعادة الصوت"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 18px 6px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700
    }
  }, t("Detected signs", "الإشارات المكتشفة")), /*#__PURE__*/React.createElement(Badge, {
    tone: "accent"
  }, log.length)), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: "4px 12px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 1
    }
  }, log.length === 0 && /*#__PURE__*/React.createElement("li", {
    style: {
      padding: "14px 8px",
      color: "var(--faint)",
      fontSize: 13
    }
  }, t("No signs yet.", "لا إشارات بعد.")), log.map(e => /*#__PURE__*/React.createElement("li", {
    key: e.id,
    style: {
      display: "flex",
      gap: 12,
      padding: "10px 8px",
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: "var(--faint)",
      minWidth: 38,
      fontWeight: 600,
      fontVariantNumeric: "tabular-nums"
    }
  }, e.t), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--p-accent)",
      fontWeight: 500
    }
  }, e.gloss))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(2,1fr)",
      gap: 1,
      background: "var(--border)",
      borderRadius: 13,
      overflow: "hidden",
      border: "1px solid var(--border)"
    }
  }, [[lang === "ar" ? "98" : "88", "%", t("Accuracy", "الدقة")], ["50", "+", t("Signs", "إشارات")]].map(m => /*#__PURE__*/React.createElement("div", {
    key: m[2],
    style: {
      background: "var(--surface-solid)",
      padding: "14px 10px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 750,
      fontVariantNumeric: "tabular-nums"
    }
  }, m[0], /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: "var(--faint)",
      fontWeight: 600
    }
  }, m[1])), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--faint)",
      marginTop: 3
    }
  }, m[2])))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 6
    }
  }, t("On-device & private", "على الجهاز وخاص")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12.5,
      lineHeight: 1.55,
      color: "var(--muted)",
      margin: 0
    }
  }, t("Landmark detection and inference run locally. No video ever leaves your device.", "يجري الكشف والاستدلال محليًا. لا يغادر الفيديو جهازك أبدًا.")))));
}
window.SignLensApp = SignLensApp;
window.TAppFrame = AppFrame;
window.TLandmark = LandmarkOverlay;
})(); } catch (e) { __ds_ns.__errors.push({ path: "site/SignLensApp.jsx", error: String((e && e.message) || e) }); }

// site/lib/cursor.js
try { (() => {
// Together — cursor companion. A precise ink ring tracks the pointer 1:1 while a
// glassy signing-hand glyph trails with spring physics. Over interactive elements
// (a, button, [role=button], [data-cursor]) the hand springs up, gives a quick
// "tap", and a soft halo ripples out — a modern, sleek focus cue. Fine pointers only.
(function () {
  if (typeof window === "undefined") return;
  if (!window.matchMedia || !window.matchMedia("(pointer: fine)").matches) return;
  if (window.__tcursor) return;
  window.__tcursor = true;
  // clear any stale cursor layers (e.g. from a hot reload) so they can't accumulate
  var old = document.querySelectorAll(".tc");
  for (var z = 0; z < old.length; z++) old[z].remove();
  var ease = "cubic-bezier(.16,1,.3,1)";
  var root = document.documentElement;
  if (!document.getElementById("tc-style")) {
    var style = document.createElement("style");
    style.id = "tc-style";
    style.textContent = "@media(pointer:fine){html,body,a,button,[role=button],[data-cursor],input,textarea,select,label{cursor:none!important}}" + ".tc{position:fixed;left:0;top:0;pointer-events:none;z-index:2147483600;will-change:transform,opacity}" + "@keyframes tc-tap{0%{transform:scale(1)}35%{transform:scale(.82) translateY(2px)}70%{transform:scale(1.08)}100%{transform:scale(1)}}" + ".tc-tap{animation:tc-tap .42s " + ease + "}" + "@keyframes tc-ripple{0%{transform:translate(var(--hx),var(--hy)) scale(.4);opacity:.5}100%{transform:translate(var(--hx),var(--hy)) scale(1.5);opacity:0}}";
    document.head.appendChild(style);
  }
  function el(css, html) {
    var d = document.createElement("div");
    d.className = "tc";
    d.style.cssText += css;
    if (html) d.innerHTML = html;
    root.appendChild(d);
    return d;
  }
  var ring = el(";width:13px;height:13px;margin:-6.5px 0 0 -6.5px;border:1.4px solid rgba(255,255,255,.9);border-radius:50%;mix-blend-mode:difference;" + "transition:width .3s " + ease + ",height .3s " + ease + ",margin .3s " + ease + ",opacity .25s");
  var halo = el(";width:46px;height:46px;margin:-23px 0 0 -23px;border:1.5px solid rgba(10,10,12,.5);border-radius:50%;opacity:0");
  var comp = el(";width:42px;height:42px;margin:-21px 0 0 -21px;display:flex;align-items:center;justify-content:center;border-radius:50%;" + "border:1px solid rgba(255,255,255,.55);background:rgba(255,255,255,.42);color:#0a0a0c;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);" + "box-shadow:0 8px 30px rgba(0,0,0,.15);transition:opacity .25s,box-shadow .3s " + ease + ",border-color .3s,background .3s;opacity:0");
  var hand = document.createElement("div");
  hand.style.cssText = "width:17px;height:17px;display:flex;transition:transform .3s " + ease;
  hand.innerHTML = '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M8 11V5.6a1.1 1.1 0 1 1 2.2 0V10m0 0V4.4a1.1 1.1 0 1 1 2.2 0V10m0 0V5.2a1.1 1.1 0 1 1 2.2 0V11m0-1.2a1.1 1.1 0 1 1 2.2 0v4.4c0 3-2.2 5.4-5.5 5.4-2 0-3.4-.7-4.6-2.2l-2.3-3a1.15 1.15 0 0 1 1.7-1.5L8 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  comp.appendChild(hand);
  var label = el(";transition:opacity .2s;opacity:0");
  var labelInner = document.createElement("span");
  labelInner.style.cssText = "display:inline-flex;white-space:nowrap;margin:16px 0 0 16px;border-radius:999px;background:#0a0a0c;color:#fff;padding:5px 12px;font-family:'DM Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.22em";
  label.appendChild(labelInner);
  var mx = -100,
    my = -100,
    cx = -100,
    cy = -100,
    hovering = false,
    wasHover = false,
    down = false,
    started = false;
  function place(node, x, y, extra) {
    node.style.transform = "translate(" + x + "px," + y + "px)" + (extra || "");
  }
  function onMove(e) {
    started = true;
    mx = e.clientX;
    my = e.clientY;
    place(ring, mx, my, down ? " scale(.8)" : "");
    ring.style.opacity = hovering ? "0" : down ? "1" : ".85";
    var t = e.target && e.target.closest ? e.target.closest("a, button, [role='button'], [data-cursor]") : null;
    hovering = !!t;
    if (hovering && !wasHover) onEnter();
    if (!hovering && wasHover) {
      label.style.opacity = "0";
    }
    wasHover = hovering;
    var lab = t ? t.getAttribute("data-cursor") : null;
    if (hovering && lab) {
      labelInner.textContent = lab;
      label.style.opacity = "1";
    } else if (!lab) label.style.opacity = "0";
    // hovering visuals on comp
    if (hovering) {
      comp.style.boxShadow = "0 14px 42px rgba(0,0,0,.24)";
      comp.style.borderColor = "rgba(10,10,12,.16)";
      comp.style.background = "rgba(255,255,255,.6)";
    } else {
      comp.style.boxShadow = "0 8px 30px rgba(0,0,0,.15)";
      comp.style.borderColor = "rgba(255,255,255,.55)";
      comp.style.background = "rgba(255,255,255,.42)";
    }
  }
  function onEnter() {
    // quick "tap" on the hand
    hand.classList.remove("tc-tap");
    void hand.offsetWidth;
    hand.classList.add("tc-tap");
    // soft halo ripple at the cursor
    halo.style.setProperty("--hx", cx + "px");
    halo.style.setProperty("--hy", cy + "px");
    halo.style.animation = "none";
    void halo.offsetWidth;
    halo.style.opacity = "1";
    halo.style.animation = "tc-ripple .55s " + ease + " forwards";
  }
  function loop() {
    if (!ring.isConnected) root.appendChild(ring);
    if (!halo.isConnected) root.appendChild(halo);
    if (!comp.isConnected) root.appendChild(comp);
    if (!label.isConnected) root.appendChild(label);
    cx += (mx - cx) * 0.2;
    cy += (my - cy) * 0.2;
    var t = performance.now() / 1000;
    if (hovering) {
      var s = 1.28 + 0.05 * Math.sin(t * 3.2);
      place(comp, cx, cy, " scale(" + s + ")");
      comp.style.opacity = "1";
      hand.style.transform = "rotate(" + Math.sin(t * 2.4) * 7 + "deg)";
    } else {
      place(comp, cx, cy, " scale(1)");
      comp.style.opacity = started ? "1" : "0";
      hand.style.transform = "rotate(0deg)";
    }
    if (label.style.opacity === "1") place(label, cx, cy);
    requestAnimationFrame(loop);
  }
  window.addEventListener("pointermove", onMove, {
    passive: true
  });
  window.addEventListener("pointerdown", function () {
    down = true;
  });
  window.addEventListener("pointerup", function () {
    down = false;
  });
  document.addEventListener("mouseleave", function () {
    ring.style.opacity = "0";
    comp.style.opacity = "0";
  });
  document.addEventListener("mouseenter", function () {
    if (started) {
      ring.style.opacity = hovering ? "0" : ".85";
      comp.style.opacity = "1";
    }
  });
  requestAnimationFrame(loop);
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "site/lib/cursor.js", error: String((e && e.message) || e) }); }

// site/lib/icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Lucide-matched icon set (the brand uses lucide-react). 24×24, 1.8 stroke,
// round caps/joins. Exposed on window so every UI kit can share them.
const React = window.React;
function Icon({
  d,
  size = 20,
  stroke = 1.8,
  fill = "none",
  style,
  children
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: fill,
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: style,
    "aria-hidden": "true"
  }, children || d && /*#__PURE__*/React.createElement("path", {
    d: d
  }));
}
const P = d => props => /*#__PURE__*/React.createElement(Icon, props, Array.isArray(d) ? d.map((x, i) => /*#__PURE__*/React.createElement("path", {
  key: i,
  d: x
})) : /*#__PURE__*/React.createElement("path", {
  d: d
}));
const Icons = {
  arrowRight: P("M5 12h14M12 5l7 7-7 7"),
  arrowLeft: P("M19 12H5M12 19l-7-7 7-7"),
  fileText: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 2v6h6M16 13H8M16 17H8M10 9H8"
  })),
  volume: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M11 5 6 9H2v6h4l5 4z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
  })),
  hand: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"
  })),
  captions: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "5",
    width: "18",
    height: "14",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 12a2 2 0 0 1 2-2M13 12a2 2 0 0 1 2-2M9 14a2 2 0 0 0 2-2M15 14a2 2 0 0 0 2-2"
  })),
  video: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "6",
    width: "14",
    height: "12",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m16 10 6-3v10l-6-3"
  })),
  videoOff: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M10.66 6H14a2 2 0 0 1 2 2v2.34l1 1L22 8v8M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2l10 10ZM2 2l20 20"
  })),
  menu: P("M4 6h16M4 12h16M4 18h16"),
  x: P("M18 6 6 18M6 6l12 12"),
  languages: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"
  })),
  dashboard: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "3",
    width: "7",
    height: "9",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "3",
    width: "7",
    height: "5",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "12",
    width: "7",
    height: "9",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "16",
    width: "7",
    height: "5",
    rx: "1"
  })),
  history: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M3 12a9 9 0 1 0 3-6.7L3 8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 3v5h5M12 7v5l3 2"
  })),
  settings: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
  })),
  sparkles: P(["M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z", "M19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8z"]),
  audio: P("M2 10v4M6 6v12M10 3v18M14 8v8M18 5v14M22 10v4"),
  mic: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
    x: "9",
    y: "2",
    width: "6",
    height: "12",
    rx: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 10a7 7 0 0 0 14 0M12 17v5"
  })),
  micOff: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6M5 10a7 7 0 0 0 10.79 5.93M19 10a7 7 0 0 1-.11 1.23M12 19v3M2 2l20 20"
  })),
  type: P(["M4 7V5h16v2", "M9 19h6", "M12 5v14"]),
  play: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 4l14 8-14 8z"
  })),
  pause: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "6",
    y: "4",
    width: "4",
    height: "16",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "4",
    width: "4",
    height: "16",
    rx: "1"
  })),
  camera: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "13",
    r: "4"
  })),
  copy: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
    x: "9",
    y: "9",
    width: "13",
    height: "13",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
  })),
  check: P("M20 6 9 17l-5-5"),
  send: P(["M22 2 11 13", "M22 2 15 22l-4-9-9-4z"]),
  search: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4.3-4.3"
  })),
  chevronDown: P("M6 9l6 6 6-6"),
  users: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "7",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
  })),
  building: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
    x: "4",
    y: "2",
    width: "16",
    height: "20",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 22v-4h6v4M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01"
  })),
  graduation: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M22 10 12 5 2 10l10 5 10-5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 12v5c0 1 2 3 6 3s6-2 6-3v-5"
  })),
  broadcast: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14"
  })),
  plus: P("M12 5v14M5 12h14"),
  phone: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1z"
  })),
  sun: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
  })),
  moon: P("M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"),
  monitor: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "3",
    width: "20",
    height: "14",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 21h8M12 17v4"
  })),
  gauge: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M12 14l4-4M3.34 19a10 10 0 1 1 17.32 0"
  })),
  rotate: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M3 12a9 9 0 1 0 9-9 9.7 9.7 0 0 0-6.7 2.7L3 8M3 3v5h5"
  })),
  download: P(["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"]),
  logout: P(["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"])
};
window.TIcons = Icons;
})(); } catch (e) { __ds_ns.__errors.push({ path: "site/lib/icons.jsx", error: String((e && e.message) || e) }); }

// site/lib/reveal.js
try { (() => {
// Together — scroll reveal. Block text (h1–h4, p) rises + clarifies (blur→sharp)
// into view as you scroll, with a gentle per-section stagger. Direction-agnostic
// (LTR + RTL). Respects prefers-reduced-motion. Scroll-position based (reliable
// across embeds where IntersectionObserver delivery is throttled). All pages.
(function () {
  if (typeof window === "undefined") return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.__treveal) return;
  window.__treveal = true;
  var EASE = "cubic-bezier(.16,1,.3,1)";
  var style = document.createElement("style");
  style.textContent = ".reveal-init{opacity:0;transform:translateY(26px);filter:blur(5px);" + "transition:opacity .8s " + EASE + ",transform .8s " + EASE + ",filter .8s " + EASE + ";will-change:opacity,transform,filter}" + ".reveal-in{opacity:1;transform:none;filter:none}";
  document.head.appendChild(style);
  var SEL = "#root h1, #root h2, #root h3, #root h4, #root p";
  var tracked = [];
  function scan() {
    var nodes = document.querySelectorAll(SEL);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.__rev) continue;
      el.__rev = true;
      var parent = el.parentElement,
        idx = 0;
      if (parent) {
        parent.__revIdx = (parent.__revIdx || 0) + 1;
        idx = parent.__revIdx - 1;
      }
      el.style.transitionDelay = Math.min(idx * 70, 260) + "ms";
      el.classList.add("reveal-init");
      tracked.push(el);
    }
    check();
  }
  var ticking = false;
  function check() {
    ticking = false;
    var h = window.innerHeight || document.documentElement.clientHeight;
    var trigger = h * 0.9;
    for (var i = tracked.length - 1; i >= 0; i--) {
      var el = tracked[i];
      var top = el.getBoundingClientRect().top;
      if (top < trigger && top > -el.offsetHeight - 200) {
        el.classList.add("reveal-in");
        tracked.splice(i, 1);
      } else if (top <= -el.offsetHeight - 200) {
        // already scrolled well past (e.g. deep-link): just show, no animation cost
        el.classList.add("reveal-in");
        tracked.splice(i, 1);
      }
    }
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(check);
    }
  }
  function start() {
    var root = document.getElementById("root");
    if (root) {
      var t = null;
      new MutationObserver(function () {
        clearTimeout(t);
        t = setTimeout(scan, 60);
      }).observe(root, {
        childList: true,
        subtree: true
      });
    }
    scan();
  }
  window.addEventListener("scroll", onScroll, {
    passive: true
  });
  window.addEventListener("resize", onScroll);
  if (document.readyState !== "loading") start();else document.addEventListener("DOMContentLoaded", start);
  [150, 500, 1100, 1800].forEach(function (ms) {
    setTimeout(scan, ms);
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "site/lib/reveal.js", error: String((e && e.message) || e) }); }

// site/lib/site.jsx
try { (() => {
// Together site — shared shell: language system, dark nav, footer, product data.
// Exposed on window.TSite. Each page is its own React root that composes these.
const {
  useState,
  useEffect,
  useRef
} = React;
const I = window.TIcons;

// ── Products ──────────────────────────────────────────────
const PRODUCTS = {
  signlens: {
    key: "signlens",
    name: "SignLens",
    accent: "#1f8a82",
    tag: {
      en: "Sign → Text & Voice",
      ar: "إشارة ← نص وصوت"
    },
    blurb: {
      en: "Real-time recognition turns signing into clean captions and natural speech.",
      ar: "تعرّف فوري يحوّل الإشارة إلى نص واضح وصوت طبيعي."
    },
    icon: "camera",
    landing: "signlens.html",
    app: "signlens-app.html"
  },
  signbridge: {
    key: "signbridge",
    name: "SignBridge",
    accent: "#c2873b",
    tag: {
      en: "Text & Speech → Sign",
      ar: "نص وكلام ← إشارة"
    },
    blurb: {
      en: "Type or speak Egyptian or English — watch it become guided sign language.",
      ar: "اكتب أو تكلّم بالمصرية أو الإنجليزية — وشاهدها تتحوّل إلى لغة إشارة موجّهة."
    },
    icon: "hand",
    landing: "signbridge.html",
    app: "signbridge-app.html"
  },
  handtalk: {
    key: "handtalk",
    name: "HandTalk",
    accent: "#4c63d2",
    tag: {
      en: "Live meetings, both ways",
      ar: "اجتماعات حيّة، في الاتجاهين"
    },
    blurb: {
      en: "A signer and a speaker in one room, understood in both directions, live.",
      ar: "مُشير ومتحدث في غرفة واحدة، مفهومان في الاتجاهين، مباشرةً."
    },
    icon: "video",
    landing: "handtalk.html",
    app: "handtalk-app.html"
  }
};
const FONT_D = "'Bricolage Grotesque', 'Thmanyah Serif', serif";

// ── Language hook (persisted + cross-root sync) ───────────
function useLang() {
  const [lang, setLangState] = useState(() => typeof localStorage !== "undefined" && localStorage.getItem("t-lang") || "en");
  useEffect(() => {
    const h = () => setLangState(localStorage.getItem("t-lang") || "en");
    window.addEventListener("t-lang", h);
    return () => window.removeEventListener("t-lang", h);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.style.fontFamily = lang === "ar" ? "var(--font-arabic)" : "var(--font-sans)";
  }, [lang]);
  const setLang = l => {
    localStorage.setItem("t-lang", l);
    window.dispatchEvent(new Event("t-lang"));
  };
  return [lang, setLang];
}
const tr = (lang, en, ar) => lang === "ar" ? ar : en;

// ── Language toggle pill ──────────────────────────────────
function LangToggle({
  lang,
  setLang,
  onDark = true
}) {
  const base = {
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: 12.5,
    fontWeight: 650,
    padding: "6px 12px",
    borderRadius: 999,
    transition: "all .2s",
    background: "transparent"
  };
  const idle = onDark ? "rgba(255,255,255,.5)" : "var(--faint)";
  const activeBg = onDark ? "rgba(255,255,255,.14)" : "var(--ink)";
  const activeFg = "#fff";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 2,
      padding: 3,
      borderRadius: 999,
      background: onDark ? "rgba(255,255,255,.07)" : "var(--surface-2)",
      border: onDark ? "1px solid rgba(255,255,255,.1)" : "1px solid var(--border)"
    }
  }, [["en", "EN"], ["ar", "ع"]].map(([v, l]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    onClick: () => setLang(v),
    style: {
      ...base,
      color: lang === v ? activeFg : idle,
      background: lang === v ? activeBg : "transparent",
      fontFamily: v === "ar" ? "var(--font-arabic)" : "var(--font-sans)"
    }
  }, l)));
}

// ── Brand lockup (white two-hands logo) ───────────────────
function Brand({
  height = 36
}) {
  return /*#__PURE__*/React.createElement("a", {
    href: "index.html",
    style: {
      display: "inline-flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../assets/logo-lockup-white.png",
    alt: "Together",
    style: {
      height,
      display: "block"
    }
  }));
}

// ── Top navigation (dark ink bar) ─────────────────────────
function Nav({
  current,
  lang,
  setLang
}) {
  const [open, setOpen] = useState(false);
  const [prodOpen, setProdOpen] = useState(false);
  const t = (en, ar) => tr(lang, en, ar);
  const link = (href, label, active) => /*#__PURE__*/React.createElement("a", {
    href: href,
    "data-cursor": "View",
    style: {
      color: active ? "#fff" : "rgba(255,255,255,.62)",
      textDecoration: "none",
      fontSize: 14,
      fontWeight: active ? 600 : 500,
      transition: "color .2s",
      whiteSpace: "nowrap"
    },
    onMouseEnter: e => e.currentTarget.style.color = "#fff",
    onMouseLeave: e => e.currentTarget.style.color = active ? "#fff" : "rgba(255,255,255,.62)"
  }, label);
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: "0 auto",
      height: 62,
      borderRadius: 999,
      background: "linear-gradient(180deg, rgba(30,30,38,.66), rgba(9,9,12,.74))",
      border: "1px solid rgba(255,255,255,.14)",
      backdropFilter: "blur(26px) saturate(180%)",
      WebkitBackdropFilter: "blur(26px) saturate(180%)",
      boxShadow: "0 14px 44px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.22), inset 0 -8px 24px rgba(255,255,255,.04)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingInline: "22px 12px",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Brand, null), /*#__PURE__*/React.createElement("div", {
    className: "nav-links",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 26,
      position: "relative"
    }
  }, link("index.html", t("Home", "الرئيسية"), current === "home"), /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => setProdOpen(true),
    onMouseLeave: () => setProdOpen(false),
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: ["signlens", "signbridge", "handtalk"].includes(current) ? "#fff" : "rgba(255,255,255,.62)",
      fontSize: 14,
      fontWeight: 500,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 5
    }
  }, t("Products", "المنتجات"), " ", /*#__PURE__*/React.createElement(I.chevronDown, {
    size: 14
  })), prodOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 300,
      background: "linear-gradient(180deg, rgba(26,26,32,.86), rgba(12,12,15,.92))",
      border: "1px solid rgba(255,255,255,.14)",
      borderRadius: 20,
      padding: 8,
      backdropFilter: "blur(26px) saturate(180%)",
      WebkitBackdropFilter: "blur(26px) saturate(180%)",
      boxShadow: "0 24px 64px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.16)"
    }
  }, Object.values(PRODUCTS).map(p => {
    const Ic = I[p.icon];
    return /*#__PURE__*/React.createElement("a", {
      key: p.key,
      href: p.landing,
      style: {
        display: "flex",
        gap: 12,
        padding: 12,
        borderRadius: 12,
        textDecoration: "none",
        alignItems: "center",
        transition: "background .2s"
      },
      onMouseEnter: e => e.currentTarget.style.background = "rgba(255,255,255,.06)",
      onMouseLeave: e => e.currentTarget.style.background = "transparent"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 36,
        height: 36,
        borderRadius: 10,
        display: "grid",
        placeItems: "center",
        background: p.accent + "22",
        color: p.accent,
        flex: "none"
      }
    }, /*#__PURE__*/React.createElement(Ic, {
      size: 18
    })), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        color: "#fff",
        fontSize: 14,
        fontWeight: 650
      }
    }, p.name), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        color: "rgba(255,255,255,.5)",
        fontSize: 12,
        marginTop: 1
      }
    }, t(p.tag.en, p.tag.ar))));
  })))), link("about.html", t("About", "من نحن"), current === "about")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nav-lang"
  }, /*#__PURE__*/React.createElement(LangToggle, {
    lang: lang,
    setLang: setLang
  })), /*#__PURE__*/React.createElement("button", {
    className: "nav-burger",
    onClick: () => setOpen(v => !v),
    style: {
      display: "none",
      border: "none",
      background: "transparent",
      color: "#fff",
      cursor: "pointer"
    }
  }, open ? /*#__PURE__*/React.createElement(I.x, {
    size: 22
  }) : /*#__PURE__*/React.createElement(I.menu, {
    size: 22
  })))), open && /*#__PURE__*/React.createElement("div", {
    className: "nav-mobile",
    style: {
      maxWidth: 1240,
      margin: "10px auto 0",
      background: "rgba(14,14,17,.97)",
      border: "1px solid rgba(255,255,255,.1)",
      borderRadius: 20,
      padding: 18,
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "index.html",
    style: {
      color: "#fff",
      textDecoration: "none",
      padding: "10px 8px",
      fontSize: 15
    }
  }, t("Home", "الرئيسية")), Object.values(PRODUCTS).map(p => /*#__PURE__*/React.createElement("a", {
    key: p.key,
    href: p.landing,
    style: {
      color: "rgba(255,255,255,.7)",
      textDecoration: "none",
      padding: "10px 8px",
      fontSize: 15
    }
  }, p.name)), /*#__PURE__*/React.createElement("a", {
    href: "about.html",
    style: {
      color: "#fff",
      textDecoration: "none",
      padding: "10px 8px",
      fontSize: 15
    }
  }, t("About", "من نحن")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 8px"
    }
  }, /*#__PURE__*/React.createElement(LangToggle, {
    lang: lang,
    setLang: setLang
  }))), /*#__PURE__*/React.createElement("style", null, `@media(max-width:880px){.nav-links{display:none!important}.nav-lang{display:none!important}.nav-burger{display:grid!important}.nav-cta span,.nav-cta{font-size:13px}}`));
}

// ── Footer (dark) ─────────────────────────────────────────
function Footer({
  lang
}) {
  const t = (en, ar) => tr(lang, en, ar);
  const col = (title, links) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: ".18em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,.4)"
    }
  }, title), links.map(([h, l]) => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: h,
    style: {
      color: "rgba(255,255,255,.7)",
      textDecoration: "none",
      fontSize: 14
    }
  }, l)));
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "#08080a",
      color: "#fff",
      padding: "72px 24px 36px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 48,
      flexWrap: "wrap",
      paddingBottom: 48,
      borderBottom: "1px solid rgba(255,255,255,.1)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 320
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../assets/logo-lockup-white.png",
    alt: "Together",
    style: {
      height: 42
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(255,255,255,.55)",
      fontSize: 14,
      lineHeight: 1.6,
      marginTop: 18
    }
  }, t("Sign language, bridged in real time — Egyptian and American Sign Language.", "لغة الإشارة، مترجمة في الوقت الفعلي — لغة الإشارة المصرية والأمريكية."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 64,
      flexWrap: "wrap"
    }
  }, col(t("Products", "المنتجات"), Object.values(PRODUCTS).map(p => [p.landing, p.name])), col(t("Company", "الشركة"), [["about.html", t("About & contact", "من نحن وتواصل")], ["signlens-app.html", t("Try it live", "جرّبها مباشرةً")], ["auth.html", t("Sign in", "تسجيل الدخول")]]))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 16,
      paddingTop: 28,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11.5,
      letterSpacing: ".14em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,.4)"
    }
  }, t("Sign language. One world.", "لغة الإشارة. عالم واحد.")))));
}

// ── Shared layout helpers ─────────────────────────────────
function Eyebrow({
  children,
  color
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      letterSpacing: ".22em",
      textTransform: "uppercase",
      color: color || "var(--muted)"
    }
  }, children);
}
function Section({
  children,
  style,
  id
}) {
  return /*#__PURE__*/React.createElement("section", {
    id: id,
    style: {
      padding: "104px 24px",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: "0 auto"
    }
  }, children));
}
window.TSite = {
  PRODUCTS,
  FONT_D,
  useLang,
  tr,
  LangToggle,
  Brand,
  Nav,
  Footer,
  Eyebrow,
  Section
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "site/lib/site.jsx", error: String((e && e.message) || e) }); }

// site/lib/three-hero.jsx
try { (() => {
// Together — interactive Three.js heroes. One scene per page, tied to the product,
// tinted with its accent, mouse-reactive, and tuned for smoothness (capped DPR,
// Points/Lines, no per-frame allocation, pauses when off-screen / tab hidden).
// window.ThreeScene  ({ accent, type, style }). Types:
//   field (home) · landmarks (SignLens) · bridge (SignBridge)
//   dialogue (HandTalk) · community (About)
const {
  useRef,
  useEffect
} = React;
const SCENES = {
  // ── Home: a flowing waveform field; the cursor sends a ripple through it ──
  field(THREE, scene, camera, col) {
    camera.position.set(0, 5.5, 12);
    camera.lookAt(0, 0.4, 0);
    const NX = 58,
      NZ = 38,
      gap = 0.46,
      count = NX * NZ;
    const pos = new Float32Array(count * 3),
      bx = new Float32Array(count),
      bz = new Float32Array(count);
    let k = 0;
    for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
      const x = (i - NX / 2) * gap,
        z = (j - NZ / 2) * gap;
      pos[k * 3] = x;
      pos[k * 3 + 2] = z;
      bx[k] = x;
      bz[k] = z;
      k++;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({
      color: col,
      size: 0.075,
      transparent: true,
      opacity: 0.9
    }));
    scene.add(pts);
    const a = geo.attributes.position.array;
    return {
      update(t, s) {
        const cx = s.mx * 9,
          cz = -s.my * 6;
        for (let i = 0; i < count; i++) {
          const x = bx[i],
            z = bz[i];
          let y = Math.sin(x * 0.5 + t * 0.9) * 0.32 + Math.cos(z * 0.6 + t * 0.7) * 0.32;
          const dx = x - cx,
            dz = z - cz,
            d = Math.sqrt(dx * dx + dz * dz);
          y += Math.exp(-d * 0.45) * Math.sin(d * 1.8 - t * 4) * 0.9;
          a[i * 3 + 1] = y;
        }
        geo.attributes.position.needsUpdate = true;
        pts.rotation.y = s.mx * 0.12;
      },
      dispose() {
        geo.dispose();
        pts.material.dispose();
      }
    };
  },
  // ── SignLens: a 3D landmark constellation with a sweeping recognition scan ──
  landmarks(THREE, scene, camera, col) {
    camera.position.set(0, 0, 12);
    const N = 120,
      V = [];
    for (let i = 0; i < N; i++) {
      const r = 5 * Math.cbrt(Math.random()),
        th = Math.random() * 6.283,
        ph = Math.acos(2 * Math.random() - 1);
      V.push(new THREE.Vector3(r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th) * 0.82, r * Math.cos(ph)));
    }
    const pGeo = new THREE.BufferGeometry().setFromPoints(V);
    const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: col,
      size: 0.17,
      transparent: true,
      opacity: 0.95
    }));
    const seg = [];
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) if (V[i].distanceTo(V[j]) < 2.2) seg.push(V[i], V[j]);
    const lGeo = new THREE.BufferGeometry().setFromPoints(seg);
    const lines = new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({
      color: col,
      transparent: true,
      opacity: 0.18
    }));
    const scan = new THREE.Mesh(new THREE.PlaneGeometry(12, 0.05), new THREE.MeshBasicMaterial({
      color: 0x4cf0c0,
      transparent: true,
      opacity: 0.5
    }));
    const g = new THREE.Group();
    g.add(pts);
    g.add(lines);
    g.add(scan);
    scene.add(g);
    return {
      update(t, s) {
        g.rotation.y = t * 0.12 + s.mx * 0.6;
        g.rotation.x = s.my * 0.4 + Math.sin(t * 0.2) * 0.08;
        scan.position.y = Math.sin(t * 0.7) * 5;
        scan.material.opacity = 0.3 + 0.22 * (0.5 + 0.5 * Math.sin(t * 4));
      },
      dispose() {
        pGeo.dispose();
        lGeo.dispose();
        pts.material.dispose();
        lines.material.dispose();
      }
    };
  },
  // ── SignBridge: particles streaming across an arc — text bridged into sign ──
  bridge(THREE, scene, camera, col) {
    camera.position.set(0, 0, 13);
    const M = 460,
      pos = new Float32Array(M * 3),
      ph = new Float32Array(M),
      fan = new Float32Array(M);
    for (let i = 0; i < M; i++) {
      ph[i] = Math.random();
      fan[i] = Math.random() - 0.5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({
      color: col,
      size: 0.12,
      transparent: true,
      opacity: 0.95
    }));
    const ends = [];
    for (let i = 0; i < 70; i++) {
      ends.push(new THREE.Vector3(-5.4 + (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 4.4, (Math.random() - 0.5) * 1.5));
      ends.push(new THREE.Vector3(5.4 + (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 4.4, (Math.random() - 0.5) * 1.5));
    }
    const eGeo = new THREE.BufferGeometry().setFromPoints(ends);
    const ePts = new THREE.Points(eGeo, new THREE.PointsMaterial({
      color: col,
      size: 0.1,
      transparent: true,
      opacity: 0.55
    }));
    const grp = new THREE.Group();
    grp.add(pts);
    grp.add(ePts);
    scene.add(grp);
    const a = geo.attributes.position.array;
    return {
      update(t, s) {
        const bend = 2.6 + s.my * 1.6;
        for (let i = 0; i < M; i++) {
          let p = (ph[i] + t * 0.17) % 1;
          const env = Math.sin(p * Math.PI);
          a[i * 3] = -5.4 + 10.8 * p;
          a[i * 3 + 1] = env * bend + fan[i] * 3.4 * (1 - env);
          a[i * 3 + 2] = fan[i] * 2.2 * env;
        }
        geo.attributes.position.needsUpdate = true;
        grp.rotation.y = s.mx * 0.2;
        grp.rotation.x = -s.my * 0.12;
      },
      dispose() {
        geo.dispose();
        eGeo.dispose();
        pts.material.dispose();
        ePts.material.dispose();
      }
    };
  },
  // ── HandTalk: two pulsing nodes with a signal travelling both ways between ──
  dialogue(THREE, scene, camera, col) {
    camera.position.set(0, 0, 12);
    const Lx = -4,
      Rx = 4;
    const light = new THREE.Color(col).clone();
    light.offsetHSL(0, -0.1, 0.12);
    const mk = (x, c) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 20), new THREE.MeshBasicMaterial({
        color: c,
        transparent: true,
        opacity: 0.92
      }));
      m.position.set(x, 0, 0);
      scene.add(m);
      return m;
    };
    const nL = mk(Lx, col),
      nR = mk(Rx, light);
    const NB = 7,
      lines = [];
    for (let b = 0; b < NB; b++) {
      const mid = (b - (NB - 1) / 2) * 0.55;
      const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(Lx, 0, 0), new THREE.Vector3(0, mid, mid * 0.4), new THREE.Vector3(Rx, 0, 0));
      const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(36));
      const ln = new THREE.Line(g, new THREE.LineBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.14
      }));
      scene.add(ln);
      lines.push({
        ln,
        g
      });
    }
    const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), new THREE.MeshBasicMaterial({
      color: 0xaebcff
    }));
    scene.add(pulse);
    return {
      update(t, s) {
        nL.scale.setScalar(1 + 0.12 * Math.sin(t * 2));
        nR.scale.setScalar(1 + 0.12 * Math.sin(t * 2 + 1.6));
        const cyc = t * 0.42 % 2,
          p = cyc < 1 ? cyc : 2 - cyc,
          my = Math.sin(t) * 0.5 + s.my * 1.4,
          u = 1 - p;
        pulse.position.set(u * u * Lx + p * p * Rx, 2 * u * p * my, 0);
        pulse.scale.setScalar(0.8 + 0.4 * Math.sin(t * 6));
        scene.rotation.y = s.mx * 0.25;
        scene.rotation.x = -s.my * 0.12;
        for (let i = 0; i < lines.length; i++) lines[i].ln.material.opacity = 0.1 + 0.13 * (0.5 + 0.5 * Math.sin(t * 1.6 + i));
      },
      dispose() {
        lines.forEach(o => {
          o.g.dispose();
          o.ln.material.dispose();
        });
      }
    };
  },
  // ── About: a slowly turning globe of connected nodes — the community network ──
  community(THREE, scene, camera, col) {
    camera.position.set(0, 0, 12);
    const N = 150,
      V = [],
      gr = Math.PI * (1 + Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const ph = Math.acos(1 - 2 * (i + 0.5) / N),
        th = gr * i,
        r = 5;
      V.push(new THREE.Vector3(r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)));
    }
    const pGeo = new THREE.BufferGeometry().setFromPoints(V);
    const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: col,
      size: 0.15,
      transparent: true,
      opacity: 0.95
    }));
    const seg = [];
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) if (V[i].distanceTo(V[j]) < 1.95) seg.push(V[i], V[j]);
    const lGeo = new THREE.BufferGeometry().setFromPoints(seg);
    const lines = new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({
      color: col,
      transparent: true,
      opacity: 0.16
    }));
    const g = new THREE.Group();
    g.add(pts);
    g.add(lines);
    scene.add(g);
    return {
      update(t, s) {
        g.rotation.y = t * 0.1 + s.mx * 0.5;
        g.rotation.x = s.my * 0.4 + Math.sin(t * 0.15) * 0.05;
      },
      dispose() {
        pGeo.dispose();
        lGeo.dispose();
        pts.material.dispose();
        lines.material.dispose();
      }
    };
  }
};
function ThreeScene({
  accent = "#1f8a82",
  type = "field",
  style
}) {
  const ref = useRef(null);
  useEffect(() => {
    const THREE = window.THREE,
      host = ref.current;
    if (!THREE || !host) return;
    let w = host.clientWidth,
      h = host.clientHeight || 460,
      raf = 0,
      running = true;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(w, h);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    const col = new THREE.Color(accent);
    const state = {
      mx: 0,
      my: 0,
      tx: 0,
      ty: 0
    };
    const onMove = e => {
      const r = host.getBoundingClientRect();
      state.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      state.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    host.addEventListener("pointermove", onMove, {
      passive: true
    });
    const api = (SCENES[type] || SCENES.field)(THREE, scene, camera, col);
    const start = performance.now();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      // skip work when the panel is scrolled out of view (cheap rect check)
      const r = host.getBoundingClientRect();
      if (r.bottom < -40 || r.top > (window.innerHeight || 800) + 40) return;
      const t = (performance.now() - start) / 1000;
      state.mx += (state.tx - state.mx) * 0.06;
      state.my += (state.ty - state.my) * 0.06;
      api.update(t, state);
      renderer.render(scene, camera);
    };
    tick();
    const onResize = () => {
      w = host.clientWidth;
      h = host.clientHeight || 460;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        running = false;
      } else if (!running) {
        running = true;
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      host.removeEventListener("pointermove", onMove);
      api.dispose && api.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [accent, type]);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: "absolute",
      inset: 0,
      ...style
    }
  });
}
window.ThreeScene = ThreeScene;
window.ThreeHero = ThreeScene; // back-compat alias
})(); } catch (e) { __ds_ns.__errors.push({ path: "site/lib/three-hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/handtalk/HandTalk.jsx
try { (() => {
// HandTalk — live two-person meeting (signer ↔ speaker) over the same shell.
const {
  useState,
  useRef,
  useEffect
} = React;
const DS = window.TogetherDesignSystem_58a58f;
const {
  Button,
  Card,
  Badge,
  Avatar,
  Pill
} = DS;
const I = window.TIcons;

// Alternating captions: signer signs (→ text), speaker talks (→ sign + text).
const STREAM = [{
  who: "speaker",
  name: "Omar",
  en: "Hi Mariam, can you see the slides?",
  gloss: "SLIDES YOU SEE?"
}, {
  who: "signer",
  name: "You",
  en: "Yes, clearly. Let's begin.",
  gloss: "YES CLEAR. BEGIN."
}, {
  who: "speaker",
  name: "Omar",
  en: "Great — I'll share the budget first.",
  gloss: "BUDGET FIRST SHARE."
}, {
  who: "signer",
  name: "You",
  en: "Sounds good, go ahead.",
  gloss: "GOOD. GO."
}];
function Landmarks() {
  const pts = [[50, 40], [46, 48], [43, 56], [55, 46], [57, 56], [60, 46], [62, 56], [64, 47], [66, 56]];
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 100 100",
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      opacity: .9
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M50 40 46 48 43 56M50 40 55 46 57 56M50 40 60 46 62 56M50 40 64 47 66 56",
    stroke: "var(--teal)",
    strokeWidth: ".5",
    fill: "none",
    opacity: ".5"
  }), pts.map((p, i) => /*#__PURE__*/React.createElement("circle", {
    key: i,
    cx: p[0],
    cy: p[1],
    r: "1.1",
    fill: "var(--live)",
    style: {
      animation: `t-pulse 1.4s ${i * .06}s infinite`
    }
  })));
}
function Tile({
  role,
  name,
  sub,
  active,
  caption,
  camera
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      background: "var(--viewport)",
      border: `1px solid ${active ? "var(--teal)" : "var(--border)"}`,
      minHeight: 300,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: active ? "0 0 0 3px var(--accent-soft)" : "none",
      transition: "all .3s"
    }
  }, role === "signer" && camera && /*#__PURE__*/React.createElement(Landmarks, null), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12
    }
  }, camera ? /*#__PURE__*/React.createElement(Avatar, {
    name: name,
    size: 84
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: 84,
      height: 84,
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      background: "var(--surface-2)",
      color: "var(--faint)"
    }
  }, /*#__PURE__*/React.createElement(I.videoOff, {
    size: 30
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 12,
      insetInlineStart: 12,
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: "5px 11px",
      borderRadius: 999,
      background: "rgba(8,8,12,.62)",
      color: "#fff",
      fontSize: 11.5,
      fontWeight: 650
    }
  }, /*#__PURE__*/React.createElement(I.hand, {
    size: 13,
    style: {
      color: role === "signer" ? "var(--live)" : "var(--sand)"
    }
  }), " ", name, " \xB7 ", sub), active && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 12,
      insetInlineEnd: 12,
      width: 9,
      height: 9,
      borderRadius: "50%",
      background: "var(--live)",
      boxShadow: "0 0 0 3px var(--live-soft)",
      animation: "t-pulse 1.4s infinite"
    }
  }), caption && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 12,
      right: 12,
      bottom: 12,
      padding: "10px 14px",
      borderRadius: 12,
      background: "rgba(8,8,12,.74)",
      backdropFilter: "blur(8px)",
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      letterSpacing: ".12em",
      color: "var(--live)",
      textTransform: "uppercase",
      marginBottom: 4
    }
  }, role === "signer" ? "sign → text" : "speech → sign · " + caption.gloss), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 500,
      lineHeight: 1.4
    }
  }, caption.en)));
}
function HandTalk() {
  const [phase, setPhase] = useState("lobby"); // lobby | connecting | live
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [captions, setCaptions] = useState(true);
  const [i, setI] = useState(-1);
  const tick = useRef(null);
  const join = () => {
    setPhase("connecting");
    setTimeout(() => {
      setPhase("live");
      setI(0);
    }, 1600);
  };
  useEffect(() => {
    if (phase !== "live") return;
    tick.current = setInterval(() => setI(n => (n + 1) % STREAM.length), 2600);
    return () => clearInterval(tick.current);
  }, [phase]);
  const cur = i >= 0 ? STREAM[i] : null;
  const signerCap = captions && cur && cur.who === "signer" ? cur : null;
  const speakerCap = captions && cur && cur.who === "speaker" ? cur : null;
  const statusMap = {
    lobby: "idle",
    connecting: "connecting",
    live: "live"
  };
  const labelMap = {
    lobby: "Not connected",
    connecting: "Connecting…",
    live: "Live · 2 in room"
  };
  return /*#__PURE__*/React.createElement(window.AppShell, {
    active: "HandTalk",
    title: "HandTalk",
    sub: "Live meeting \xB7 signer \u2194 speaker, translated both ways",
    status: statusMap[phase],
    statusLabel: labelMap[phase]
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "26px 32px"
    }
  }, phase === "lobby" ? /*#__PURE__*/React.createElement(Card, {
    variant: "solid",
    padding: 0,
    style: {
      overflow: "hidden",
      maxWidth: 760,
      margin: "10px auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--ink)",
      color: "#fff",
      padding: "44px 40px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 34,
      letterSpacing: "-.03em"
    }
  }, "Room \xB7 clinic-204"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(255,255,255,.6)",
      marginTop: 10,
      fontSize: 15
    }
  }, "A signer and a speaker, understood in both directions \u2014 live captions and sign guidance per role.")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 28,
      display: "flex",
      gap: 16,
      alignItems: "center",
      flexWrap: "wrap",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Mariam Adel",
    size: 40
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 650,
      color: "var(--text)"
    }
  }, "You"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--faint)"
    }
  }, "Signer \xB7 ESL"))), /*#__PURE__*/React.createElement(I.plus, {
    size: 18,
    style: {
      color: "var(--faint)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Omar",
    size: 40,
    style: {
      background: "var(--sand)"
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 650,
      color: "var(--text)"
    }
  }, "Omar"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--faint)"
    }
  }, "Speaker \xB7 Arabic"))), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "lg",
    style: {
      marginInlineStart: "auto"
    },
    iconLeft: /*#__PURE__*/React.createElement(I.video, {
      size: 16
    }),
    onClick: join
  }, "Join meeting"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 18
    },
    className: "ht-grid"
  }, /*#__PURE__*/React.createElement(Tile, {
    role: "signer",
    name: "You",
    sub: "Signer \xB7 ESL",
    active: phase === "live" && cur && cur.who === "signer",
    caption: signerCap,
    camera: cam
  }), /*#__PURE__*/React.createElement(Tile, {
    role: "speaker",
    name: "Omar",
    sub: "Speaker \xB7 Arabic",
    active: phase === "live" && cur && cur.who === "speaker",
    caption: speakerCap,
    camera: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      marginTop: 20,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(CtrlBtn, {
    on: mic,
    onIcon: /*#__PURE__*/React.createElement(I.mic, {
      size: 18
    }),
    offIcon: /*#__PURE__*/React.createElement(I.micOff, {
      size: 18
    }),
    onClick: () => setMic(v => !v),
    label: "Mic"
  }), /*#__PURE__*/React.createElement(CtrlBtn, {
    on: cam,
    onIcon: /*#__PURE__*/React.createElement(I.video, {
      size: 18
    }),
    offIcon: /*#__PURE__*/React.createElement(I.videoOff, {
      size: 18
    }),
    onClick: () => setCam(v => !v),
    label: "Camera"
  }), /*#__PURE__*/React.createElement(CtrlBtn, {
    on: captions,
    onIcon: /*#__PURE__*/React.createElement(I.captions, {
      size: 18
    }),
    offIcon: /*#__PURE__*/React.createElement(I.captions, {
      size: 18
    }),
    onClick: () => setCaptions(v => !v),
    label: "Captions"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setPhase("lobby");
      setI(-1);
    },
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      border: "none",
      cursor: "pointer",
      padding: "11px 20px",
      borderRadius: 999,
      background: "var(--danger)",
      color: "#fff",
      fontFamily: "var(--font-sans)",
      fontWeight: 650,
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement(I.phone, {
    size: 17,
    style: {
      transform: "rotate(135deg)"
    }
  }), " Leave")))), /*#__PURE__*/React.createElement("style", null, `@keyframes t-pulse{50%{opacity:.4}}@media(max-width:1080px){.ht-grid{grid-template-columns:1fr!important}}`));
}
function CtrlBtn({
  on,
  onIcon,
  offIcon,
  onClick,
  label
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    title: label,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 48,
      height: 48,
      borderRadius: "50%",
      cursor: "pointer",
      border: "1px solid var(--border)",
      background: on ? "var(--surface-2)" : "var(--danger-soft)",
      color: on ? "var(--text)" : "var(--danger)",
      transition: "all .2s"
    }
  }, on ? onIcon : offIcon);
}
window.HandTalk = HandTalk;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/handtalk/HandTalk.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lib/AppShell.jsx
try { (() => {
// Shared dashboard shell for the three product UI kits (SignLens, SignBridge, HandTalk).
// Sidebar + topbar, composed from DS primitives. Exposes window.AppShell.
const DS = window.TogetherDesignSystem_58a58f;
const {
  Logo,
  NavItem,
  Avatar,
  ThemeToggle,
  Pill
} = DS;
const TI = window.TIcons;
const NAV = [{
  k: "Overview",
  icon: TI.dashboard,
  href: "#"
}, {
  k: "SignLens",
  icon: TI.camera,
  href: "../signlens/index.html"
}, {
  k: "SignBridge",
  icon: TI.hand,
  href: "../signbridge/index.html"
}, {
  k: "HandTalk",
  icon: TI.video,
  href: "../handtalk/index.html"
}, {
  k: "History",
  icon: TI.history,
  href: "#",
  dot: true
}, {
  k: "Settings",
  icon: TI.settings,
  href: "#"
}];
function AppShell({
  active,
  title,
  sub,
  status,
  statusLabel = "Live meeting ready",
  actions,
  children
}) {
  const [theme, setTheme] = React.useState("dark");
  React.useEffect(() => {
    const el = document.getElementById("app-root");
    if (el) el.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return /*#__PURE__*/React.createElement("div", {
    id: "app-root",
    className: `t-scope ${theme === "dark" ? "dark" : ""}`,
    style: {
      minHeight: "100vh",
      background: "var(--bg)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "256px 1fr",
      minHeight: "100vh"
    },
    className: "app-grid"
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      background: "var(--sidebar)",
      borderInlineEnd: "1px solid var(--border)",
      padding: "24px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 4
    },
    className: "app-side"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "2px 6px 22px"
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 32
  })), NAV.map(n => /*#__PURE__*/React.createElement(NavItem, {
    key: n.k,
    href: n.href,
    active: n.k === active,
    dot: n.dot,
    icon: /*#__PURE__*/React.createElement(n.icon, {
      size: 19
    })
  }, n.k)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      padding: 11,
      borderRadius: "var(--radius)",
      border: "1px solid var(--border)",
      background: "var(--surface-solid)"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Mariam Adel",
    size: 34
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 650,
      color: "var(--text)"
    }
  }, "Mariam Adel"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--faint)"
    }
  }, "Cairo \xB7 ESL")))), /*#__PURE__*/React.createElement("main", {
    style: {
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      padding: "20px 32px",
      borderBottom: "1px solid var(--border)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: "-.02em",
      color: "var(--text)"
    }
  }, title), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--faint)",
      marginTop: 2
    }
  }, sub)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      flexWrap: "wrap"
    }
  }, status && /*#__PURE__*/React.createElement(Pill, {
    state: status
  }, statusLabel), actions, /*#__PURE__*/React.createElement(ThemeToggle, {
    value: theme,
    onChange: setTheme
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, children))), /*#__PURE__*/React.createElement("style", null, `@media (max-width:900px){.app-grid{grid-template-columns:1fr!important}.app-side{flex-direction:row;align-items:center;overflow-x:auto;padding:12px!important}.app-side > div:first-child{padding:0 8px 0 0!important}.app-side > div:last-child,.app-side > div:nth-last-child(2){display:none}}`));
}
window.AppShell = AppShell;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lib/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lib/icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Lucide-matched icon set (the brand uses lucide-react). 24×24, 1.8 stroke,
// round caps/joins. Exposed on window so every UI kit can share them.
const React = window.React;
function Icon({
  d,
  size = 20,
  stroke = 1.8,
  fill = "none",
  style,
  children
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: fill,
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: style,
    "aria-hidden": "true"
  }, children || d && /*#__PURE__*/React.createElement("path", {
    d: d
  }));
}
const P = d => props => /*#__PURE__*/React.createElement(Icon, props, Array.isArray(d) ? d.map((x, i) => /*#__PURE__*/React.createElement("path", {
  key: i,
  d: x
})) : /*#__PURE__*/React.createElement("path", {
  d: d
}));
const Icons = {
  arrowRight: P("M5 12h14M12 5l7 7-7 7"),
  arrowLeft: P("M19 12H5M12 19l-7-7 7-7"),
  fileText: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 2v6h6M16 13H8M16 17H8M10 9H8"
  })),
  volume: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M11 5 6 9H2v6h4l5 4z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
  })),
  hand: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"
  })),
  captions: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "5",
    width: "18",
    height: "14",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 12a2 2 0 0 1 2-2M13 12a2 2 0 0 1 2-2M9 14a2 2 0 0 0 2-2M15 14a2 2 0 0 0 2-2"
  })),
  video: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "6",
    width: "14",
    height: "12",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m16 10 6-3v10l-6-3"
  })),
  videoOff: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M10.66 6H14a2 2 0 0 1 2 2v2.34l1 1L22 8v8M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2l10 10ZM2 2l20 20"
  })),
  menu: P("M4 6h16M4 12h16M4 18h16"),
  x: P("M18 6 6 18M6 6l12 12"),
  languages: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"
  })),
  dashboard: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "3",
    width: "7",
    height: "9",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "3",
    width: "7",
    height: "5",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "12",
    width: "7",
    height: "9",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "16",
    width: "7",
    height: "5",
    rx: "1"
  })),
  history: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M3 12a9 9 0 1 0 3-6.7L3 8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 3v5h5M12 7v5l3 2"
  })),
  settings: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
  })),
  sparkles: P(["M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z", "M19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8z"]),
  audio: P("M2 10v4M6 6v12M10 3v18M14 8v8M18 5v14M22 10v4"),
  mic: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
    x: "9",
    y: "2",
    width: "6",
    height: "12",
    rx: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 10a7 7 0 0 0 14 0M12 17v5"
  })),
  micOff: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6M5 10a7 7 0 0 0 10.79 5.93M19 10a7 7 0 0 1-.11 1.23M12 19v3M2 2l20 20"
  })),
  type: P(["M4 7V5h16v2", "M9 19h6", "M12 5v14"]),
  play: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 4l14 8-14 8z"
  })),
  pause: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "6",
    y: "4",
    width: "4",
    height: "16",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "4",
    width: "4",
    height: "16",
    rx: "1"
  })),
  camera: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "13",
    r: "4"
  })),
  copy: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
    x: "9",
    y: "9",
    width: "13",
    height: "13",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
  })),
  check: P("M20 6 9 17l-5-5"),
  send: P(["M22 2 11 13", "M22 2 15 22l-4-9-9-4z"]),
  search: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4.3-4.3"
  })),
  chevronDown: P("M6 9l6 6 6-6"),
  users: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "7",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
  })),
  building: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
    x: "4",
    y: "2",
    width: "16",
    height: "20",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 22v-4h6v4M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01"
  })),
  graduation: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M22 10 12 5 2 10l10 5 10-5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 12v5c0 1 2 3 6 3s6-2 6-3v-5"
  })),
  broadcast: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14"
  })),
  plus: P("M12 5v14M5 12h14"),
  phone: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1z"
  })),
  sun: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
  })),
  moon: P("M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"),
  monitor: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "3",
    width: "20",
    height: "14",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 21h8M12 17v4"
  })),
  gauge: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M12 14l4-4M3.34 19a10 10 0 1 1 17.32 0"
  })),
  rotate: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M3 12a9 9 0 1 0 9-9 9.7 9.7 0 0 0-6.7 2.7L3 8M3 3v5h5"
  })),
  download: P(["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"]),
  logout: P(["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"])
};
window.TIcons = Icons;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lib/icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/LandingPage.jsx
try { (() => {
// Together — marketing landing page recreation.
// Composes design-system primitives (Button, Card, Logo, Badge) + shared icons.
const {
  useState,
  useRef
} = React;
const DS = window.TogetherDesignSystem_58a58f;
const {
  Button,
  Card,
  Logo,
  Badge
} = DS;
const I = window.TIcons;
const FONT_D = "'Bricolage Grotesque', serif";
const mono = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: ".22em",
  color: "var(--muted)"
};
const features = [{
  icon: I.fileText,
  title: "Sign to text",
  tag: "MODE 01",
  span: 3,
  desc: "Turn Egyptian Sign Language into clean Arabic or English captions in real time."
}, {
  icon: I.volume,
  title: "Sign to speech",
  tag: "MODE 02",
  span: 3,
  desc: "Speak signed messages aloud with a natural voice — for counters, clinics, classrooms, and daily life."
}, {
  icon: I.hand,
  title: "Speech to sign",
  tag: "MODE 03",
  span: 2,
  desc: "Convert spoken Arabic or English into guided sign output for two-way conversations."
}, {
  icon: I.captions,
  title: "Text to sign",
  tag: "MODE 04",
  span: 2,
  desc: "Type a phrase and watch it become structured sign guidance that is easy to follow."
}, {
  icon: I.video,
  title: "Live meetings",
  tag: "MODE 05",
  span: 2,
  desc: "Add translation overlays to calls so everyone can follow the room without waiting."
}];
const fieldNotes = [{
  n: "N.001",
  date: "12 · MAY · 26",
  title: "On hands as a first language",
  body: "Captions are not an afterthought. We design the signing space first, then let text and voice follow its rhythm."
}, {
  n: "N.002",
  date: "28 · MAY · 26",
  title: "Arabic, written right to left",
  body: "Egyptian signing and Arabic script share a room here — every layout respects direction, diacritics, and tone."
}, {
  n: "N.003",
  date: "09 · JUN · 26",
  title: "Silence is a setting, not a wall",
  body: "A meeting overlay should disappear into the conversation. The best translation is the one nobody has to wait for."
}];
function FeatureCard({
  f
}) {
  const [hover, setHover] = useState(false);
  const Ic = f.icon;
  return /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      gridColumn: `span ${f.span}`,
      position: "relative",
      overflow: "hidden",
      borderRadius: "var(--radius-2xl)",
      border: "1px solid var(--glass-border)",
      background: "var(--glass-bg)",
      backdropFilter: "blur(var(--blur))",
      boxShadow: "var(--shadow-glass)",
      padding: 28,
      minHeight: 188,
      transform: hover ? "translateY(-4px)" : "none",
      transition: "transform .3s var(--ease-out-expo)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "var(--ink)",
      transform: hover ? "translateY(0)" : "translateY(101%)",
      transition: "transform .5s var(--ease-inout)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      color: hover ? "#fff" : "var(--text)",
      transition: "color .3s",
      height: "100%",
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 36
    }
  }, /*#__PURE__*/React.createElement(Ic, {
    size: 24,
    stroke: 1.5,
    style: {
      color: hover ? "#fff" : "var(--muted)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: ".2em",
      color: hover ? "rgba(255,255,255,.5)" : "var(--faint)"
    }
  }, f.tag)), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: 24,
      letterSpacing: "-.025em",
      margin: 0
    }
  }, f.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      lineHeight: 1.6,
      marginTop: 10,
      color: hover ? "rgba(255,255,255,.65)" : "var(--muted)"
    }
  }, f.desc)));
}
function Marquee({
  items,
  reverse
}) {
  const seq = [...items, ...items, ...items];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: "hidden",
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      gap: 48,
      animation: `t-marq 26s linear infinite ${reverse ? "reverse" : ""}`
    }
  }, seq.map((it, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: 22,
      letterSpacing: "-.02em",
      color: "var(--text)",
      display: "inline-flex",
      alignItems: "center",
      gap: 48
    }
  }, it, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--teal)"
    }
  }, "\u2726")))), /*#__PURE__*/React.createElement("style", null, `@keyframes t-marq{to{transform:translateX(-33.33%)}}`));
}
function Section({
  id,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("section", {
    id: id,
    style: {
      padding: "96px 24px",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: "0 auto"
    }
  }, children));
}
function LandingPage() {
  const [menu, setMenu] = useState(false);
  return /*#__PURE__*/React.createElement("div", {
    className: "t-scope",
    style: {
      minHeight: "100vh",
      overflowX: "hidden",
      color: "var(--text)",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: -1,
      background: "radial-gradient(circle at 15% 10%, #fff, transparent 28%), radial-gradient(circle at 80% 20%, rgba(230,234,238,.75), transparent 30%), linear-gradient(180deg,#f8f8f6,#ececea)"
    }
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      position: "fixed",
      left: 0,
      right: 0,
      top: 0,
      zIndex: 50,
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: "0 auto",
      height: 56,
      borderRadius: 999,
      background: "var(--glass-bg-2)",
      border: "1px solid var(--glass-border)",
      backdropFilter: "blur(var(--blur))",
      boxShadow: "var(--shadow-glass)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 12px 0 18px"
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 32
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 28,
      fontSize: 14,
      color: "var(--muted)"
    },
    className: "lp-nav-links"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#features",
    style: {
      color: "inherit",
      textDecoration: "none"
    }
  }, "Features"), /*#__PURE__*/React.createElement("a", {
    href: "#language",
    style: {
      color: "inherit",
      textDecoration: "none"
    }
  }, "Arabic + ESL"), /*#__PURE__*/React.createElement("a", {
    href: "#notes",
    style: {
      color: "inherit",
      textDecoration: "none"
    }
  }, "Field notes")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    style: {
      borderRadius: 999,
      padding: "9px 18px"
    }
  }, "Open dashboard"))), /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "112px 24px 60px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lp-hero-ink",
    style: {
      position: "absolute",
      right: 0,
      top: 0,
      height: "100%",
      width: "46%",
      background: "#050505",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "radial-gradient(circle at 60% 40%, rgba(31,138,130,.25), transparent 55%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      backgroundImage: "radial-gradient(rgba(255,255,255,.12) 1px, transparent 1px)",
      backgroundSize: "26px 26px",
      maskImage: "radial-gradient(circle at 60% 45%, #000, transparent 70%)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 2,
      maxWidth: 1180,
      margin: "0 auto",
      width: "100%",
      display: "grid",
      gridTemplateColumns: "1.05fr .95fr",
      gap: 40,
      alignItems: "center"
    },
    className: "lp-hero-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      display: "inline-flex",
      borderRadius: 999,
      border: "1px solid var(--border)",
      background: "var(--glass-bg)",
      padding: "8px 16px",
      backdropFilter: "blur(12px)"
    }
  }, "Built for Arabic conversations"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--faint)"
    },
    className: "lp-coords"
  }, "30.0444\xB0 N, 31.2357\xB0 E")), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: "clamp(52px, 8vw, 104px)",
      lineHeight: .9,
      letterSpacing: "-.045em",
      margin: 0,
      maxWidth: 760
    }
  }, "Sign, speak, read \u2014 together."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 28,
      maxWidth: 520,
      fontSize: 19,
      lineHeight: 1.55,
      color: "var(--muted)"
    }
  }, "A minimal translation layer for Egyptian Sign Language and Arabic: from hands to text, voice to signs, and meetings where nobody is left outside the conversation."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 36
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    style: {
      borderRadius: 999
    },
    iconRight: /*#__PURE__*/React.createElement(I.arrowRight, {
      size: 16
    })
  }, "Launch dashboard"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "lg",
    style: {
      borderRadius: 999
    }
  }, "Explore five modes"))), /*#__PURE__*/React.createElement("div", {
    className: "lp-hero-card",
    style: {
      marginInlineStart: "auto",
      maxWidth: 380,
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "glass",
    padding: 20
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 24,
      background: "#070707",
      padding: 22,
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    light: true,
    size: 30
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 56,
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "rgba(255,255,255,.45)"
    }
  }, "Live translation"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: 40,
      letterSpacing: "-.03em"
    }
  }, "\u0625\u0632\u064A\u0643\u061F"), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,.12)",
      background: "rgba(255,255,255,.08)",
      padding: 14,
      fontSize: 14,
      color: "rgba(255,255,255,.78)",
      backdropFilter: "blur(12px)"
    }
  }, "How are you?"))))))), /*#__PURE__*/React.createElement("section", {
    style: {
      borderTop: "1px solid var(--border)",
      borderBottom: "1px solid var(--border)",
      background: "rgba(255,255,255,.3)",
      backdropFilter: "blur(var(--blur))",
      padding: "30px 0"
    }
  }, /*#__PURE__*/React.createElement(Marquee, {
    items: ["SIGN → TEXT", "SIGN → SPEECH", "SPEECH → SIGN", "TEXT → SIGN", "LIVE MEETINGS", "العربية"]
  })), /*#__PURE__*/React.createElement(Section, {
    id: "features"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560,
      marginBottom: 56,
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: mono
  }, "( 01 ) \u2014 Five translation modes"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: "clamp(40px,5vw,72px)",
      lineHeight: 1,
      letterSpacing: "-.04em",
      margin: 0
    }
  }, "One interface for every direction.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(6,1fr)",
      gap: 16
    },
    className: "lp-feat-grid"
  }, features.map(f => /*#__PURE__*/React.createElement(FeatureCard, {
    key: f.title,
    f: f
  })))), /*#__PURE__*/React.createElement(Section, {
    id: "language",
    style: {
      paddingTop: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: ".9fr 1.1fr",
      gap: 24
    },
    className: "lp-lang-grid"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: mono
  }, "( 02 ) \u2014 Language first"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: "clamp(36px,4.5vw,60px)",
      lineHeight: 1,
      letterSpacing: "-.04em",
      margin: 0
    }
  }, "Designed for Arabic and Egyptian Sign Language.")), /*#__PURE__*/React.createElement(Card, {
    variant: "glass",
    padding: 40
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 24,
      background: "var(--ink)",
      padding: 24,
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: "rgba(255,255,255,.5)",
      margin: 0
    }
  }, "Arabic output"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: 40,
      margin: "32px 0 0"
    }
  }, "\u0645\u0631\u062D\u0628\u0627\u064B")), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 24,
      border: "1px solid var(--border)",
      background: "var(--glass-bg-2)",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--muted)",
      margin: 0
    }
  }, "Egyptian Sign Language"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: 40,
      letterSpacing: "-.03em",
      margin: "32px 0 0"
    }
  }, "ESL"))), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 24,
      fontSize: 14,
      lineHeight: 1.7,
      color: "var(--muted)"
    }
  }, "Together treats language support as a first-class product choice, not a footnote \u2014 Arabic text, Arabic speech, and Egyptian signing contexts sit at the center of the experience.")))), /*#__PURE__*/React.createElement(Section, {
    id: "notes",
    style: {
      paddingTop: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 16,
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: mono
  }, "( 03 ) \u2014 Field notes, unfiltered"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: "clamp(40px,5vw,72px)",
      lineHeight: 1,
      letterSpacing: "-.04em",
      margin: 0
    }
  }, "From the studio.")), /*#__PURE__*/React.createElement("span", {
    style: mono
  }, "A column on accessible design")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 1,
      background: "var(--border)",
      borderRadius: 32,
      overflow: "hidden",
      border: "1px solid var(--border)"
    },
    className: "lp-notes-grid"
  }, fieldNotes.map(n => /*#__PURE__*/React.createElement("div", {
    key: n.n,
    style: {
      background: "var(--glass-bg-2)",
      backdropFilter: "blur(var(--blur))",
      padding: 32,
      minHeight: 256,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--muted)"
    }
  }, /*#__PURE__*/React.createElement("span", null, n.n), /*#__PURE__*/React.createElement("span", null, n.date)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: 24,
      lineHeight: 1.1,
      letterSpacing: "-.02em",
      margin: 0
    }
  }, n.title), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 16,
      fontSize: 14,
      lineHeight: 1.6,
      color: "var(--muted)"
    }
  }, n.body)))))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: "#050505",
      color: "#fff",
      padding: "96px 24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 720,
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      color: "rgba(255,255,255,.35)"
    }
  }, "( 04 ) \u2014 Simple workflow"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: "clamp(40px,5vw,72px)",
      lineHeight: 1,
      letterSpacing: "-.04em",
      margin: 0
    }
  }, "Capture the intent. Choose the output. Share it instantly.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 56,
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 1,
      background: "rgba(255,255,255,.1)",
      border: "1px solid rgba(255,255,255,.1)",
      borderRadius: 32,
      overflow: "hidden"
    },
    className: "lp-flow-grid"
  }, ["Camera, microphone, or text input", "Arabic / English processing", "Text, speech, sign guide, or meeting captions"].map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: s,
    style: {
      background: "rgba(255,255,255,.03)",
      padding: 32,
      minHeight: 192
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "rgba(255,255,255,.3)"
    }
  }, "0", i + 1), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 56,
      fontSize: 20,
      fontWeight: 500
    }
  }, s)))))), /*#__PURE__*/React.createElement(Section, {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: FONT_D,
      fontWeight: 600,
      fontSize: "clamp(52px,8vw,104px)",
      lineHeight: .9,
      letterSpacing: "-.05em",
      margin: "0 auto",
      maxWidth: 900
    }
  }, "Make every room accessible."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 36,
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    style: {
      borderRadius: 999
    },
    iconRight: /*#__PURE__*/React.createElement(I.arrowRight, {
      size: 16
    })
  }, "Open the dashboard"))), /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: "1px solid var(--border)",
      padding: "40px 24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: "0 auto",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 32
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 11
    }
  }, "\xA9 2026 Together \u2014 Cairo \xB7 Alexandria"))), /*#__PURE__*/React.createElement("style", null, `
        @media (max-width: 900px){
          .lp-nav-links,.lp-coords,.lp-hero-ink{display:none!important}
          .lp-hero-grid,.lp-lang-grid{grid-template-columns:1fr!important}
          .lp-feat-grid,.lp-notes-grid,.lp-flow-grid{grid-template-columns:1fr!important}
          .lp-feat-grid > div{grid-column:span 1!important}
          .lp-hero-card{margin:32px 0 0!important}
        }
      `));
}
window.LandingPage = LandingPage;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/LandingPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/signbridge/SignBridge.jsx
try { (() => {
// SignBridge — Text & Speech → Sign workspace.
const {
  useState,
  useRef,
  useEffect
} = React;
const DS = window.TogetherDesignSystem_58a58f;
const {
  Button,
  Card,
  Badge,
  Segmented,
  Input
} = DS;
const I = window.TIcons;

// naive sentence → Topic-Comment gloss (demo presets + fallback tokenizer)
const PRESETS = {
  "How are you?": ["YOU", "HOW"],
  "I need help": ["HELP", "ME", "NEED"],
  "Thank you very much": ["THANK-YOU", "MUCH"],
  "Where is the clinic?": ["CLINIC", "WHERE"]
};
const STOP = new Set(["the", "a", "an", "is", "are", "to", "of", "and"]);
function toGloss(text) {
  const key = Object.keys(PRESETS).find(k => k.toLowerCase() === text.trim().toLowerCase());
  if (key) return PRESETS[key];
  return text.trim().toUpperCase().replace(/[^\wء-ي\s]/g, "").split(/\s+/).filter(w => w && !STOP.has(w.toLowerCase())).slice(0, 8);
}

// Abstract pose figure — shifts stance per frame to imply signing motion.
function PoseAvatar({
  frame,
  playing
}) {
  const poses = [{
    la: -20,
    ra: 20,
    h: 0
  }, {
    la: -55,
    ra: 50,
    h: -3
  }, {
    la: -35,
    ra: 70,
    h: 2
  }, {
    la: -70,
    ra: 35,
    h: -2
  }, {
    la: -25,
    ra: 25,
    h: 0
  }];
  const p = poses[frame % poses.length];
  const T = "transform .5s cubic-bezier(.16,1,.3,1)";
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 200 220",
    style: {
      width: 200,
      height: 220
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "lim",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: "var(--teal)"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "var(--teal-strong)"
  }))), /*#__PURE__*/React.createElement("circle", {
    cx: "100",
    cy: 42 + p.h,
    r: "20",
    fill: "url(#lim)",
    style: {
      transition: T
    }
  }), /*#__PURE__*/React.createElement("rect", {
    x: "82",
    y: "64",
    width: "36",
    height: "62",
    rx: "16",
    fill: "var(--teal)",
    opacity: ".85"
  }), /*#__PURE__*/React.createElement("g", {
    style: {
      transformOrigin: "82px 78px",
      transform: `rotate(${p.la}deg)`,
      transition: T
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "58",
    y: "74",
    width: "30",
    height: "11",
    rx: "5.5",
    fill: "url(#lim)"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "58",
    cy: "79",
    r: "7",
    fill: "var(--live)",
    style: {
      filter: playing ? "drop-shadow(0 0 6px var(--live))" : "none"
    }
  })), /*#__PURE__*/React.createElement("g", {
    style: {
      transformOrigin: "118px 78px",
      transform: `rotate(${p.ra}deg)`,
      transition: T
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "112",
    y: "74",
    width: "30",
    height: "11",
    rx: "5.5",
    fill: "url(#lim)"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "142",
    cy: "79",
    r: "7",
    fill: "var(--live)",
    style: {
      filter: playing ? "drop-shadow(0 0 6px var(--live))" : "none"
    }
  })));
}
function SignBridge() {
  const [src, setSrc] = useState("text");
  const [text, setText] = useState("How are you?");
  const [gloss, setGloss] = useState(["YOU", "HOW"]);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState("1");
  const [listening, setListening] = useState(false);
  const timer = useRef(null);
  useEffect(() => {
    if (!playing || gloss.length === 0) return;
    const ms = 900 / parseFloat(speed);
    timer.current = setInterval(() => {
      setFrame(f => {
        if (f + 1 >= gloss.length) {
          setPlaying(false);
          return f;
        }
        return f + 1;
      });
    }, ms);
    return () => clearInterval(timer.current);
  }, [playing, speed, gloss]);
  const translate = t => {
    const g = toGloss(t || text);
    setGloss(g);
    setFrame(0);
    setPlaying(g.length > 0);
  };
  const current = gloss[frame] || "—";
  return /*#__PURE__*/React.createElement(window.AppShell, {
    active: "SignBridge",
    title: "SignBridge",
    sub: "Text & Speech \u2192 Sign \xB7 Egyptian Sign Language guidance",
    status: playing ? "live" : "idle",
    statusLabel: playing ? "Signing" : "Ready",
    actions: /*#__PURE__*/React.createElement(Segmented, {
      value: src,
      onChange: setSrc,
      options: [{
        value: "text",
        label: "Text",
        icon: /*#__PURE__*/React.createElement(I.type, {
          size: 14
        })
      }, {
        value: "speech",
        label: "Speech",
        icon: /*#__PURE__*/React.createElement(I.mic, {
          size: 14
        })
      }]
    })
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "26px 32px",
      display: "grid",
      gridTemplateColumns: "360px 1fr",
      gap: 22,
      alignItems: "start"
    },
    className: "sb-content"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "solid",
    padding: 18
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: ".07em",
      textTransform: "uppercase",
      color: "var(--faint)",
      marginBottom: 12
    }
  }, src === "text" ? "Type a phrase" : "Speak a phrase"), src === "text" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("textarea", {
    value: text,
    onChange: e => setText(e.target.value),
    rows: 3,
    style: {
      width: "100%",
      resize: "none",
      padding: "11px 13px",
      borderRadius: "var(--radius)",
      border: "1px solid var(--border)",
      background: "var(--surface-2)",
      color: "var(--text)",
      fontFamily: "var(--font-sans)",
      fontSize: 15,
      outline: "none",
      boxSizing: "border-box"
    },
    placeholder: "Type Arabic or English\u2026"
  }), /*#__PURE__*/React.createElement(Button, {
    block: true,
    variant: "accent",
    style: {
      marginTop: 12
    },
    iconLeft: /*#__PURE__*/React.createElement(I.hand, {
      size: 15
    }),
    onClick: () => translate()
  }, "Translate to sign")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 14,
      padding: "10px 0 4px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setListening(v => !v);
      if (!listening) setTimeout(() => {
        setListening(false);
        setText("I need help");
        translate("I need help");
      }, 1800);
    },
    style: {
      width: 72,
      height: 72,
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      display: "grid",
      placeItems: "center",
      color: "#fff",
      background: listening ? "var(--danger)" : "var(--accent)",
      boxShadow: listening ? "0 0 0 8px var(--danger-soft)" : "0 0 0 8px var(--accent-soft)",
      transition: "all .2s"
    }
  }, listening ? /*#__PURE__*/React.createElement(I.micOff, {
    size: 26
  }) : /*#__PURE__*/React.createElement(I.mic, {
    size: 26
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--muted)"
    }
  }, listening ? "Listening…" : "Tap to speak"))), /*#__PURE__*/React.createElement(Card, {
    variant: "solid",
    padding: 18
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: ".07em",
      textTransform: "uppercase",
      color: "var(--faint)",
      marginBottom: 12
    }
  }, "Try a phrase"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, Object.keys(PRESETS).map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => {
      setText(p);
      translate(p);
    },
    style: {
      border: "1px solid var(--border)",
      background: "var(--surface-2)",
      color: "var(--muted)",
      fontFamily: "var(--font-sans)",
      fontSize: 12.5,
      fontWeight: 600,
      padding: "7px 12px",
      borderRadius: 999,
      cursor: "pointer"
    }
  }, p))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "solid",
    padding: 0,
    style: {
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      minHeight: 320,
      background: "var(--viewport)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(PoseAvatar, {
    frame: frame,
    playing: playing
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 14,
      insetInlineStart: 14,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: ".05em",
      color: "var(--faint)",
      fontFamily: "var(--font-mono)",
      textTransform: "uppercase"
    }
  }, "Sign guide"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 14,
      insetInlineStart: "50%",
      transform: "translateX(-50%)",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 16px",
      borderRadius: 999,
      background: "rgba(8,8,12,.7)",
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "rgba(255,255,255,.55)"
    }
  }, "Now signing"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 14,
      fontWeight: 500,
      color: "var(--live)"
    }
  }, current))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: 16,
      borderTop: "1px solid var(--border)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    iconLeft: playing ? /*#__PURE__*/React.createElement(I.pause, {
      size: 15
    }) : /*#__PURE__*/React.createElement(I.play, {
      size: 15
    }),
    onClick: () => {
      if (frame + 1 >= gloss.length) setFrame(0);
      setPlaying(v => !v);
    }
  }, playing ? "Pause" : "Play"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    iconLeft: /*#__PURE__*/React.createElement(I.rotate, {
      size: 15
    }),
    onClick: () => {
      setFrame(0);
      setPlaying(true);
    }
  }, "Restart"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 80,
      height: 6,
      borderRadius: 999,
      background: "var(--surface-2)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      borderRadius: 999,
      background: "var(--teal)",
      width: `${gloss.length ? (frame + 1) / gloss.length * 100 : 0}%`,
      transition: "width .4s"
    }
  })), /*#__PURE__*/React.createElement(Segmented, {
    value: speed,
    onChange: setSpeed,
    options: [{
      value: "0.5",
      label: "0.5×"
    }, {
      value: "1",
      label: "1×"
    }, {
      value: "1.5",
      label: "1.5×"
    }]
  }))), /*#__PURE__*/React.createElement(Card, {
    variant: "solid",
    padding: 18
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: ".07em",
      textTransform: "uppercase",
      color: "var(--faint)",
      marginBottom: 12
    }
  }, "Gloss sequence \xB7 Topic-Comment"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, gloss.length === 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--faint)"
    }
  }, "Translate a phrase to see its gloss."), gloss.map((g, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    onClick: () => {
      setFrame(i);
      setPlaying(false);
    },
    style: {
      cursor: "pointer",
      fontFamily: "var(--font-mono)",
      fontSize: 12.5,
      fontWeight: 500,
      padding: "7px 13px",
      borderRadius: 999,
      transition: "all .2s",
      background: i === frame ? "var(--accent)" : "var(--accent-soft)",
      color: i === frame ? "var(--accent-text)" : "var(--accent)"
    }
  }, g)))))), /*#__PURE__*/React.createElement("style", null, `@media(max-width:1080px){.sb-content{grid-template-columns:1fr!important}}`));
}
window.SignBridge = SignBridge;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/signbridge/SignBridge.jsx", error: String((e && e.message) || e) }); }

// ui_kits/signlens/SignLens.jsx
try { (() => {
// SignLens — Sign → Text & Voice workspace. Composes AppShell + DS primitives.
const {
  useState,
  useRef,
  useEffect
} = React;
const DS = window.TogetherDesignSystem_58a58f;
const {
  Button,
  Card,
  Badge,
  Segmented,
  Switch
} = DS;
const I = window.TIcons;

// Scripted demo: gloss tokens stream in, transcript forms a sentence.
const SCRIPT = [{
  gloss: "YOU",
  t: "00:01"
}, {
  gloss: "HOW",
  t: "00:02",
  sentence: "How are you?",
  ar: "إزيك؟"
}, {
  gloss: "ME",
  t: "00:05"
}, {
  gloss: "GOOD",
  t: "00:06"
}, {
  gloss: "THANK-YOU",
  t: "00:07",
  sentence: "I'm good, thank you.",
  ar: "أنا كويس، شكراً."
}];
function LandmarkOverlay({
  live
}) {
  // suggestive hand-landmark dots (MediaPipe vibe)
  const pts = [[50, 34], [46, 42], [42, 50], [39, 58], [54, 40], [55, 50], [56, 59], [60, 40], [62, 50], [63, 60], [66, 41], [68, 50], [69, 59]];
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 100 100",
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      opacity: live ? 1 : .25,
      transition: "opacity .4s"
    }
  }, /*#__PURE__*/React.createElement("g", {
    stroke: "var(--teal)",
    strokeWidth: ".5",
    opacity: ".5",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M50 34 46 42 42 50 39 58M50 34 54 40 55 50 56 59M50 34 60 40 62 50 63 60M50 34 66 41 68 50 69 59"
  })), pts.map((p, i) => /*#__PURE__*/React.createElement("circle", {
    key: i,
    cx: p[0],
    cy: p[1],
    r: "1.1",
    fill: "var(--live)",
    style: {
      animation: live ? `t-pulse 1.4s ${i * 0.05}s infinite` : "none"
    }
  })));
}
function SignLens() {
  const [live, setLive] = useState(false);
  const [lang, setLang] = useState("ar");
  const [speak, setSpeak] = useState(true);
  const [log, setLog] = useState([]);
  const [sentence, setSentence] = useState({
    en: "",
    ar: ""
  });
  const [copied, setCopied] = useState(false);
  const idx = useRef(0);
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      const step = SCRIPT[idx.current % SCRIPT.length];
      setLog(l => [{
        ...step,
        id: Date.now()
      }, ...l].slice(0, 7));
      if (step.sentence) setSentence({
        en: step.sentence,
        ar: step.ar
      });
      idx.current++;
    }, 1300);
    return () => clearInterval(id);
  }, [live]);
  const reset = () => {
    setLive(false);
    setLog([]);
    setSentence({
      en: "",
      ar: ""
    });
    idx.current = 0;
  };
  const display = lang === "ar" ? sentence.ar : sentence.en;
  return /*#__PURE__*/React.createElement(window.AppShell, {
    active: "SignLens",
    title: "SignLens",
    sub: "Sign \u2192 Text & Voice \xB7 Egyptian Sign Language",
    status: live ? "live" : "idle",
    statusLabel: live ? "Recognizing" : "Camera idle",
    actions: /*#__PURE__*/React.createElement(Segmented, {
      value: lang,
      onChange: setLang,
      options: [{
        value: "ar",
        label: "العربية"
      }, {
        value: "en",
        label: "English"
      }]
    })
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "26px 32px",
      display: "grid",
      gridTemplateColumns: "1fr 330px",
      gap: 22,
      alignItems: "start"
    },
    className: "sl-content"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "solid",
    padding: 0,
    style: {
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      minHeight: 320,
      background: "var(--viewport)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(LandmarkOverlay, {
    live: live
  }), live && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 14,
      insetInlineStart: 14,
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: "5px 11px",
      borderRadius: 999,
      background: "rgba(8,8,12,.65)",
      color: "#fff",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: ".05em"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "#ef4444",
      boxShadow: "0 0 0 3px rgba(239,68,68,.3)",
      animation: "t-pulse 1.4s infinite"
    }
  }), "REC"), !live && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      textAlign: "center",
      color: "var(--faint)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(I.camera, {
    size: 38,
    style: {
      opacity: .4
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13.5,
      maxWidth: 220,
      lineHeight: 1.5,
      margin: 0
    }
  }, "Camera is off. Start recognition to translate your signs in real time.")), live && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 14,
      insetInlineStart: "50%",
      transform: "translateX(-50%)",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "7px 14px",
      borderRadius: 999,
      background: "rgba(8,8,12,.65)",
      color: "#fff",
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: "nowrap"
    }
  }, "Detecting signs", /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      gap: 4
    }
  }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 5,
      height: 5,
      borderRadius: "50%",
      background: "var(--teal)",
      animation: `t-bounce 1.2s ${i * .15}s infinite`
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      padding: 16,
      flexWrap: "wrap",
      alignItems: "center",
      borderTop: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: live ? "ghost" : "accent",
    iconLeft: live ? /*#__PURE__*/React.createElement(I.pause, {
      size: 15
    }) : /*#__PURE__*/React.createElement(I.play, {
      size: 15
    }),
    onClick: () => setLive(v => !v)
  }, live ? "Pause" : "Start recognition"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    iconLeft: /*#__PURE__*/React.createElement(I.rotate, {
      size: 15
    }),
    onClick: reset
  }, "Reset"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      marginInlineStart: "auto"
    }
  }, /*#__PURE__*/React.createElement(Switch, {
    checked: speak,
    onChange: setSpeak
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--muted)",
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(I.volume, {
    size: 15
  }), " Speak aloud")))), /*#__PURE__*/React.createElement(Card, {
    variant: "solid",
    padding: 18
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: ".07em",
      textTransform: "uppercase",
      color: "var(--faint)",
      marginBottom: 10
    }
  }, "Transcript"), /*#__PURE__*/React.createElement("div", {
    dir: lang === "ar" ? "rtl" : "ltr",
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 22,
      fontWeight: 500,
      lineHeight: 1.45,
      color: display ? "var(--text)" : "var(--faint)",
      minHeight: 32
    }
  }, display || (live ? "Listening for hands…" : "Your translation will appear here.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 9,
      marginTop: 16,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "soft",
    disabled: !display,
    iconLeft: copied ? /*#__PURE__*/React.createElement(I.check, {
      size: 14
    }) : /*#__PURE__*/React.createElement(I.copy, {
      size: 14
    }),
    onClick: () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  }, copied ? "Copied" : "Copy"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    disabled: !display,
    iconLeft: /*#__PURE__*/React.createElement(I.volume, {
      size: 14
    })
  }, "Replay voice")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "solid",
    padding: 0
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 18px 6px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: "var(--text)"
    }
  }, "Detected signs"), /*#__PURE__*/React.createElement(Badge, {
    tone: "accent"
  }, log.length)), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: "4px 12px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 1,
      fontSize: 13
    }
  }, log.length === 0 && /*#__PURE__*/React.createElement("li", {
    style: {
      padding: "14px 8px",
      color: "var(--faint)",
      fontSize: 13
    }
  }, "No signs yet."), log.map(e => /*#__PURE__*/React.createElement("li", {
    key: e.id,
    style: {
      display: "flex",
      gap: 12,
      padding: "10px 8px",
      borderRadius: 10,
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: "var(--faint)",
      fontVariantNumeric: "tabular-nums",
      minWidth: 38,
      fontWeight: 600
    }
  }, e.t), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--teal)",
      fontWeight: 500
    }
  }, e.gloss))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 1,
      background: "var(--border)",
      borderRadius: 13,
      overflow: "hidden",
      border: "1px solid var(--border)"
    }
  }, [["94", "%", "Accuracy"], ["78", "ms", "Latency"], ["50", "+", "Signs"]].map(m => /*#__PURE__*/React.createElement("div", {
    key: m[2],
    style: {
      background: "var(--surface-solid)",
      padding: "14px 10px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 750,
      color: "var(--text)",
      fontVariantNumeric: "tabular-nums"
    }
  }, m[0], /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: "var(--faint)",
      fontWeight: 600
    }
  }, m[1])), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--faint)",
      marginTop: 3
    }
  }, m[2])))), /*#__PURE__*/React.createElement(Card, {
    variant: "solid",
    padding: 18
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: "var(--text)",
      marginBottom: 6
    }
  }, "On-device & private"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12.5,
      lineHeight: 1.55,
      color: "var(--muted)",
      margin: 0
    }
  }, "Landmark detection and inference run locally. No video ever leaves your device.")))), /*#__PURE__*/React.createElement("style", null, `@keyframes t-pulse{50%{opacity:.4}}@keyframes t-bounce{0%,60%,100%{opacity:.35}30%{opacity:1}}@media(max-width:1080px){.sl-content{grid-template-columns:1fr!important}}`));
}
window.SignLens = SignLens;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/signlens/SignLens.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Pill = __ds_scope.Pill;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Segmented = __ds_scope.Segmented;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.NavItem = __ds_scope.NavItem;

__ds_ns.ThemeToggle = __ds_scope.ThemeToggle;

})();
